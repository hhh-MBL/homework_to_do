import React from 'react';
import {
  formatDate,
  formatTime,
  getRelativeTime,
  getCountdown,
  getUrgencyLevel,
  isToday,
  isTomorrow
} from '../utils/dateHelpers';

const ReminderCard = ({
  reminder,
  onClick,
  onToggleComplete,
  onDelete,
  onEdit,
  compact = false
}) => {
  const urgency = getUrgencyLevel(reminder.dueDate);
  const countdown = getCountdown(reminder.dueDate);

  const getUrgencyClasses = () => {
    switch (urgency) {
      case 'overdue':
        return 'urgency-high border-red-500 bg-red-900/20';
      case 'high':
        return 'urgency-high border-orange-500 bg-orange-900/20';
      case 'medium':
        return 'urgency-medium border-yellow-500 bg-yellow-900/20';
      case 'low':
        return 'urgency-low border-green-500 bg-green-900/20';
      default:
        return '';
    }
  };

  const getTypeIcon = () => {
    if (reminder.type === 'test') {
      return (
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
          T
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          H
        </div>
      );
    }
  };

  const getTypeLabel = () => {
    return reminder.type === 'test' ? 'Test' : 'Homework';
  };

  const getStatusIcon = () => {
    if (reminder.completed) {
      return (
        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (urgency === 'overdue') {
      return (
        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    return null;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(reminder);
    }
  };

  const handleCompleteToggle = (e) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(reminder.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(reminder);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(reminder.id);
    }
  };

  if (compact) {
    return (
      <div
        className={`card cursor-pointer transition-all duration-200 hover:shadow-xl ${getUrgencyClasses()} ${
          reminder.completed ? 'opacity-60' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getTypeIcon()}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-100 truncate ${
                reminder.completed ? 'line-through' : ''
              }`}>
                {reminder.title}
              </h3>
              <p className="text-sm text-gray-400">
                {isToday(reminder.dueDate) ? 'Today' :
                 isTomorrow(reminder.dueDate) ? 'Tomorrow' :
                 formatDate(reminder.dueDate)}
                {' at '}{formatTime(reminder.dueDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <button
              onClick={handleCompleteToggle}
              className="p-2 rounded-lg bg-dark-tertiary hover:bg-gray-600 transition-colors"
              title={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 hover:shadow-xl ${getUrgencyClasses()} ${
        reminder.completed ? 'opacity-60' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {getTypeLabel()}
            </span>
            <h3 className={`font-semibold text-lg text-gray-100 ${
              reminder.completed ? 'line-through' : ''
            }`}>
              {reminder.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg bg-dark-tertiary hover:bg-gray-600 transition-colors"
              title="Edit reminder"
            >
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors"
              title="Delete reminder"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {reminder.subject && (
        <div className="mb-2">
          <span className="text-xs font-medium text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
            {reminder.subject}
          </span>
        </div>
      )}

      {reminder.description && (
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {reminder.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-tertiary">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <div className="text-gray-400">Due</div>
            <div className="font-medium text-gray-100">
              {isToday(reminder.dueDate) ? 'Today' :
               isTomorrow(reminder.dueDate) ? 'Tomorrow' :
               formatDate(reminder.dueDate)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-400">Time</div>
            <div className="font-medium text-gray-100">
              {formatTime(reminder.dueDate)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">
            {getRelativeTime(reminder.dueDate)}
          </div>
          <div className={`text-sm font-medium ${countdown.className}`}>
            {countdown.text}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dark-tertiary">
        <button
          onClick={handleCompleteToggle}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            reminder.completed
              ? 'bg-gray-600 hover:bg-gray-700 text-gray-200'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {reminder.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
};

export default ReminderCard;