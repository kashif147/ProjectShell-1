import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { TableColumnsProvider } from './context/TableColumnsContext ';
import { ExcelProvider } from './context/ExcelContext';
import { ViewProvider } from './context/ViewContext';
import {Provider }from 'react-redux'
import store from './store/Store';
import { RemindersProvider } from './context/CampaignDetailsProvider';
import { FilterProvider } from './context/FilterContext';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

<React.StrictMode>
  <Provider store={store}>
    <Router>
      <ExcelProvider>
        <FilterProvider>
        <RemindersProvider>
        <ViewProvider>
        <TableColumnsProvider>
          <App />
        </TableColumnsProvider>
        </ViewProvider>
        </RemindersProvider>
        </FilterProvider>
      </ExcelProvider>
    </Router>
  </Provider>
</React.StrictMode>

);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();