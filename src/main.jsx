import studio from '@theatre/studio';
import extension from '@theatre/r3f/extension';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ResourceDetails from './Components/Resources';

studio.extend(extension);
studio.initialize();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <App />
      {/* <ResourceDetails /> */}
    </Suspense>
  </React.StrictMode>
);
