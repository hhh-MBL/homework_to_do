import { useState, useEffect, useCallback } from 'react';
import { remindersStorage } from '../utils/storage';
import {
  sortByDueDate,
  getUrgencyLevel,
  validateDate,
  calculateReminderTimes,
  getUpcomingReminders,
  getOverdueReminders,
  groupRemindersByDate
} from '../utils/dateHelpers';

export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reminders from storage on mount
  useEffect(() => {
    try {
      const loadedReminders = remindersStorage.loadReminders();
      setReminders(loadedReminders);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save reminders to storage whenever they change
  const saveReminders = useCallback((updatedReminders) => {
    try {
      remindersStorage.saveReminders(updatedReminders);
      setReminders(updatedReminders);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to save reminders:', err);
      throw err;
    }
  }, []);

  // Add a new reminder
  const addReminder = useCallback((reminderData) => {
    const newReminder = {
      id: crypto.randomUUID(),
      title: reminderData.title.trim(),
      type: reminderData.type,
      description: reminderData.description?.trim() || '',
      dueDate: reminderData.dueDate,
      subject: reminderData.subject?.trim() || '',
      reminderTimes: calculateReminderTimes(reminderData.dueDate, reminderData.reminderTimes || []),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validation
    if (!newReminder.title) {
      throw new Error('Title is required');
    }
    if (!newReminder.type) {
      throw new Error('Type is required');
    }
    if (!validateDate(newReminder.dueDate)) {
      throw new Error('Due date must be in the future');
    }
    if (newReminder.title.length > 100) {
      throw new Error('Title must be 100 characters or less');
    }
    if (newReminder.description.length > 500) {
      throw new Error('Description must be 500 characters or less');
    }

    const updatedReminders = [...reminders, newReminder];
    saveReminders(updatedReminders);
    return newReminder;
  }, [reminders, saveReminders]);

  // Update an existing reminder
  const updateReminder = useCallback((id, updates) => {
    const reminderIndex = reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) {
      throw new Error('Reminder not found');
    }

    const existingReminder = reminders[reminderIndex];
    const updatedReminder = {
      ...existingReminder,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Validation
    if (updatedReminder.title !== undefined) {
      if (!updatedReminder.title.trim()) {
        throw new Error('Title is required');
      }
      if (updatedReminder.title.length > 100) {
        throw new Error('Title must be 100 characters or less');
      }
    }

    if (updatedReminder.description !== undefined && updatedReminder.description.length > 500) {
      throw new Error('Description must be 500 characters or less');
    }

    if (updatedReminder.dueDate !== undefined && !validateDate(updatedReminder.dueDate)) {
      throw new Error('Due date must be in the future');
    }

    // Recalculate reminder times if due date changed
    if (updatedReminder.dueDate !== existingReminder.dueDate) {
      updatedReminder.reminderTimes = calculateReminderTimes(
        updatedReminder.dueDate,
        updatedReminder.reminderTimes || []
      );
    }

    const updatedReminders = [...reminders];
    updatedReminders[reminderIndex] = updatedReminder;
    saveReminders(updatedReminders);
    return updatedReminder;
  }, [reminders, saveReminders]);

  // Delete a reminder
  const deleteReminder = useCallback((id) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    saveReminders(updatedReminders);
  }, [reminders, saveReminders]);

  // Toggle reminder completion status
  const toggleComplete = useCallback((id) => {
    const reminderIndex = reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) {
      throw new Error('Reminder not found');
    }

    const updatedReminders = [...reminders];
    updatedReminders[reminderIndex] = {
      ...updatedReminders[reminderIndex],
      completed: !updatedReminders[reminderIndex].completed,
      updatedAt: new Date().toISOString()
    };

    saveReminders(updatedReminders);
  }, [reminders, saveReminders]);

  // Clear all completed reminders
  const clearCompleted = useCallback(() => {
    const activeReminders = reminders.filter(r => !r.completed);
    saveReminders(activeReminders);
  }, [reminders, saveReminders]);

  // Filter reminders by type
  const getFilteredReminders = useCallback((filter = 'all') => {
    let filtered = reminders;

    switch (filter) {
      case 'homework':
        filtered = reminders.filter(r => r.type === 'homework');
        break;
      case 'test':
        filtered = reminders.filter(r => r.type === 'test');
        break;
      case 'completed':
        filtered = reminders.filter(r => r.completed);
        break;
      case 'active':
        filtered = reminders.filter(r => !r.completed);
        break;
      default:
        // 'all' or any other value - no filtering
        break;
    }

    return sortByDueDate(filtered);
  }, [reminders]);

  // Get reminders with urgency information
  const getRemindersWithUrgency = useCallback((filter = 'all') => {
    const filtered = getFilteredReminders(filter);
    return filtered.map(reminder => ({
      ...reminder,
      urgency: getUrgencyLevel(reminder.dueDate)
    }));
  }, [getFilteredReminders]);

  // Get upcoming reminders (next 24 hours)
  const getUpcoming = useCallback(() => {
    return getUpcomingReminders(reminders);
  }, [reminders]);

  // Get overdue reminders
  const getOverdue = useCallback(() => {
    return getOverdueReminders(reminders);
  }, [reminders]);

  // Get reminders grouped by date
  const getGroupedByDate = useCallback((filter = 'all') => {
    const filtered = getFilteredReminders(filter);
    return groupRemindersByDate(filtered);
  }, [getFilteredReminders]);

  // Search reminders
  const searchReminders = useCallback((query) => {
    if (!query.trim()) {
      return sortByDueDate(reminders);
    }

    const lowercaseQuery = query.toLowerCase();
    return sortByDueDate(reminders.filter(reminder =>
      reminder.title.toLowerCase().includes(lowercaseQuery) ||
      reminder.description.toLowerCase().includes(lowercaseQuery) ||
      reminder.subject.toLowerCase().includes(lowercaseQuery)
    ));
  }, [reminders]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const total = reminders.length;
    const completed = reminders.filter(r => r.completed).length;
    const active = total - completed;
    const homework = reminders.filter(r => r.type === 'homework').length;
    const tests = reminders.filter(r => r.type === 'test').length;
    const overdue = getOverdue().length;
    const upcoming = getUpcoming().length;

    return {
      total,
      completed,
      active,
      homework,
      tests,
      overdue,
      upcoming,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [reminders, getOverdue, getUpcoming]);

  // Update reminder notification status
  const updateReminderNotification = useCallback((reminderId, reminderTimeIndex, sent = true) => {
    const reminderIndex = reminders.findIndex(r => r.id === reminderId);
    if (reminderIndex === -1) {
      return false;
    }

    const updatedReminders = [...reminders];
    const reminderTimes = [...updatedReminders[reminderIndex].reminderTimes];

    if (reminderTimes[reminderTimeIndex]) {
      reminderTimes[reminderTimeIndex].sent = sent;
      updatedReminders[reminderIndex] = {
        ...updatedReminders[reminderIndex],
        reminderTimes,
        updatedAt: new Date().toISOString()
      };

      saveReminders(updatedReminders);
      return true;
    }

    return false;
  }, [reminders, saveReminders]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reminders,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    clearCompleted,
    getFilteredReminders,
    getRemindersWithUrgency,
    getUpcoming,
    getOverdue,
    getGroupedByDate,
    searchReminders,
    getStatistics,
    updateReminderNotification,
    clearError
  };
};