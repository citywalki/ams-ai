import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './Router';
import { useAuthStore } from './stores/authStore';

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return <Router />;
}

createRoot(document.getElementById('root')!).render(<App />);
