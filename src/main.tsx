import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { RequestProvider } from './context/RequestContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RequestProvider>
          <App />
          <Toaster position="top-right" />
        </RequestProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
