import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css'; // Bootstraps JIVEXA CSS variables & resets
import { AuthProvider } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <HealthDataProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </HealthDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);

