import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import { store } from './store';
import './i18n/i18n';
import { User } from './utils/models';

// Define User globally to fix "User is not defined" error
// This is a temporary solution - in a real app, you'd properly define models and types
window.User = User;

// Add User class to global window scope
declare global {
  interface Window {
    User: typeof User;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);