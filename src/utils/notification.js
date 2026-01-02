export const showToast = (message, type = 'info', options = {}) => {
  // Create toast container if doesn't exist
  let toastContainer = document.getElementById('toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toast = document.createElement('div')
  const toastId = `toast-${Date.now()}`

  // Set styles based on type
  const typeStyles = {
    success: {
      background: '#10b981',
      color: 'white'
    },
    error: {
      background: '#ef4444',
      color: 'white'
    },
    warning: {
      background: '#f59e0b',
      color: 'white'
    },
    info: {
      background: '#3b82f6',
      color: 'white'
    }
  }

  const styles = typeStyles[type] || typeStyles.info

  toast.id = toastId
  toast.style.cssText = `
    background: ${styles.background};
    color: ${styles.color};
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `

  // Add icon
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  toast.innerHTML = `
    <span style="font-size: 18px;">${icons[type] || icons.info}</span>
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: ${styles.color};
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
    ">×</button>
  `

  // Add animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  if (!document.querySelector('style[data-toast-animations]')) {
    style.setAttribute('data-toast-animations', 'true')
    document.head.appendChild(style)
  }

  // Add to container
  toastContainer.appendChild(toast)

  // Auto remove after timeout
  const timeout = options.timeout || 3000
  setTimeout(() => {
    const element = document.getElementById(toastId)
    if (element) {
      element.style.animation = 'slideIn 0.3s ease-out reverse'
      setTimeout(() => element.remove(), 300)
    }
  }, timeout)
}