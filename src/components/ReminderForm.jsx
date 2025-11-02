import React, { useState, useEffect } from 'react';
import { preferencesStorage } from '../utils/storage';
import { validateDate, validateDateTime, combineDateAndTime } from '../utils/dateHelpers';

const ReminderForm = ({
  reminder = null,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'homework',
    description: '',
    dueDate: '',
    dueTime: '',
    subject: '',
    reminderTimes: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [preferences, setPreferences] = useState(null);

  // Initialize form with reminder data or defaults
  useEffect(() => {
    const userPreferences = preferencesStorage.loadPreferences();
    setPreferences(userPreferences);

    if (reminder) {
      const dueDate = new Date(reminder.dueDate);
      setFormData({
        title: reminder.title || '',
        type: reminder.type || 'homework',
        description: reminder.description || '',
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: dueDate.toTimeString().slice(0, 5),
        subject: reminder.subject || '',
        reminderTimes: reminder.reminderTimes || userPreferences.defaultReminderTimes
      });
    } else {
      setFormData(prev => ({
        ...prev,
        reminderTimes: userPreferences.defaultReminderTimes
      }));
    }
  }, [reminder]);

  const defaultReminderOptions = [
    { label: '1 week before', daysBefore: 7 },
    { label: '3 days before', daysBefore: 3 },
    { label: '1 day before', daysBefore: 1 },
    { label: '1 hour before', hoursBefore: 1 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          error = 'Title is required';
        } else if (value.length > 100) {
          error = 'Title must be 100 characters or less';
        }
        break;

      case 'type':
        if (!value) {
          error = 'Type is required';
        }
        break;

      case 'dueDate':
        if (!value) {
          error = 'Due date is required';
        } else if (!validateDate(value)) {
          error = 'Due date must be in the future';
        }
        break;

      case 'description':
        if (value.length > 500) {
          error = 'Description must be 500 characters or less';
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  };

  const validateForm = () => {
    const requiredFields = ['title', 'type', 'dueDate'];
    let isValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    // Validate date-time combination if time is specified
    if (formData.dueDate && formData.dueTime) {
      if (!validateDateTime(formData.dueDate, formData.dueTime)) {
        setErrors(prev => ({
          ...prev,
          dueDate: 'Due date and time must be in the future'
        }));
        isValid = false;
      }
    }

    return isValid;
  };

  const handleReminderTimeToggle = (index) => {
    setFormData(prev => {
      const newReminderTimes = [...prev.reminderTimes];
      if (index < newReminderTimes.length) {
        newReminderTimes[index] = {
          ...newReminderTimes[index],
          sent: false // Reset sent status when editing
        };
      }
      return {
        ...prev,
        reminderTimes: newReminderTimes
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allFields = ['title', 'type', 'dueDate', 'description', 'subject'];
      setTouched(
        allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      );
      return;
    }

    const combinedDueDate = combineDateAndTime(formData.dueDate, formData.dueTime);

    const submissionData = {
      ...formData,
      dueDate: combinedDueDate
    };

    if (onSave) {
      onSave(submissionData);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  };

  const hasError = (fieldName) => {
    return touched[fieldName] && !!errors[fieldName];
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100">
            {reminder ? 'Edit Reminder' : 'Create New Reminder'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter reminder title..."
              className={`w-full px-4 py-2 bg-dark-tertiary border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError('title') ? 'border-red-500' : 'border-gray-600'
              }`}
              maxLength={100}
            />
            {hasError('title') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('title')}</p>
            )}
            <div className="mt-1 text-xs text-gray-500 text-right">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'homework' }))}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  formData.type === 'homework'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-400'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                📚 Homework
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'test' }))}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  formData.type === 'test'
                    ? 'border-purple-500 bg-purple-900/30 text-purple-400'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                📝 Test
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g., Math, Physics, History..."
              className="w-full px-4 py-2 bg-dark-tertiary border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 bg-dark-tertiary border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  hasError('dueDate') ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {hasError('dueDate') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('dueDate')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Time
              </label>
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-tertiary border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Add any additional details or notes..."
              rows={3}
              className={`w-full px-4 py-2 bg-dark-tertiary border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                hasError('description') ? 'border-red-500' : 'border-gray-600'
              }`}
              maxLength={500}
            />
            {hasError('description') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('description')}</p>
            )}
            <div className="mt-1 text-xs text-gray-500 text-right">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Reminder Times */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Remind Me
            </label>
            <div className="space-y-2">
              {defaultReminderOptions.map((option, index) => {
                const isEnabled = formData.reminderTimes[index];
                return (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!isEnabled}
                      onChange={() => handleReminderTimeToggle(index)}
                      className="w-4 h-4 text-blue-600 bg-dark-tertiary border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-gray-300">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-dark-tertiary hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                reminder ? 'Update Reminder' : 'Create Reminder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;