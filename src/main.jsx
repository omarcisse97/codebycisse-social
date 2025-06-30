import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './components/contexts/AuthContext.jsx';
import { Toaster } from 'sonner';

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Auth0Provider
      domain="dev-z1k4catd6k1lwiv2.us.auth0.com"
      clientId="rLlKLgNjBE0MQUnhHFVDrSY6jctXQSPb"
      authorizationParams={{
        redirect_uri: 'http://localhost:5173/'
      }}
    > */}
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right"
        richColors 
        closeButton
        duration={4000}
      /> 
    </AuthProvider>
    {/* </Auth0Provider> */}
  </StrictMode>,
)
