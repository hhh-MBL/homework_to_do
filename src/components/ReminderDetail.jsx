import React, { useState, useEffect } from 'react';
import ReminderCard from './ReminderCard';
import {
  formatDateTime,
  getRelativeTime,
  getCountdown,
  getUrgencyLevel,
  isToday,
  isTomorrow,
  isThisWeek
} from '../utils/dateHelpers';

const ReminderDetail = ({
  reminder,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onUpdate
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (reminder && !reminder.completed) {
        setTimeRemaining(getCountdown(reminder.dueDate));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [reminder]);

  if (!reminder) {
    return null;
  }

  const urgency = getUrgencyLevel(reminder.dueDate);
  const getTypeIcon = () => {
    if (reminder.type === 'test') {
      return '📝';
    } else {
      return '📚';
    }
  };

  const getTypeLabel = () => {
    return reminder.type === 'test' ? 'Test' : 'Homework';
  };

  const getStatusBadge = () => {
    if (reminder.completed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400 border border-green-700">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Completed
        </span>
      );
    }

    switch (urgency) {
      case 'overdue':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900/30 text-red-400 border border-red-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Overdue
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-900/30 text-orange-400 border border-orange-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Due Soon
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This Week
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400 border border-green-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            On Track
          </span>
        );
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(reminder);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      if (onDelete) {
        onDelete(reminder.id);
      }
    } else {
      setConfirmDelete(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(reminder.id);
    }
  };

  const formatCreationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReminderSchedule = () => {
    if (!reminder.reminderTimes || reminder.reminderTimes.length === 0) {
      return <p className="text-gray-400 text-sm">No reminders scheduled</p>;
    }

    return (
      <div className="space-y-2">
        {reminder.reminderTimes.map((reminderTime, index) => {
          const scheduledDate = new Date(reminderTime.scheduledFor);
          const now = new Date();
          const isPast = scheduledDate < now;

          return (
            <div key={index} className="flex items-center justify-between p-2 bg-dark-tertiary rounded">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${reminderTime.sent ? 'bg-green-500' : isPast ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-300">
                  {reminderTime.daysBefore
                    ? `${reminderTime.daysBefore} day${reminderTime.daysBefore !== 1 ? 's' : ''} before`
                    : `${reminderTime.hoursBefore} hour${reminderTime.hoursBefore !== 1 ? 's' : ''} before`}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {reminderTime.sent ? (
                  <span className="text-green-500">Sent</span>
                ) : isPast ? (
                  <span className="text-red-500">Missed</span>
                ) : (
                  <span className="text-yellow-500">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getTypeIcon()}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">{reminder.title}</h2>
              <p className="text-gray-400">{getTypeLabel()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          {getStatusBadge()}
        </div>

        {/* Subject */}
        {reminder.subject && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Subject</h3>
            <div className="inline-flex items-center px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-lg">
              <span className="text-blue-400 font-medium">{reminder.subject}</span>
            </div>
          </div>
        )}

        {/* Due Date Information */}
        <div className="mb-6 p-4 bg-dark-tertiary rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Due Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Date & Time</div>
              <div className="text-lg font-semibold text-gray-100">
                {formatDateTime(reminder.dueDate)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Time Remaining</div>
              <div className={`text-lg font-semibold ${timeRemaining?.className || 'text-gray-100'}`}>
                {timeRemaining ? timeRemaining.text : 'Calculating...'}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-sm text-gray-400">
              {isToday(reminder.dueDate) && 'This reminder is due today'}
              {isTomorrow(reminder.dueDate) && 'This reminder is due tomorrow'}
              {isThisWeek(reminder.dueDate) && !isToday(reminder.dueDate) && !isTomorrow(reminder.dueDate) && 'This reminder is due this week'}
              {!isThisWeek(reminder.dueDate) && `Due ${getRelativeTime(reminder.dueDate)}`}
            </div>
          </div>
        </div>

        {/* Description */}
        {reminder.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
            <div className="p-4 bg-dark-tertiary rounded-lg text-gray-100 whitespace-pre-wrap">
              {reminder.description}
            </div>
          </div>
        )}

        {/* Reminder Schedule */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Notification Schedule</h3>
          {getReminderSchedule()}
        </div>

        {/* Metadata */}
        <div className="mb-6 p-4 bg-dark-tertiary rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-300">{formatCreationDate(reminder.createdAt)}</span>
            </div>
            {reminder.updatedAt !== reminder.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-300">{formatCreationDate(reminder.updatedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-400 text-xs font-mono">{reminder.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleToggleComplete}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              reminder.completed
                ? 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {reminder.completed ? (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Mark as Incomplete
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Complete
              </span>
            )}
          </button>

          <button
            onClick={handleEdit}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </span>
          </button>

          <button
            onClick={handleDelete}
            className={`flex-1 py-3 px-4 font-medium rounded-lg transition-colors ${
              confirmDelete
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {confirmDelete ? 'Click to Confirm' : 'Delete'}
            </span>
          </button>
        </div>

        {confirmDelete && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">
              ⚠️ Are you sure you want to delete this reminder? This action cannot be undone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderDetail;