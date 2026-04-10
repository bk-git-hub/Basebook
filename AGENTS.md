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
- Never include unrelated files in a commit.
- Untracked files are not staged. Do not describe them as staged unless the staged file list has been explicitly checked.
- Before every commit, explicitly verify:
- staged files
- unstaged files
- untracked files
- If any unrelated file appears in the staged set, stop and fix the staging set before committing.
- Prefer path-specific commits for small changes, such as `git commit --only <path>`, when the repository contains other in-progress work.
- After every commit, immediately verify the committed file list before reporting success.

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

## Single-Repo Main-Only Rule
- All active agents work in the same repository at `C:\Users\bksoft\Documents\Sweetbook`.
- Do not create, require, or rely on git worktrees for day-to-day collaboration.
- Do not require branch switching for normal agent work.
- The operational source of truth is the local `main` branch in the shared repository.
- Parallel agents must coordinate by file ownership and decision logs, not by separate worktrees.
- If a coordination rule conflicts with an older worktree-based note, follow this section.

## Agent Access Boundaries
- All agents work from the shared local `main` branch, but write access is restricted by role.
- Treat every path outside the role's write scope as read-only unless the user explicitly overrides the rule.
- Do not make "small exception" edits outside the assigned write scope without explicit user approval.
- If an agent is blocked by another area's file ownership, report the blocker and request the owning agent or CTO to make the change.

## Agent Write Scope
- `CTO`
- May coordinate across the whole repository when required for integration, rule updates, or conflict resolution.
- `DevOps`
- Read-only across the repository unless the user explicitly grants a temporary write task.
- `Frontend`
- Write access: `apps/web/**`
- Read-only: every other path in the repository
- `Backend`
- Write access: `apps/api/**`
- Read-only: every other path in the repository
- `QA`
- Write access: `tests/**`
- Read-only: every other path in the repository

## Cross-Area Change Rule
- If frontend work requires backend changes, the frontend agent must leave a clear blocker note instead of editing `apps/api/**`.
- If backend work requires frontend changes, the backend agent must leave a clear blocker note instead of editing `apps/web/**`.
- If QA finds an issue that requires product code changes in `apps/web/**`, QA should document the failure and request a frontend or CTO follow-up instead of changing the app code directly.
- If DevOps finds a needed configuration or pipeline change, DevOps should document the recommendation and wait for explicit write approval before editing files.
- Agents must never cross their write boundary first and explain later. The boundary must be respected at all times.

## Inter-Agent Communication Rule
- Agents do not communicate directly with each other through hidden state or implicit assumptions.
- Cross-agent coordination must happen through:
- direct notice to the user in chat
- the shared coordination log at `docs/AGENT_SYNC.md`
- the owning area's decision log or milestone log when relevant
- If an agent is blocked by another area's ownership, it must do all of the following in the same work cycle:
- stop before editing the other area's files
- tell the user what is blocked
- add or update an entry in `docs/AGENT_SYNC.md`
- wait for the owning agent or CTO to handle the requested change

## Shared Coordination Log
- Use `docs/AGENT_SYNC.md` as the shared handoff, blocker, and readiness log for all agents.
- Every agent must read `docs/AGENT_SYNC.md` at the start of its work.
- Every agent must update `docs/AGENT_SYNC.md` when:
- a task is ready for another agent
- a blocker is discovered
- another area must change something
- an integration dependency becomes available
- a previously open blocker is resolved
- Entries in `docs/AGENT_SYNC.md` must be factual and append-only. Do not silently rewrite another agent's log entry.
- Each sync entry must include at minimum:
- id
- date
- time
- source role
- target role
- type (`handoff`, `blocker`, `request`, `ready`, `resolved`)
- related area or path
- summary
- required action
- user notified (`yes` or `no`)
- status

## Development Lifecycle
- All development follows this sequence:
- `plan -> technical meeting with user -> implementation -> test -> review -> user verification`
- Do not skip directly from planning to implementation for meaningful work.
- Do not treat implementation as complete until testing and review have happened.

## User Verification Gate
- All completed development must pass explicit user verification.
- Before user verification, do not present work as final, complete, merged, or ready to move on from.
- If a feature is implemented and tested but not yet verified by the user, describe it as awaiting user validation.
- Do not merge milestone-level work into a "done" state without user confirmation.

## Decision Logging
- Technical decisions made during user meetings must be recorded in the area-owned decision log.
- Use:
- `apps/web/DECISIONS.md` for frontend and frontend QA decisions
- `apps/api/DECISIONS.md` for backend decisions
- `docs/DECISIONS.md` is archive-only and should not receive new decision entries.
- If a role cannot write to its area's decision log because of the current access boundary, it should hand the decision note to the owning agent or CTO for recording.
- Use a structured format that includes at minimum:
- decision id
- date
- time
- agenda
- decision
- rationale
- impact
- owner
- status
- If a later conversation changes a prior decision, add a new decision entry instead of silently rewriting history.

## Milestone Logging
- Maintain milestone logs separately for frontend and backend.
- Use:
- `docs/milestones/frontend.md`
- `docs/milestones/backend.md`
- Log meaningful progress changes such as milestone start, milestone completion, blockers, scope changes, and integration readiness.
- Keep milestone entries factual and concise.
