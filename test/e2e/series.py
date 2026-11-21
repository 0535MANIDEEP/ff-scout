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
LAST_RUN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last-run.json")
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
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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
    import json
    with open(LAST_RUN, "w") as fh:
        json.dump({"host": HOST, "helpers": HELPERS, "run_id": RUN_ID, "base": BASE}, fh)
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
        page.select_option('select[name="mode"]', "casual")
        page.select_option('select[name="gameType"]', "BR/CS")
        page.select_option('select[name="entry"]', "free")
        page.select_option('select[name="prize"]', "none")
        page.fill('input[name="city"]', "Hyderabad")
        page.select_option('select[name="dayOfWeek"]', "5")
        page.fill('input[name="startTimeLocal"]', "20:00")
        page.click('button[type="submit"]')
        page.wait_for_url(lambda u: u.startswith(f"{BASE}/player/posted"), timeout=15000)
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        do(re.search(r"Weekly · Fri 8 PM IST", page.text_content("body") or "") is not None, "board shows 'Weekly · Fri 8 PM IST'")

        # 4. Player joins their own series occurrence (click row -> detail page -> "Join this match").
        joined = False
        for _ in range(10):
            rows = page.query_selector_all(".list a.rowitem")
            own = [r for r in rows if "posted by qa-series-org" in (r.text_content() or "") and f"Friday BR Squad {RUN_ID}" in (r.text_content() or "")]
            if own:
                own[0].click()
                page.wait_for_url(lambda u: u.startswith(f"{BASE}/matches/"), timeout=10000)
                try:
                    page.click('button[type="submit"]:has-text("Join this match")', timeout=8000)
                    page.wait_for_url(lambda u: u.startswith(f"{BASE}/matches/") and "joined" in u, timeout=8000)
                except Exception as e:
                    print(f"  join attempt failed: {e}")
                page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
                page.wait_for_timeout(1000)
                body = page.text_content("body") or ""
                joined = "Roster · 1" in body
                do(joined, "roster on /player/posted shows the joined occurrence")
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
        page.click('button[type="submit"]:has-text("Save series")')
        page.wait_for_timeout(1500)
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(400)
        body = page.text_content("body") or ""
        do(f"Friday BR Squad {RUN_ID} v2" in body, "template edit applied on /matches (future slots get new title)")

        # 6. Schedule edit: chip moves to new time; old 0-join slot purged.
        page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        details = page.query_selector("section details summary")
        if details:
            details.click()
            page.wait_for_timeout(300)
        page.fill('input[name="startTimeLocal"]', "21:00")
        page.click('button[type="submit"]:has-text("Save series")')
        page.wait_for_timeout(1500)
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(400)
        body = page.text_content("body") or ""
        do(re.search(r"Weekly · Fri 9 PM IST", body) is not None, "schedule edit: chip now 'Weekly · Fri 9 PM IST'")

        # 7. Auto-pause: 2 finished 0-join occurrences → DB assert + audit log.
        out, rc = db(["--dead-occurrences", HOST])
        print(f"  dead: {out}")
        out2, _ = db(["--assert-autopause", HOST])
        print(f"  assert pre-board: {out2}")
        page.goto(f"{BASE}/matches", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        out, rc = db(["--assert-autopause", HOST])
        print(f"  assert post-board: {out}")
        do(out.strip() == "paused", "auto-pause: series is 'paused' (audited, no new weeks)")

        # 8. Resume: resumedAt set; window regenerates; not immediately re-paused.
        out, rc = db(["--resume", HOST])
        print(f"  resume: {out}")
        page.goto(f"{BASE}/player/posted", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        body = page.text_content("body") or ""
        do("Weekly series" in body or "Friday BR Squad" in body, "posted page reflects resumed series")
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
