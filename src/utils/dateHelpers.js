// Date formatting and manipulation utilities

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    const overdueHours = Math.abs(diffHours);
    const overdueMinutes = Math.abs(diffMinutes);

    if (overdueDays > 0) {
      return `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`;
    } else if (overdueHours > 0) {
      return `${overdueHours} hour${overdueHours !== 1 ? 's' : ''} overdue`;
    } else {
      return `${overdueMinutes} minute${overdueMinutes !== 1 ? 's' : ''} overdue`;
    }
  }

  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes <= 30) {
        return 'in less than 30 minutes';
      }
      return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    if (remainingDays === 0) {
      return `in ${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `in ${weeks} week${weeks !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    if (remainingDays === 0) {
      return `in ${months} month${months !== 1 ? 's' : ''}`;
    }
    return `in ${months} month${months !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  }
};

export const getCountdown = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;

  if (diffMs < 0) {
    return {
      overdue: true,
      text: 'Overdue',
      className: 'text-red-500'
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return {
      overdue: false,
      text: `${days}d ${hours}h ${minutes}m`,
      className: days <= 1 ? 'text-red-500' : days <= 3 ? 'text-orange-500' : 'text-green-500'
    };
  } else if (hours > 0) {
    return {
      overdue: false,
      text: `${hours}h ${minutes}m`,
      className: 'text-red-500'
    };
  } else {
    return {
      overdue: false,
      text: `${minutes}m`,
      className: 'text-red-500'
    };
  }
};

export const getUrgencyLevel = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) {
    return 'overdue';
  } else if (diffHours < 24) {
    return 'high';
  } else if (diffDays < 3) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
};

export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = new Date(date);
  return tomorrow.toDateString() === target.toDateString();
};

export const isThisWeek = (date) => {
  const now = new Date();
  const target = new Date(date);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  return target >= startOfWeek && target <= endOfWeek;
};

export const validateDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d instanceof Date && !isNaN(d) && d > now;
};

export const validateDateTime = (date, time) => {
  try {
    const dateObj = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    return validateDate(dateObj);
  } catch (error) {
    return false;
  }
};

export const combineDateAndTime = (date, time) => {
  const dateObj = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    dateObj.setHours(23, 59, 59, 999); // End of day if no time specified
  }
  return dateObj.toISOString();
};

export const calculateReminderTimes = (dueDate, reminderTimes) => {
  const due = new Date(dueDate);
  return reminderTimes.map(reminder => {
    let reminderDate = new Date(due);

    if (reminder.daysBefore) {
      reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
    }

    if (reminder.hoursBefore) {
      reminderDate.setHours(reminderDate.getHours() - reminder.hoursBefore);
    }

    return {
      ...reminder,
      scheduledFor: reminderDate.toISOString(),
      sent: false
    };
  });
};

export const getUpcomingReminders = (reminders, hours = 24) => {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

  return reminders
    .filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= now && dueDate <= future && !reminder.completed;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

export const getOverdueReminders = (reminders) => {
  const now = new Date();
  return reminders
    .filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      return dueDate < now && !reminder.completed;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

export const sortByDueDate = (reminders, ascending = true) => {
  return [...reminders].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const groupRemindersByDate = (reminders) => {
  const groups = {};

  reminders.forEach(reminder => {
    const date = new Date(reminder.dueDate);
    const dateKey = date.toDateString();

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: date,
        reminders: []
      };
    }

    groups[dateKey].reminders.push(reminder);
  });

  // Sort groups by date
  const sortedGroups = Object.entries(groups)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return sortedGroups;
};