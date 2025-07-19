import Swal from 'sweetalert2';

// Custom SweetAlert2 configuration with app colors
const customSwal = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'custom-toast',
    title: 'custom-toast-title',
    content: 'custom-toast-content',
    icon: 'custom-toast-icon'
  },
  background: '#ffffff',
  color: '#333333',
  showCloseButton: true,
  iconColor: '#00b894'
});

// Success notification
export const showSuccess = (title, text = '') => {
  return customSwal.fire({
    icon: 'success',
    title: title,
    text: text,
    iconColor: '#00b894',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    customClass: {
      popup: 'custom-toast success-toast',
      title: 'success-title',
      content: 'success-content'
    }
  });
};

// Error notification
export const showError = (title, text = '') => {
  return customSwal.fire({
    icon: 'error',
    title: title,
    text: text,
    iconColor: '#e74c3c',
    background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f2 100%)',
    customClass: {
      popup: 'custom-toast error-toast',
      title: 'error-title',
      content: 'error-content'
    }
  });
};

// Warning notification
export const showWarning = (title, text = '') => {
  return customSwal.fire({
    icon: 'warning',
    title: title,
    text: text,
    iconColor: '#f39c12',
    background: 'linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)',
    customClass: {
      popup: 'custom-toast warning-toast',
      title: 'warning-title',
      content: 'warning-content'
    }
  });
};

// Info notification
export const showInfo = (title, text = '') => {
  return customSwal.fire({
    icon: 'info',
    title: title,
    text: text,
    iconColor: '#3498db',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
    customClass: {
      popup: 'custom-toast info-toast',
      title: 'info-title',
      content: 'info-content'
    }
  });
};

// Loading notification
export const showLoading = (title = 'Loading...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    background: '#ffffff',
    color: '#333333',
    customClass: {
      popup: 'loading-toast',
      title: 'loading-title'
    }
  });
};

// Confirmation dialog
export const showConfirmation = (title, text, confirmButtonText = 'Yes', cancelButtonText = 'Cancel') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#00b894',
    cancelButtonColor: '#e74c3c',
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    background: '#ffffff',
    color: '#333333',
    customClass: {
      popup: 'confirmation-dialog',
      title: 'confirmation-title',
      content: 'confirmation-content',
      confirmButton: 'custom-confirm-btn',
      cancelButton: 'custom-cancel-btn'
    },
    buttonsStyling: false
  });
};

// Close all notifications
export const closeAllNotifications = () => {
  Swal.close();
};
