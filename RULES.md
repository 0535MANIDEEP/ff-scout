# Final Circle — Working Rules

Apply the 10 Golden Rules to this project, with one adaptation per rule.
These are inversions of aspiration into practice — audits, not philosophy.

Every rule below has: what it means here, and the failure mode it prevents.

## 1. Human first, AI second
AI supplies boilerplate, tests and suggestions; the human decides what the
product *believes*. Every UI decision, color, radius and motion timing is
reviewed by you. No generated copy ships without a human read-through.

**Prevents:** "AI invented the whole app and nobody can defend it in an interview."

## 2. Intent must be readable in the repo
The README states the product's one sentence. Every commit message states intent.
If a reviewer opens the repo, the answer to "what is this for?" is obvious in 60 seconds.

**Prevents:** a 10,000-line black box that nobody (including you) understands.

## 3. One pain point, one screen, one happy path
Every feature must pass the 3-line test:
- What single pain does this remove?
- Who pays (or comes) because of it?
- What happens if I cut it entirely?

If any answer is fuzzy, cut it. This is the opposite of feature addition during ideation.

**Prevents:** the Capability-of-the-Week disease.

## 4. Rules live in `AGENTS.md` + `CONTRIBUTING.md`, not in chat history
The AI's memory is ephemeral; the repo is forever. Any decision we make gets written
to disk the same day. This is the "single source of truth" rule.

**Prevents:** starting over every 8 sessions because the AI forgot what was agreed.

## 5. Decompose until a task is atomic and reviewable
No PR bigger than ~40 files. Every task has one success criterion, one test list, one rollback.

**Prevents:** the 18,000-line refactor that collapses in production.

## 6. Ship small, deploy often, rollback ready
Every merge is deployable; every deploy has a one-command rollback.
If you cannot roll back, you cannot ship.
Trust `main` means "runnable", not "finished".

**Prevents:** the long-lived branch that cannot be merged.

## 7. Verify before bragging
Every claim about the product has (a) a screenshot, (b) a URL, (c) a command that reproduces the claim.
No adjectives in README. Only things a reviewer can click.

**Prevents:** blown up lies — the very thing you are fixing in your own portfolio.

## 8. Emotionally literate design, not gamified manipulation
Dopamine via progress visibility, not via shame/fear/unlocks.
Progress bars that show real state. Celebrations at real milestones (first upload, first verify),
not fake streaks or fake scarcity. Reduced-motion respected.

**Prevents:** dark-pattern anti-human UX that collapses on the first hard month.

## 9. Security is part of DOD, not an afterthought
Auth, rate limits, input validation, SQL parameterization, env var protection, and
.gitignore hygiene are done as we type, not in a Thursday audit sprint.

**Prevents:** the first Data Breach being discovered by a user thread.

## 10. Done means: tested + deployed + reachable + documented
A screen that isn't reachable from the nav isn't done.
A feature without the README updated isn't done.
A Vercel deploy that breaks is the team's problem, not the reviewer's.

**Prevents:** the graveyard of "works on my machine" repos.
