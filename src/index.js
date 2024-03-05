import React from 'react';
import ReactDOM from 'react-dom/client';
import './General.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

//import Routes
import Login from './Login';
import ScheduleBuilder from './ScheduleBuilder';
import Account from './Account';
import CourseMaps from './CourseMaps';
import About from './About';
import Requirements from './Requirements';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route 
          exact
          path="/"
          element={<Login />}
        />
        <Route
          path="/ScheduleBuilder"
          element={<ScheduleBuilder />}
        />
        <Route
          path="/Account"
          element={<Account />}
        />
        <Route
          path="/CourseMaps"
          element={<CourseMaps />}
        />
        <Route
          path="/About"
          element={<About />}
        />
        <Route
          path="/Requirements"
          element={<Requirements />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();