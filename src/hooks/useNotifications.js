import { useState, useEffect, useCallback, useRef } from 'react';
import { preferencesStorage } from '../utils/storage';

class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.checkPermission();
  }

  checkPermission() {
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      throw new Error(`Failed to request notification permission: ${error.message}`);
    }
  }

  show(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        ...options
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  isSupported() {
    return this.isSupported;
  }

  hasPermission() {
    return this.permission === 'granted';
  }

  canShowNotifications() {
    return this.isSupported && this.permission === 'granted';
  }
}

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationManagerRef = useRef(null);
  const scheduledNotificationsRef = useRef(new Map());

  // Initialize notification manager
  useEffect(() => {
    try {
      notificationManagerRef.current = new NotificationManager();
      setIsSupported(notificationManagerRef.current.isSupported());
      setPermission(notificationManagerRef.current.permission);

      // Load user preferences
      const userPreferences = preferencesStorage.loadPreferences();
      setPreferences(userPreferences);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!notificationManagerRef.current) {
      throw new Error('Notification manager not initialized');
    }

    try {
      const result = await notificationManagerRef.current.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await preferencesStorage.updatePreference('notifications', true);
        setPreferences(prev => ({ ...prev, notifications: true }));
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Show a notification
  const showNotification = useCallback((title, options = {}) => {
    if (!notificationManagerRef.current || !preferences?.notifications) {
      return null;
    }

    try {
      const notification = notificationManagerRef.current.show(title, {
        body: 'You have a reminder due soon!',
        tag: 'homework-reminder',
        renotify: true,
        ...options
      });

      if (notification) {
        // Handle click events
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (options.onClick) {
            options.onClick();
          }
        };
      }

      return notification;
    } catch (err) {
      console.error('Failed to show notification:', err);
      // Fallback to in-app notification
      showInAppNotification(title, options);
      return null;
    }
  }, [preferences]);

  // Show in-app notification (fallback)
  const showInAppNotification = useCallback((title, options = {}) => {
    // Create a simple in-app notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-semibold">${title}</div>
          <div class="text-sm opacity-90">${options.body || 'You have a reminder due soon!'}</div>
        </div>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);

    return notification;
  }, []);

  // Schedule a reminder notification
  const scheduleReminderNotification = useCallback((reminder, reminderTime, reminderTimeIndex) => {
    if (!reminderTime || reminderTime.sent) {
      return;
    }

    const now = new Date();
    const scheduledFor = new Date(reminderTime.scheduledFor);
    const delayMs = scheduledFor.getTime() - now.getTime();

    if (delayMs <= 0) {
      // Due time has passed, show notification immediately
      showNotification(
        `Reminder: ${reminder.title}`,
        {
          body: `Your ${reminder.type} is due ${getRelativeTime(reminder.dueDate)}.`,
          tag: reminder.id,
          onClick: () => {
            // Could navigate to reminder detail view
            window.location.hash = `#reminder/${reminder.id}`;
          }
        }
      );
      return;
    }

    // Schedule the notification
    const timeoutId = setTimeout(() => {
      showNotification(
        `Reminder: ${reminder.title}`,
        {
          body: `Your ${reminder.type} is due ${getRelativeTime(reminder.dueDate)}.`,
          tag: reminder.id,
          onClick: () => {
            window.location.hash = `#reminder/${reminder.id}`;
          }
        }
      );
    }, delayMs);

    // Store the timeout ID for potential cancellation
    const key = `${reminder.id}-${reminderTimeIndex}`;
    scheduledNotificationsRef.current.set(key, timeoutId);
  }, [showNotification]);

  // Cancel a scheduled notification
  const cancelScheduledNotification = useCallback((reminderId, reminderTimeIndex) => {
    const key = `${reminderId}-${reminderTimeIndex}`;
    const timeoutId = scheduledNotificationsRef.current.get(key);

    if (timeoutId) {
      clearTimeout(timeoutId);
      scheduledNotificationsRef.current.delete(key);
      return true;
    }

    return false;
  }, []);

  // Schedule all reminder notifications
  const scheduleAllNotifications = useCallback((reminders) => {
    // Clear existing scheduled notifications
    scheduledNotificationsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    scheduledNotificationsRef.current.clear();

    // Schedule new notifications
    reminders.forEach(reminder => {
      if (reminder.completed) return;

      reminder.reminderTimes?.forEach((reminderTime, index) => {
        if (!reminderTime.sent) {
          scheduleReminderNotification(reminder, reminderTime, index);
        }
      });
    });
  }, [scheduleReminderNotification]);

  // Show test notification
  const showTestNotification = useCallback(() => {
    showNotification(
      'Test Notification',
      {
        body: 'This is a test notification from Homework & Test Reminders.',
        tag: 'test'
      }
    );
  }, [showNotification]);

  // Update notification preferences
  const updatePreferences = useCallback((newPreferences) => {
    try {
      preferencesStorage.savePreferences(newPreferences);
      setPreferences(newPreferences);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (permission !== 'granted') {
      await requestPermission();
    } else {
      const newPreferences = { ...preferences, notifications: !preferences.notifications };
      await updatePreferences(newPreferences);
    }
  }, [isSupported, permission, preferences, requestPermission, updatePreferences]);

  // Get notification status
  const getNotificationStatus = useCallback(() => {
    return {
      isSupported,
      hasPermission: permission === 'granted',
      isEnabled: preferences?.notifications || false,
      canShow: isSupported && permission === 'granted' && preferences?.notifications
    };
  }, [isSupported, permission, preferences]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all scheduled notifications
      scheduledNotificationsRef.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  return {
    isSupported,
    permission,
    preferences,
    loading,
    error,
    requestPermission,
    showNotification,
    scheduleReminderNotification,
    cancelScheduledNotification,
    scheduleAllNotifications,
    showTestNotification,
    showInAppNotification,
    updatePreferences,
    toggleNotifications,
    getNotificationStatus,
    clearError
  };
};

// Helper function for relative time (simplified version)
function getRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    return 'overdue';
  } else if (diffDays === 0) {
    if (diffHours <= 1) return 'in less than an hour';
    return `in ${diffHours} hours`;
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else {
    return `in ${Math.ceil(diffDays / 7)} weeks`;
  }
}

export default useNotifications;