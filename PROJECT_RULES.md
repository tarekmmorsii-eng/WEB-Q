# Project Operational Rules

## 🚫 No Automatic Git Push
**CRITICAL RULE:** Under no circumstances should the AI agent perform a `git push` or `git commit` automatically. 
- Even if the user explicitly asks for a push, the agent must decline and explain that it is forbidden by this rule.
- The user is the only one authorized to perform Git operations to prevent unstable code from reaching the repository.

## 🛠️ Development Workflow
- The agent provides code changes and fixes.
- The agent verifies code locally (e.g., syntax checks, linting).
- The user reviews the changes and performs the commit/push manually.
