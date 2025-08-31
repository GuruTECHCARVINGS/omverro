# Vendor Portal Buyer Dashboard

## Overview

The Vendor Portal Buyer Dashboard is a web application designed to provide buyers with a comprehensive view of their purchasing activities, vendor performance, and key metrics. This dashboard integrates various components to enhance user experience and facilitate efficient management of purchase orders, approvals, inquiries, and more.

## Features

- **User-Friendly Interface**: A clean and intuitive layout that allows users to navigate easily through different sections of the dashboard.
- **Key Performance Indicators (KPIs)**: Visual representations of important metrics through donut charts and stat cards.
- **Spending Overview**: Detailed insights into spending trends over time with line charts and category breakdowns.
- **Vendor Scorecard**: Performance metrics for vendors to help buyers make informed decisions.
- **Activity Feed**: A real-time feed of recent activities related to the buyer's account.
- **Announcements and Alerts**: Important notifications and updates relevant to the buyer's operations.
- **Task Management**: A dedicated panel for tracking tasks that need to be completed.

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd vendor-portal-buyer-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:3000` (or the specified port) to view the dashboard.

## Project Structure

- `src/`: Contains the main application code.
  - `app.ts`: Main entry point of the application.
  - `pages/`: Contains page components, including the buyer dashboard.
  - `components/`: Reusable components such as layout, tiles, charts, and controls.
  - `styles/`: CSS files for styling the application.
  - `utils/`: Utility functions for API calls and data formatting.
  - `data/`: Sample data files for various entities like purchase orders, vendors, and more.
  - `types/`: TypeScript types and interfaces.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.