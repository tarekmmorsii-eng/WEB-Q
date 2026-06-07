# Project Operational Rules

## 🚫 No Automatic Git Push
**CRITICAL RULE:** Under no circumstances should the AI agent perform a `git push` or `git commit` automatically. 
- Even if the user explicitly asks for a push, the agent must decline and explain that it is forbidden by this rule.
- The user is the only one authorized to perform Git operations to prevent unstable code from reaching the repository.

## 🛠️ Development Workflow
- The agent provides code changes and fixes.
- The agent verifies code locally (e.g., syntax checks, linting).
- The user reviews the changes and performs the commit/push manually.

## ✍️ Chat and Communication Direction (اتجاه المحادثات والنقاشات)
- **CRITICAL RULE:** All responses, chats, and discussions sent to the user must be formatted and structured from Right-to-Left (RTL) to ensure readability.
- يجب كتابة جميع الردود والمناقشات باللغة العربية وتغليفها بوسم `<div dir="rtl">` لضمان محاذاتها من اليمين إلى اليسار بشكل صحيح في واجهة المستخدم.
- **Example Usage:**
  ```html
  <div dir="rtl">
  مرحباً بك! هنا الرد الخاص بي...
  </div>
  ```


