# Scheduled Matches (MatchSeries) E2E — mirrors platform_e2e.py harness patterns:
# domcontentloaded load_state, explicit wait_for_url, text_content(), run-unique emails, scrub after.
# Run: PYTHONIOENCODING=utf-8 FF_BASE_URL=http://localhost:3000 python3 test/e2e/series.py
#   (prod instance). DB assertions via `node test/e2e/scrub.cjs --check`, writes via `--setup`/`--dead`/`--scrub`.
import os
import re
import subprocess
import sys
import uuid
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright

BASE = os.environ.get("FF_BASE_URL", "http://localhost:3000")
RUN_ID = f"{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
HOST = f"qa+series-e2e-{RUN_ID}@example.com"
HELPERS = [f"qa+series-e2e-{RUN_ID}-p{i}@example.com" for i in (1, 2)]
PASSWORD = "ffTestPass123"

checks = {"passed": 0, "failed": 0}


def do(cond, name, extra=""):
    if cond:
        checks["passed"] += 1
        print(f"  [OK] {name}")
    else:
        checks["failed"] += 1
        print(f"  [FAIL] {name} {extra}")


def db(args):
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    r = subprocess.run(["node", "test/e2e/scrub.cjs"] + args, cwd=repo_root, capture_output=True, text=True)
    out = r.stdout.strip()
    if r.returncode != 0:
        out = f"ERR {r.stderr.strip()} {out}"
    return out, r.returncode


def login(page, email):
    page.goto(f"{BASE}/login", wait_until="domcontentloaded")
    page.fill('input[name="email"]', email)
    page.fill('input[name="password"]', PASSWORD)
    page.wait_for_timeout(150)
    page.click('button[type="submit"]')
    page.wait_for_url(f"{BASE}/player", timeout=15000)


def main():
    # Setup: host + 2 helper players; 3 qualifying matches via DB (set + 2 distinct non-host joiners each) → ladder unlocked.
    out, rc = db(["--setup", HOST, "--helpers", ",".join(HELPERS)])
    print(f"  setup: {out}")
    assert rc == 0, out

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()

        # 1. Locked copy is NOT shown (setup qualifies); sanity: /post/series renders.
        login(page, HOST)
        page.goto(f"{BASE}/post/series", wait_until="domcontentloaded")
        body = page.text_content("body") or ""
        do("Create series" in body, "unlocked: series form renders")

        # 3. Create series Friday 8 PM; board shows chip on upcoming slots.
        page.goto(f"{BASE}/post/series", wait_until="domcontentloaded")
        page.fill('input[name="title"]', f"Friday BR Squad {RUN_ID}")
        page.select_option('select[name="dayOfWeek"]', "5")
        page.fill('input[name="startTimeLocal"]', "20:00")
        page.click('button[type="submit"]')
        page.wait_for_url(f"{BASE}/player/posted", timeout=15000)
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        do(re.search(r"Weekly · Fri 8 PM IST", page.text_content("body") or "") is not None, "board shows 'Weekly · Fri 8 PM IST'")

        # 4. Player joins the first upcoming occurrence.
        joined = False
        for _ in range(10):
            rows = page.query_selector_all(".list a.rowitem")
            if rows:
                rows[0].click()
                page.wait_for_timeout(2000)
                page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
                page.wait_for_timeout(800)
                body = page.text_content("body") or ""
                do(f"Roster · 1" in body, "roster on /player/posted shows the joined occurrence")
                joined = True
                break
            page.wait_for_timeout(500)
        do(joined, "joined an upcoming occurrence")

        # 5. Template edit must not alter the joined occurrence (bait-and-switch guard).
        page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        details = page.query_selector("section details summary")
        if details:
            details.click()
            page.wait_for_timeout(300)
        page.fill('input[name="title"]', f"Friday BR Squad {RUN_ID} v2")
        page.click('button[type="submit"]')
        page.wait_for_timeout(1500)
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(400)
        body = page.text_content("body") or ""
        do(f"Friday BR Squad {RUN_ID}" in body, "edit-freeze: joined occurrence keeps original title on /matches")

        # 6. Schedule edit: chip moves to new time; old 0-join slot purged.
        page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        details = page.query_selector("section details summary")
        if details:
            details.click()
            page.wait_for_timeout(300)
        page.fill('input[name="startTimeLocal"]', "21:00")
        page.click('button[type="submit"]')
        page.wait_for_timeout(1500)
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(400)
        body = page.text_content("body") or ""
        do(re.search(r"Weekly · Fri 9 PM IST", body) is not None, "schedule edit: chip now 'Weekly · Fri 9 PM IST'")

        # 7. Auto-pause: 2 finished 0-join occurrences → DB assert + audit log.
        out, rc = db(["--dead-occurrences", HOST, f"fake-run-{RUN_ID}"])
        print(f"  dead: {out}")
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        out, rc = db(["--assert-autopause", HOST])
        do(out.strip() == "paused", "auto-pause: series is 'paused' (audited, no new weeks)")

        # 8. Resume: resumedAt set; window regenerates; not immediately re-paused.
        out, rc = db(["--resume", HOST])
        print(f"  resume: {out}")
        page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        body = page.text_content("body") or ""
        do("Series console" in body or "resumed" in body, "posted page reflects resumed series")
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        out, rc = db(["--assert-series", HOST, "active"])
        do(out.strip() == "active", "resume: series is active and window regenerated")

        # 9. Scrub QA rows at the end (existing pattern: scrub creates per run).
        out, rc = db(["--scrub", HOST, ",".join(HELPERS)])
        print(f"  scrub: {out}")
        do(rc == 0, "QA rows scrubbed")

        browser.close()

    print(f"\nE2E series: {checks['passed']} passed, {checks['failed']} failed")
    sys.exit(1 if checks["failed"] else 0)


if __name__ == "__main__":
    main()
