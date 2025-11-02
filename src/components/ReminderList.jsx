import React, { useState } from 'react';
import ReminderCard from './ReminderCard';

const ReminderList = ({
  reminders,
  loading,
  filter = 'all',
  onFilterChange,
  onReminderClick,
  onToggleComplete,
  onDelete,
  onEdit,
  showCompact = false,
  emptyMessage = 'No reminders found'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReminders = reminders.filter(reminder => {
    // Apply filter
    if (filter === 'homework' && reminder.type !== 'homework') return false;
    if (filter === 'test' && reminder.type !== 'test') return false;
    if (filter === 'active' && reminder.completed) return false;
    if (filter === 'completed' && !reminder.completed) return false;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        reminder.title.toLowerCase().includes(query) ||
        (reminder.description && reminder.description.toLowerCase().includes(query)) ||
        (reminder.subject && reminder.subject.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    return true;
  });

  const filterOptions = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'homework', label: 'Homework', icon: '📚' },
    { value: 'test', label: 'Tests', icon: '📝' },
    { value: 'active', label: 'Active', icon: '⏰' },
    { value: 'completed', label: 'Completed', icon: '✅' }
  ];

  const getFilterIcon = (filterValue) => {
    const option = filterOptions.find(opt => opt.value === filterValue);
    return option ? option.icon : '📋';
  };

  const getEmptyMessage = () => {
    if (loading) {
      return 'Loading reminders...';
    }

    if (searchQuery.trim()) {
      return `No reminders found for "${searchQuery}"`;
    }

    switch (filter) {
      case 'homework':
        return 'No homework assignments found';
      case 'test':
        return 'No tests found';
      case 'active':
        return 'No active reminders';
      case 'completed':
        return 'No completed reminders';
      default:
        return emptyMessage;
    }
  };

  const getEmptyIcon = () => {
    if (searchQuery.trim()) {
      return '🔍';
    }
    return getFilterIcon(filter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (filterValue) => {
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  };

  const getStats = () => {
    const total = reminders.length;
    const completed = reminders.filter(r => r.completed).length;
    const overdue = reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      return dueDate < new Date() && !r.completed;
    }).length;
    const today = reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      const todayDate = new Date();
      return dueDate.toDateString() === todayDate.toDateString() && !r.completed;
    }).length;

    return { total, completed, overdue, today };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search reminders..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-3 pl-10 bg-dark-secondary border border-dark-tertiary rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-3.5 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="card p-3">
          <div className="text-2xl font-bold text-orange-400">{stats.today}</div>
          <div className="text-xs text-gray-400">Today</div>
        </div>
        <div className="card p-3">
          <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
          <div className="text-xs text-gray-400">Overdue</div>
        </div>
        <div className="card p-3">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400">Done</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-dark-tertiary rounded-lg">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterClick(option.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === option.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{getEmptyIcon()}</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            {getEmptyMessage()}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery.trim()
              ? 'Try adjusting your search terms'
              : filter === 'completed'
                ? 'Complete some reminders to see them here'
                : 'Create your first reminder to get started'
            }
          </p>
          {!searchQuery.trim() && filter !== 'completed' && (
            <div className="text-sm text-gray-500">
              💡 Click the + button to add a new reminder
            </div>
          )}
        </div>
      ) : (
        <div className={`space-y-3 ${showCompact ? '' : 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              compact={showCompact}
              onClick={onReminderClick}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredReminders.length > 0 && (
        <div className="text-center text-sm text-gray-400 pt-4">
          Showing {filteredReminders.length} {filteredReminders.length === 1 ? 'reminder' : 'reminders'}
          {searchQuery && ` for "${searchQuery}"`}
          {filter !== 'all' && ` in "${filterOptions.find(f => f.value === filter)?.label}"`}
        </div>
      )}
    </div>
  );
};

export default ReminderList;