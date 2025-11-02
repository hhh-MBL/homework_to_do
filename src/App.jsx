import React, { useState, useEffect } from 'react';
import ReminderList from './components/ReminderList';
import ReminderForm from './components/ReminderForm';
import ReminderDetail from './components/ReminderDetail';
import { useReminders } from './hooks/useReminders';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    reminders,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    getRemindersWithUrgency,
    clearError
  } = useReminders();

  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    preferences,
    requestPermission,
    scheduleAllNotifications,
    showTestNotification,
    getNotificationStatus,
    toggleNotifications
  } = useNotifications();

  const filteredReminders = getRemindersWithUrgency(filter);

  // Schedule notifications whenever reminders change
  useEffect(() => {
    if (reminders.length > 0) {
      scheduleAllNotifications(reminders);
    }
  }, [reminders, scheduleAllNotifications]);

  // Handle URL hash for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('reminder/')) {
        const reminderId = hash.replace('reminder/', '');
        const reminder = reminders.find(r => r.id === reminderId);
        if (reminder) {
          setSelectedReminder(reminder);
          setCurrentView('detail');
        }
      } else if (hash === 'add') {
        setCurrentView('form');
        setSelectedReminder(null);
      } else if (hash === 'settings') {
        setCurrentView('settings');
      } else {
        setCurrentView('list');
        setSelectedReminder(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [reminders]);

  const handleAddReminder = () => {
    setCurrentView('form');
    setSelectedReminder(null);
    window.location.hash = 'add';
  };

  const handleEditReminder = (reminder) => {
    setSelectedReminder(reminder);
    setCurrentView('form');
    window.location.hash = `edit/${reminder.id}`;
  };

  const handleReminderClick = (reminder) => {
    setSelectedReminder(reminder);
    setCurrentView('detail');
    window.location.hash = `reminder/${reminder.id}`;
  };

  const handleSaveReminder = async (reminderData) => {
    try {
      if (selectedReminder) {
        await updateReminder(selectedReminder.id, reminderData);
      } else {
        await addReminder(reminderData);
      }
      setCurrentView('list');
      setSelectedReminder(null);
      window.location.hash = '';
    } catch (error) {
      console.error('Failed to save reminder:', error);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id);
      setCurrentView('list');
      setSelectedReminder(null);
      window.location.hash = '';
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleComplete(id);
    } catch (error) {
      console.error('Failed to toggle reminder completion:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedReminder(null);
    window.location.hash = '';
  };

  const handleRequestNotifications = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const notificationStatus = getNotificationStatus();

  const Header = () => (
    <header className="bg-dark-secondary border-b border-dark-tertiary sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gradient">Homework & Test Reminders</h1>
          </div>

          <div className="flex items-center space-x-4">
            {notificationStatus.canShow && (
              <button
                onClick={showTestNotification}
                className="hidden sm:block p-2 rounded-lg hover:bg-gray-600 transition-colors"
                title="Test notifications"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            )}

            {!notificationStatus.isEnabled && notificationsSupported && (
              <button
                onClick={handleRequestNotifications}
                className="hidden sm:block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Enable Notifications
              </button>
            )}

            <div className="text-sm text-gray-400">
              {filteredReminders.length} {filteredReminders.length === 1 ? 'reminder' : 'reminders'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const MobileMenu = () => (
    <div className={`lg:hidden fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
      <div className="fixed right-0 top-0 h-full w-64 bg-dark-secondary shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-dark-tertiary">
          <h2 className="text-lg font-semibold text-gray-100">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              handleBack();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-600 text-gray-300 transition-colors"
          >
            📋 All Reminders
          </button>
          <button
            onClick={() => {
              handleFilterChange('active');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-600 text-gray-300 transition-colors"
          >
            ⏰ Active
          </button>
          <button
            onClick={() => {
              handleFilterChange('completed');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-600 text-gray-300 transition-colors"
          >
            ✅ Completed
          </button>
          {!notificationStatus.isEnabled && notificationsSupported && (
            <button
              onClick={() => {
                handleRequestNotifications();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-600 text-blue-400 transition-colors"
            >
              🔔 Enable Notifications
            </button>
          )}
        </nav>
      </div>
    </div>
  );

  const FloatingActionButton = () => (
    <button
      onClick={handleAddReminder}
      className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-30"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );

  const ErrorBanner = () => {
    if (!error) return null;

    return (
      <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="p-1 hover:bg-red-900/30 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <MobileMenu />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBanner />

        {/* Desktop Add Button */}
        <div className="hidden lg:flex justify-end mb-6">
          <button
            onClick={handleAddReminder}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Reminder</span>
          </button>
        </div>

        {/* View Content */}
        {currentView === 'list' && (
          <ReminderList
            reminders={filteredReminders}
            loading={loading}
            filter={filter}
            onFilterChange={handleFilterChange}
            onReminderClick={handleReminderClick}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteReminder}
            onEdit={handleEditReminder}
            showCompact={window.innerWidth < 768}
          />
        )}

        {currentView === 'form' && (
          <ReminderForm
            reminder={selectedReminder}
            onSave={handleSaveReminder}
            onCancel={handleBack}
          />
        )}

        {currentView === 'detail' && selectedReminder && (
          <ReminderDetail
            reminder={selectedReminder}
            onClose={handleBack}
            onEdit={handleEditReminder}
            onDelete={handleDeleteReminder}
            onToggleComplete={handleToggleComplete}
          />
        )}

        {currentView === 'settings' && (
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-100 mb-3">Notifications</h3>
                {!notificationsSupported ? (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <p className="text-red-400 text-sm">
                      Notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.
                    </p>
                  </div>
                ) : notificationPermission !== 'granted' ? (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">
                      Enable browser notifications to get reminded about upcoming homework and tests.
                    </p>
                    <button
                      onClick={handleRequestNotifications}
                      className="btn-primary"
                    >
                      Enable Notifications
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-400 font-medium">Notifications Enabled</span>
                      </div>
                      <button
                        onClick={showTestNotification}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Test
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">
                      You will receive notifications for your reminders according to the schedule you set when creating them.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-100 mb-3">About</h3>
                <div className="p-4 bg-dark-tertiary rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">
                    Homework & Test Reminders v1.0.0
                  </p>
                  <p className="text-gray-400 text-sm">
                    A simple app to help you track and manage your academic assignments and test dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <FloatingActionButton />
    </div>
  );
}

export default App;