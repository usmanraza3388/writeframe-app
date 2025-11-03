import { useNotifications } from '../contexts/NotificationContext';

export const useToastNotifications = () => {
  const { addNotification } = useNotifications();

  const showSuccess = (title: string, message: string, action?: any) => {
    addNotification({
      type: 'success',
      title,
      message,
      action,
      duration: 4000
    });
  };

  const showError = (title: string, message: string, action?: any) => {
    addNotification({
      type: 'error', 
      title,
      message,
      action,
      duration: 6000
    });
  };

  const showWarning = (title: string, message: string, action?: any) => {
    addNotification({
      type: 'warning',
      title,
      message,
      action,
      duration: 5000
    });
  };

  const showInfo = (title: string, message: string, action?: any) => {
    addNotification({
      type: 'info',
      title,
      message,
      action,
      duration: 4000
    });
  };

  // Pre-built notifications for common actions
  const showPublishSuccess = (contentType: string) => {
    showSuccess(
      'Published Successfully! 🎉',
      `Your ${contentType} is now live and visible to the community.`,
      {
        label: 'View in Feed',
        onClick: () => window.location.href = '/home-feed'
      }
    );
  };

  const showDraftSaved = (contentType: string) => {
    showSuccess(
      'Draft Saved 💾',
      `Your ${contentType} has been saved as draft. You can publish it later.`
    );
  };

  const showDeleteSuccess = (contentType: string) => {
    showSuccess(
      'Deleted Successfully 🗑️',
      `Your ${contentType} has been permanently deleted.`
    );
  };

  const showUpdateSuccess = (contentType: string) => {
    showSuccess(
      'Updated Successfully ✨', 
      `Your ${contentType} has been updated.`
    );
  };

  const showNetworkError = () => {
    showError(
      'Connection Error 📡',
      'Unable to connect. Please check your internet connection and try again.',
      {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    );
  };

  const showGenericError = (action: string) => {
    showError(
      'Something Went Wrong',
      `There was an error ${action}. Please try again.`
    );
  };

  return {
    // Basic notification types
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Pre-built common notifications
    showPublishSuccess,
    showDraftSaved,
    showDeleteSuccess,
    showUpdateSuccess,
    showNetworkError,
    showGenericError
  };
};