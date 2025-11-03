import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={qc}>
    <App />
  </QueryClientProvider>,
  document.getElementById('root')
);
