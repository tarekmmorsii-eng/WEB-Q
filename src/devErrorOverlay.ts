// عرض شريط الأخطاء التراكبي أثناء التطوير فقط.
// في النسخة الإنتاجية يُستثنى هذا الملف تلقائيًا بفضل شرط import.meta.env.DEV،
// فلا يظهر للمستخدم النهائي أي شريط أحمر أو أصفر.
if (import.meta.env.DEV) {
  window.addEventListener('error', function (event) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = '#fee2e2';
    errorDiv.style.color = '#991b1b';
    errorDiv.style.padding = '1rem';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.borderBottom = '1px solid #ef4444';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.wordBreak = 'break-all';
    errorDiv.style.maxHeight = '40vh';
    errorDiv.style.overflowY = 'auto';
    var errName = event.error ? (event.error.name + ': ' + event.error.message) : event.message;
    var errStack = event.error && event.error.stack ? '\n' + event.error.stack.substring(0, 500) : '';
    errorDiv.textContent = 'Error: ' + errName + '\nat ' + event.filename + ':' + event.lineno + errStack;
    document.body.appendChild(errorDiv);
    console.error('Global Error:', event.error);
  });

  window.addEventListener('unhandledrejection', function (event) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = '#fef3c7';
    errorDiv.style.color = '#92400e';
    errorDiv.style.padding = '1rem';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.borderBottom = '1px solid #f59e0b';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.wordBreak = 'break-all';
    errorDiv.style.maxHeight = '40vh';
    errorDiv.style.overflowY = 'auto';
    var reason = event.reason;
    var reasonText = reason instanceof Error ? (reason.name + ': ' + reason.message + (reason.stack ? '\n' + reason.stack.substring(0, 500) : '')) : String(reason);
    errorDiv.textContent = 'Unhandled Promise: ' + reasonText;
    document.body.appendChild(errorDiv);
    console.error('Unhandled Rejection:', event.reason);
  });
}
