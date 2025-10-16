import React, { useEffect, useRef } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Horarios from './pages/Horarios';
import Database from './pages/Database';
import AñadirEvento from './pages/AñadirEvento';
import EditarEvento from './pages/EditarEvento';
import GestionEventos from './pages/GestionEventos';
import AñadirBoletaFactura from './pages/AñadirBoletaFactura';
import EditarBoletaFactura from './pages/EditarBoletaFactura';
import Backups from './pages/Backups';
import ViewExcel from './pages/ViewExcel';
import Reportes from './pages/Reportes';
import GestionBoletas from './pages/GestionBoletas';
import Menu from './pages/Menu'; // <-- Nueva importación

// Importar el contexto y el componente de notificación
import { useFormulario } from './context/FormularioContext';
import SaveNotification from './components/SaveNotification';

function App() {
  const location = useLocation();
  const { tieneCambiosSinGuardar, guardarCambios, descartarCambios } = useFormulario();

  const tieneCambiosRef = useRef(tieneCambiosSinGuardar);
  const guardarCambiosRef = useRef(guardarCambios);

  useEffect(() => {
    tieneCambiosRef.current = tieneCambiosSinGuardar;
    guardarCambiosRef.current = guardarCambios;
  }, [tieneCambiosSinGuardar, guardarCambios]);

  useEffect(() => {
    if (window.Neutralino) {
      const onWindowClose = async () => {
        if (tieneCambiosRef.current) {
          let button = await Neutralino.os.showMessageBox(
            'Cambios sin guardar',
            '¿Quieres guardar los cambios pendientes antes de salir?',
            'YES_NO_CANCEL',
            'QUESTION'
          );

          switch(button) {
            case 'YES':
              await guardarCambiosRef.current();
              Neutralino.app.exit();
              break;
            case 'NO':
              Neutralino.app.exit();
              break;
            case 'CANCEL':
              break;
          }
        } else {
          Neutralino.app.exit();
        }
      };

      Neutralino.events.on('windowClose', onWindowClose);

      return () => {
          Neutralino.events.off('windowClose', onWindowClose);
      };
    }
  }, []);

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} /> {/* <-- Nueva ruta */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/database" element={<Database />} />
        <Route path="/añadir-evento" element={<AñadirEvento />} />
        <Route path="/editar-evento/:eventoId" element={<EditarEvento />} />
        <Route path="/gestion-eventos" element={<GestionEventos />} />
        <Route path="/gestion-boletas" element={<GestionBoletas />} />
        <Route path="/añadir-boleta-factura" element={<AñadirBoletaFactura />} />
        <Route path="/editar-boleta-factura/:id" element={<EditarBoletaFactura />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="/view-excel" element={<ViewExcel />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>

      <SaveNotification
        open={tieneCambiosSinGuardar}
        onSave={guardarCambios}
        onDiscard={descartarCambios}
      />
    </>
  );
}

export default App;
