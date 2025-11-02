# Homework & Test Reminders

A modern, responsive web application for managing homework assignments and test reminders with intelligent notifications.

## Features

### 📚 Core Functionality
- **Create Reminders**: Add homework and test reminders with detailed information
- **Smart Notifications**: Browser notifications with customizable timing (1 week, 3 days, 1 day, 1 hour before)
- **Due Date Management**: Track deadlines with urgency indicators (overdue, high, medium, low priority)
- **Search & Filter**: Find reminders quickly by type, status, or text search
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🎯 Key Features
- **Dark Theme**: Easy-on-the-eyes dark mode interface
- **Offline Support**: Works offline after initial load using localStorage
- **Real-time Updates**: See countdown timers and urgency levels update in real-time
- **Statistics Dashboard**: Track total, completed, overdue, and today's reminders
- **Persistent Storage**: All data saved locally in browser storage

### 📱 User Experience
- **Intuitive Interface**: Clean, modern design with smooth animations
- **Quick Actions**: Mark complete, edit, or delete reminders with one click
- **Detailed Views**: See full reminder information with metadata and schedule
- **Mobile Menu**: Slide-out navigation for mobile devices
- **Form Validation**: Smart validation with helpful error messages

## Technology Stack

- **Frontend**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS for responsive, utility-first styling
- **Storage**: Browser localStorage for data persistence
- **Notifications**: Native Browser Notification API
- **Build Tool**: Vite for lightning-fast builds and hot reload

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd homework_to_do
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating a Reminder
1. Click the "Add Reminder" button (floating action button on mobile, top-right on desktop)
2. Fill in the required information:
   - **Title** (required, max 100 characters)
   - **Type**: Homework or Test
   - **Due Date** (required, must be in the future)
   - **Due Time** (optional)
   - **Subject** (optional)
   - **Description** (optional, max 500 characters)
3. Select notification preferences (when to be reminded)
4. Click "Create Reminder"

### Managing Reminders
- **View Details**: Click any reminder card to see full information
- **Edit**: Click the edit icon in the detail view or reminder card
- **Mark Complete**: Use the toggle button to mark reminders as done
- **Delete**: Remove reminders with confirmation
- **Search**: Use the search bar to find specific reminders
- **Filter**: View by type (All, Homework, Tests, Active, Completed)

### Notification Setup
1. Click "Enable Notifications" when prompted
2. Grant browser permission when asked
3. Choose reminder times when creating reminders
4. Receive browser notifications at scheduled times

## Data Structure

Each reminder contains:
```javascript
{
  id: "unique-uuid-string",
  title: "Math Homework Chapter 5",
  type: "homework" | "test",
  description: "Complete exercises 1-25 on page 132",
  dueDate: "2024-01-15T14:30:00.000Z",
  subject: "Algebra II",
  reminderTimes: [
    { daysBefore: 7, sent: false },
    { daysBefore: 3, sent: false },
    { daysBefore: 1, sent: false },
    { hoursBefore: 1, sent: false }
  ],
  completed: false,
  createdAt: "2024-01-08T10:00:00.000Z",
  updatedAt: "2024-01-08T10:00:00.000Z"
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Feature Support
- **Notifications**: Requires HTTPS in production
- **LocalStorage**: Supported in all modern browsers
- **Date/Time Pickers**: Native browser support with fallbacks

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ReminderCard.jsx
│   ├── ReminderList.jsx
│   ├── ReminderForm.jsx
│   └── ReminderDetail.jsx
├── hooks/              # Custom React hooks
│   ├── useReminders.js
│   └── useNotifications.js
├── utils/              # Utility functions
│   ├── storage.js
│   └── dateHelpers.js
├── styles/             # CSS styles
│   └── index.css
├── App.jsx             # Main application component
└── main.jsx           # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Configuration Files
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have suggestions:
1. Check the browser compatibility requirements
2. Ensure you're using a modern browser
3. Enable browser notifications for the best experience
4. Check browser console for any error messages

---

Made with ❤️ for students who need to stay organized with their homework and test schedules.
