import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './utils/debugFCM';
import { BrowserRouter as Router } from 'react-router-dom';
import { TableColumnsProvider } from './context/TableColumnsContext ';
import { ExcelProvider } from './context/ExcelContext';
import { ViewProvider } from './context/ViewContext';
import {Provider }from 'react-redux'
import store from './store/Store';
import { RemindersProvider } from './context/CampaignDetailsProvider';
import { FilterProvider } from './context/FilterContext';
import ErrorBoundary from './component/common/ErrorBoundary';
import { SelectedIdsProvider } from './context/SelectedIdsContext';

// Handle chunk loading errors globally
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('Loading chunk') ||
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.includes('ChunkLoadError')
  )) {
    console.warn('Chunk loading error detected, will retry...');
    // Don't prevent default, let ErrorBoundary handle it
  }
}, true);

// Handle unhandled promise rejections (chunk errors often come as promise rejections)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    event.reason.message?.includes('Loading chunk') ||
    event.reason.message?.includes('Failed to fetch dynamically imported module') ||
    event.reason.name === 'ChunkLoadError'
  )) {
    console.warn('Chunk loading error (promise rejection), will retry...');
    event.preventDefault(); // Prevent console error
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

<React.StrictMode>
  <ErrorBoundary>
    <Provider store={store}>
      <Router>
        <ExcelProvider>
          <SelectedIdsProvider >
          <FilterProvider>
          <RemindersProvider>
          <ViewProvider>
          <TableColumnsProvider>
            <App />
          </TableColumnsProvider>
          </ViewProvider>
          </RemindersProvider>
          </FilterProvider>
          </SelectedIdsProvider>
        </ExcelProvider>
      </Router>
    </Provider>
  </ErrorBoundary>
</React.StrictMode>

);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();