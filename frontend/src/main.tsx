import React from 'react';
import ReactDOM from 'react-dom/client';
import { App }       from './App';       // Staff portal — /staff/*
import { MemberApp } from './MemberApp'; // Member site  — /*

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No #root element found');

// If the URL starts with /staff, render the staff app (login required).
// Everything else is the public member site.
const isStaff = window.location.pathname.startsWith('/staff');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    {isStaff ? <App /> : <MemberApp />}
  </React.StrictMode>
);