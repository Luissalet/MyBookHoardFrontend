/**
 * Create a button element
 * @param {string} text - Button text
 * @param {string} className - CSS class name
 * @param {Function} onClick - Click handler function
 * @returns {HTMLButtonElement} Button element
 */
function createButton(text, className, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = className;
  btn.onclick = onClick;
  return btn;
}

/**
 * Show a temporary toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of message: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  const bgColor = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db';
  
  toast.style.cssText = `
    position: fixed;
    bottom: 320px;
    right: 20px;
    padding: 16px 24px;
    background: ${bgColor};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}