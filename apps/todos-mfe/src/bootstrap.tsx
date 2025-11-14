import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { queryClient, apolloClient } from '@react-stack/shared-utils';
import TodosREST from './pages/TodosREST';
import TodosGraphQL from './pages/TodosGraphQL';
import './index.css';

// Bootstrap for standalone development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 p-8">
            <Routes>
              <Route path="/todos/rest" element={<TodosREST />} />
              <Route path="/todos/graphql" element={<TodosGraphQL />} />
              <Route path="/" element={<TodosREST />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
