import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { FormularioProvider } from './context/FormularioContext';

// Intenta inicializar NeutralinoJS de forma segura.
// Esto permite que la app se ejecute tanto en el navegador como en Neutralino.
try {
  Neutralino.init();
  console.log("¡Éxito! NeutralinoJS API está activa."); // <-- MENSAJE DE CONFIRMACIÓN
} catch (e) {
  // Normal en un navegador, el objeto Neutralino no existe.
  console.log("Modo web detectado. La API de NeutralinoJS no está disponible.");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <SettingsProvider>
        <FormularioProvider>
          <App />
        </FormularioProvider>
      </SettingsProvider>
    </Router>
  </React.StrictMode>
);
