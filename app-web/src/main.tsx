import '@ui5/webcomponents-react/dist/Assets.js';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@ui5/webcomponents-react';
import App from './App';
import { useAuthStore } from '@/stores/authStore';
import './index.css';
import './styles/fiori-layout.css';

function Bootstrapper() {
  useEffect(() => {
    void useAuthStore.getState().bootstrap();
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Bootstrapper />
    </ThemeProvider>
  </React.StrictMode>
);
