import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatInterface from './pages/ChatInterface';
import './index.css';

// Bootstrap for standalone development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-50 p-8">
      <ChatInterface />
    </div>
  </React.StrictMode>
);
