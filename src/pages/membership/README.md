# Membership Dashboard

A comprehensive dashboard for viewing membership statistics and analytics with interactive charts and expandable views.

## Features

### Main Statistics Cards

- **Total Active Members**: Shows the total number of active members
- **New Joiners**: Displays new members who joined this month
- **Leavers**: Shows members who left this month
- **Net Growth**: Calculates the difference between joiners and leavers

### Membership Type Distribution

- **Paid Members**: Members with paid subscriptions
- **Honorary Members**: Members with honorary status
- **Student Members**: Members with student status

### Interactive Charts

Each chart card can be clicked to expand into a full-view modal:

1. **Membership by Category**: Pie chart showing distribution by membership categories (Regular, Associate, Student, Honorary, Life)

2. **Membership by Grade**: Bar chart displaying top 10 grades with member counts

3. **Membership by Section**: Bar chart showing top 10 sections with member counts

4. **Membership by Branch**: Bar chart displaying top 10 branches with member counts

5. **Membership by Region**: Pie chart showing distribution across regions (Leinster, Munster, Connacht, Ulster)

6. **Membership by Work Location**: Pie chart showing distribution by work arrangements (Office, Remote, Hybrid)

## Technical Implementation

### Components

- `MembershipDashboard.js`: Main dashboard component
- `membershipDashboardAPI.js`: API service for data fetching

### Dependencies

- **Ant Design**: UI components and layout
- **Recharts**: Chart rendering (Pie charts and Bar charts)
- **React Icons**: Icon components

### API Integration

The dashboard uses a service layer (`membershipDashboardAPI.js`) that provides:

- Mock data fallbacks for development
- Structured API endpoints for production
- Error handling with graceful degradation

### Styling

- Custom CSS with responsive design
- Gradient headers for chart cards
- Hover effects and smooth transitions
- Mobile-responsive layout

## Usage

1. Navigate to the dashboard via the sidebar menu under "Subscription" → "Membership Dashboard"
2. View overview statistics at the top
3. Click the expand icon on any chart card to view full details
4. Charts automatically limit to top 10 items for better readability
5. Full-view modals show complete data with legends and enhanced tooltips

## Data Structure

### API Endpoints

- `GET /api/membership/dashboard/stats` - Overview statistics
- `GET /api/membership/dashboard/by-category` - Category distribution
- `GET /api/membership/dashboard/by-grade` - Grade distribution
- `GET /api/membership/dashboard/by-section` - Section distribution
- `GET /api/membership/dashboard/by-branch` - Branch distribution
- `GET /api/membership/dashboard/by-region` - Region distribution
- `GET /api/membership/dashboard/by-work-location` - Work location distribution

### Data Formats

- **Statistics**: `{ totalActive, newJoiners, leavers, paidMembers, honoraryMembers, studentMembers }`
- **Pie Chart Data**: `[{ name, value, color }]`
- **Bar Chart Data**: `[{ name, count }]`

## Future Enhancements

- Real-time data updates
- Date range filtering
- Export functionality
- Drill-down capabilities
- Custom chart configurations
- Data refresh controls
