# Sweetbook Take-Home Collaboration Rules

## Scope
- This workspace is for the Sweetbook take-home assignment planning and implementation.
- The final deliverable includes both the web app and four written responses.

## Submission Question Reference
- Source brief: `스위트북_개발과제_안내문.pdf`
- The four written responses are about:
- Q1. How the assignment was executed from start to finish.
- Q2. Honest impressions after using the Book Print API or SDK.
- Q3. The single most important decision made during the assignment.
- Q4. A failure or problem experienced while using AI tools, and how it was handled.
- Use these summaries to decide whether a discussion belongs in submission notes.

## Durable Rule vs Working Notes
- `AGENTS.md` stores durable collaboration rules only.
- Do not put draft answer content for the written questions into `AGENTS.md`.
- If a discussion may be useful for the written questions, ask whether to save it first.
- Save approved notes in a separate working file such as `SUBMISSION_NOTES.md`.

## Written Question Capture Rule
- Before recording anything that could become material for the four written questions, explicitly ask whether it should be saved as submission notes.
- This includes process logs, API impressions, key decisions, tradeoffs, frustrations, and AI-tool failures.
- If the user says no, keep it in chat only and do not persist it to a file.

## Secret Handling
- Never copy secrets from `apikey.txt`, environment variables, or future `.env` files into notes, README, commits, screenshots, or prompts.
- When discussing setup, refer to secrets generically as "Sandbox API key".

## Useful Capture Categories
- For question 1, prefer concise timeline notes: approach, order of work, tools, and time allocation.
- For question 2, prefer concrete API friction notes: what was easy, confusing, missing, or worth redesigning.
- For question 3, capture decisions in this shape: situation, options, rationale, result.
- For question 4, capture AI issues in this shape: context, bad output, how it was detected, how it was resolved.

## Communication Preference
- Keep rough brainstorming separate from polished submission wording.
- When a note is saved, prefer factual bullets over final-form prose so the final answers stay honest and easy to rewrite later.

## Commit Discipline
- Every meaningful change should end with a git commit.
- Commit in feature-sized slices; do not batch unrelated frontend, backend, docs, and refactor work into one commit.
- Prefer one functional change per commit, such as one API endpoint, one UI flow, one contract update, or one documentation update.
- If a change grows too large to explain in one sentence, split it into smaller commits.

## Commit Prefix Rules
- Use commit messages in the format: `<prefix>: <summary>`.
- Allowed prefixes:
- `feat`: new user-facing or developer-facing functionality
- `fix`: bug fix or broken behavior correction
- `refactor`: structural improvement without intended behavior change
- `docs`: documentation-only change
- `test`: tests added or updated
- `chore`: setup, tooling, configuration, or maintenance work
- `design`: visual or UX-only improvement

## Commit Planning Rule
- Before starting a larger task, think in terms of the commit slices that should exist at the end.
- For parallel frontend/backend work, each side should commit independently using the same prefix rules.
- Contract changes should usually land in their own commit unless they are inseparable from the implementation they unblock.
- Avoid "catch-all" commits like `feat: update project` or `fix: various fixes`.
