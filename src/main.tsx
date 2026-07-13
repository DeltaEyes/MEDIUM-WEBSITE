import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // App.tsx を読み込む
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);