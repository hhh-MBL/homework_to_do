const STORAGE_KEYS = {
  REMINDERS: 'homework_reminders',
  USER_PREFERENCES: 'user_preferences',
};

const DEFAULT_PREFERENCES = {
  notifications: true,
  defaultReminderTimes: [
    { daysBefore: 7, sent: false },
    { daysBefore: 3, sent: false },
    { daysBefore: 1, sent: false },
    { hoursBefore: 1, sent: false }
  ],
  theme: 'dark',
};

class StorageError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
  }
}

export const storage = {
  // Save data to localStorage
  save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new StorageError('Storage quota exceeded. Please delete some old reminders.', error);
      }
      throw new StorageError(`Failed to save data: ${error.message}`, error);
    }
  },

  // Load data from localStorage
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to load data for key "${key}":`, error);
      return defaultValue;
    }
  },

  // Remove data from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      throw new StorageError(`Failed to remove data: ${error.message}`, error);
    }
  },

  // Clear all localStorage data
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      throw new StorageError(`Failed to clear storage: ${error.message}`, error);
    }
  },

  // Get storage usage info
  getStorageInfo() {
    try {
      let totalSize = 0;
      let itemCount = 0;

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
          itemCount++;
        }
      }

      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      const usagePercentage = ((totalSize / maxSize) * 100).toFixed(2);

      return {
        totalSize,
        maxSize,
        usagePercentage,
        itemCount,
        remainingSpace: maxSize - totalSize
      };
    } catch (error) {
      throw new StorageError(`Failed to get storage info: ${error.message}`, error);
    }
  },

  // Check if localStorage is available
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Specific functions for reminders
export const remindersStorage = {
  saveReminders(reminders) {
    return storage.save(STORAGE_KEYS.REMINDERS, reminders);
  },

  loadReminders() {
    return storage.load(STORAGE_KEYS.REMINDERS, []);
  },

  saveReminder(reminder) {
    const reminders = this.loadReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);

    if (existingIndex >= 0) {
      reminders[existingIndex] = { ...reminder, updatedAt: new Date().toISOString() };
    } else {
      reminders.push({ ...reminder, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    return this.saveReminders(reminders);
  },

  deleteReminder(id) {
    const reminders = this.loadReminders();
    const filteredReminders = reminders.filter(r => r.id !== id);
    return this.saveReminders(filteredReminders);
  },

  clearCompletedReminders() {
    const reminders = this.loadReminders();
    const activeReminders = reminders.filter(r => !r.completed);
    return this.saveReminders(activeReminders);
  }
};

// Specific functions for user preferences
export const preferencesStorage = {
  savePreferences(preferences) {
    return storage.save(STORAGE_KEYS.USER_PREFERENCES, { ...DEFAULT_PREFERENCES, ...preferences });
  },

  loadPreferences() {
    return storage.load(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  },

  updatePreference(key, value) {
    const preferences = this.loadPreferences();
    preferences[key] = value;
    return this.savePreferences(preferences);
  }
};

export default storage;