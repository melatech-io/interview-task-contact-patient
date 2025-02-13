import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { PatientsProvider } from './context/patients';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <StrictMode>
      <PatientsProvider>
        <App />
      </PatientsProvider>
    </StrictMode>
  </BrowserRouter>
);
