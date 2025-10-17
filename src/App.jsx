import React, { lazy, Suspense, useEffect, useRef } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

// Import pages using React.lazy
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Horarios = lazy(() => import('./pages/Horarios'));
const Database = lazy(() => import('./pages/Database'));
const AñadirEvento = lazy(() => import('./pages/AñadirEvento'));
const EditarEvento = lazy(() => import('./pages/EditarEvento'));
const GestionEventos = lazy(() => import('./pages/GestionEventos'));
const AñadirBoletaFactura = lazy(() => import('./pages/AñadirBoletaFactura'));
const EditarBoletaFactura = lazy(() => import('./pages/EditarBoletaFactura'));
const Backups = lazy(() => import('./pages/Backups'));
const ViewExcel = lazy(() => import('./pages/ViewExcel'));
const Reportes = lazy(() => import('./pages/Reportes'));
const GestionBoletas = lazy(() => import('./pages/GestionBoletas'));
const Menu = lazy(() => import('./pages/Menu'));

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
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
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
      </Suspense>

      <SaveNotification
        open={tieneCambiosSinGuardar}
        onSave={guardarCambios}
        onDiscard={descartarCambios}
      />
    </>
  );
}

export default App;