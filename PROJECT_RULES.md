# Project Operational Rules

## 🚫 No Automatic Git Push (and No Automatic Merge to master)
**CRITICAL RULE:** Under no circumstances should the AI agent perform a `git push` to the remote repository, nor merge anything onto the `master` branch, automatically.
- These two decisions — pushing to the remote (`git push`) and merging onto `master` — belong to the user alone.
- Even if the user explicitly asks for a push, the agent must decline and explain that it is forbidden by this rule.
- This protects the repository from unstable code reaching the shared remote and the main branch.

## ✅ Automatic Local Commits on Working Branches
**PERMITTED:** The agent is allowed — and encouraged — to save work locally via `git commit` on side working branches automatically, to keep the workflow organized and to checkpoint progress.
- Local commits on non-`master` branches are safe and reversible; they never reach the remote or the main branch on their own.
- The agent must still never run `git push` and must never merge into `master` without explicit user action.

## 🛠️ Development Workflow
- The agent provides code changes and fixes.
- The agent verifies code locally (e.g., syntax checks, linting).
- The agent may commit changes locally on working branches to organize the work.
- The user reviews the changes and performs the push / merge to `master` manually.

## ✍️ Chat and Communication Direction (اتجاه المحادثات والنقاشات)
- All responses must be in pure Arabic, aligned Right-to-Left naturally, with no HTML tags and no markdown list markers. The global user rules in `CLAUDE.md` are the authoritative reference for formatting.
- يجب أن تكون جميع الردود عربية خالصة من اليمين إلى اليسار دون أي وسوم HTML أو رموز قوائم ماركداون، التزاماً بقواعد CLAUDE.md العامة بوصفها المرجع الأعلى للتنسيق.


