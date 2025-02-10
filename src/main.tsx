import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { ThemeProvider } from './contexts/theme-provider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="empathy-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
