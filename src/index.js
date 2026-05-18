import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import { Provider } from 'react-redux';
import store from './Store';
import { HelmetProvider } from 'react-helmet-async';

// 🛡️ Security Layer: Frame-Busting Protection (Defeats Clickjacking)
if (window.self !== window.top) {
  window.top.location = window.self.location;
}

// 🛡️ Security Layer: Block Right-Click (Context Menu)
document.addEventListener('contextmenu', (e) => e.preventDefault());

// 🛡️ Security Layer: Block F12, View Source, and Inspect Shortcuts
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
    (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
  ) {
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <HelmetProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </HelmetProvider>
  </Provider>
);
