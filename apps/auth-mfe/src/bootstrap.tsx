import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Sessions from './pages/Sessions';
import './index.css';

// Bootstrap for standalone development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
