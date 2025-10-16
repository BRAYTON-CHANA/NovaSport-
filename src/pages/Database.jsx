
import React, { useState } from 'react';
import {
    useFormulario,
    NOMBRE_TABLA_BOLETAS_FACTURAS,
    NOMBRE_TABLA_GARANTIAS,
    NOMBRE_TABLA_RECIBOS,
    NOMBRE_TABLA_REFERENCIAS_PAGO,
    NOMBRE_TABLA_INSTALACIONES,
    NOMBRE_TABLA_EVENTOS,
    NOMBRE_TABLA_HORARIOS,
    NOMBRE_TABLA_CODIGOS,
    NOMBRE_TABLA_CUENTAS_CONTABLES
} from '../context/FormularioContext';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

// Importar los modales de gestión
import GestionInstalacionesModal from '../components/GestionInstalacionesModal';
import GestionCodigosModal from '../components/GestionCodigosModal';
import GestionCuentasContablesModal from '../components/GestionCuentasContablesModal';

// --- COMPONENTE DE TABLA REUTILIZABLE CON BOTÓN DE GESTIÓN ---
const Tabla = ({ titulo, data, columnas, onGestionar }) => (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-5 mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{titulo}</h2>
            {onGestionar && (
                <button onClick={onGestionar} className="btn bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1 px-3 rounded">
                    Gestionar
                </button>
            )}
        </div>
        <div className="overflow-x-auto">
            <table className="table-auto w-full dark:text-gray-300">
                <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                    <tr>
                        {columnas.map(col => <th key={col.Header} className="p-2 whitespace-nowrap">{col.Header}</th>)}
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {(data && data.length > 0) ? data.map((item, index) => (
                        <tr key={item.id || index}>
                            {columnas.map(col => <td key={col.accessor} className={`p-2 whitespace-nowrap ${col.className || ''}`}>{col.Cell ? col.Cell({ item }) : item[col.accessor]}</td>)}
                        </tr>
                    )) : (
                        <tr><td colSpan={columnas.length} className="p-4 text-center text-sm text-slate-500">No hay datos registrados en esta tabla.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

function Database() {
  const { database, isLoading } = useFormulario();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados para controlar la visibilidad de los modales
  const [modalInstalacionesOpen, setModalInstalacionesOpen] = useState(false);
  const [modalCodigosOpen, setModalCodigosOpen] = useState(false);
  const [modalCuentasOpen, setModalCuentasOpen] = useState(false);

  if (isLoading || !database) {
      return <div>Cargando base de datos...</div>
  }

  const columnasRecibos = [
    { Header: 'ID', accessor: 'id', className: 'text-center font-bold' },
    { Header: 'Tipo', accessor: 'Tipo', Cell: ({ item }) => <span className={`font-semibold ${item.Tipo === 'GARANTIA' ? 'text-sky-500' : item.Tipo === 'ANULADO' ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>{item.Tipo}</span> },
    { Header: 'N° Referencia', accessor: 'NroReferencia' },
  ];
  
  const columnasBoletasFacturas = [
      { Header: 'ID', accessor: 'id', className: 'text-center' }, { Header: 'N° Recibo', accessor: 'NroRecibo' },
      { Header: 'N° Documento', accessor: 'NroDocumento' }, { Header: 'Tipo Doc.', accessor: 'Documento' },
      { Header: 'Fecha', accessor: 'Fecha' }, { Header: 'Alquilado A', accessor: 'AlquiladoA' },
      { Header: 'Instalación', accessor: 'Instalacion' }, { Header: 'Categoría', accessor: 'Categoria' },
      { Header: 'Subcategoría', accessor: 'Subcategoria' }, { Header: 'Cta. Corriente', accessor: 'CuentaCorriente' },
      { Header: 'Importe Total', accessor: 'Importe', Cell: ({ item }) => `S/ ${item.Importe.toFixed(2)}`, className: 'text-right font-semibold text-emerald-500' },
      { Header: 'Anulado', accessor: 'Anulado', Cell: ({ item }) => item.Anulado ? 'Sí' : 'No', className: 'text-center' },
  ];

  const columnasGarantias = [
      { Header: 'ID', accessor: 'id', className: 'text-center' }, { Header: 'Boleta ID Asoc.', accessor: 'boletaFacturaId', className: 'text-center' },
      { Header: 'Dirigido A', accessor: 'dirigidoA' }, { Header: 'Cta. Corriente', accessor: 'cuentaCorriente' },
      { Header: 'Descripción', accessor: 'descripcion' },
      { Header: 'Monto Garantía', accessor: 'montoGarantia', Cell: ({ item }) => `S/ ${item.montoGarantia.toFixed(2)}`, className: 'text-right font-semibold text-sky-500' },
  ];

  const columnasReferencias = [
      { Header: 'ID', accessor: 'id', className: 'text-center' }, { Header: 'N° Referencia', accessor: 'NroReferencia' },
      { Header: 'Fecha', accessor: 'Fecha' },
      { Header: 'Importe', accessor: 'Importe', Cell: ({ item }) => `S/ ${item.Importe.toFixed(2)}`, className: 'text-right font-semibold text-green-500' },
      { Header: 'Vínculo', accessor: 'vinculo', Cell: ({ item }) => item.boletaFacturaId ? `Boleta ID: ${item.boletaFacturaId}` : `Garantía ID: ${item.garantiaId}` },
  ];

  const columnasEventos = [
    { Header: 'ID', accessor: 'id' }, { Header: 'Nombre Evento', accessor: 'nombreEvento' },
    { Header: 'Instalación', accessor: 'instalacion' }, { Header: 'Solicitante', accessor: 'nombreSolicitante' },
    { Header: 'DNI/RUC', accessor: 'dniRuc' }, { Header: 'Teléfono', accessor: 'telefono' },
  ];

  const columnasHorarios = [
      { Header: 'ID', accessor: 'id' }, { Header: 'Evento ID Asoc.', accessor: 'eventoId' },
      { Header: 'Espacio Deportivo', accessor: 'espacioDeportivo' }, { Header: 'Fecha', accessor: 'fecha' },
      { Header: 'Hora Inicio', accessor: 'horaInicio' }, { Header: 'Hora Fin', accessor: 'horaFin' },
  ];

  const columnasInstalaciones = [{ Header: 'ID', accessor: 'id' }, { Header: 'Nombre', accessor: 'nombre' }];
  
  // --- CORRECCIÓN DE INCONSISTENCIA ---
  const columnasCodigos = [{ Header: 'ID', accessor: 'id' }, { Header: 'Prefijo', accessor: 'prefijo' }, { Header: 'Ciudad', accessor: 'ciudad' }];

  const columnasCuentasContables = [
      { Header: 'ID', accessor: 'id' }, { Header: 'Código', accessor: 'Codigo' },
      { Header: 'Categoría', accessor: 'Categoria' }, { Header: 'Subcategoría', accessor: 'Subcategoria' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow"><div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8"><h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Visor General de la Base de Datos</h1></div>
            
            <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-bold mb-4">Datos Financieros</h2>
            <Tabla titulo="1. Libro Mayor de Recibos" data={database[NOMBRE_TABLA_RECIBOS]} columnas={columnasRecibos} />
            <Tabla titulo="2. Boletas y Facturas" data={database[NOMBRE_TABLA_BOLETAS_FACTURAS]} columnas={columnasBoletasFacturas} />
            <Tabla titulo="3. Garantías" data={database[NOMBRE_TABLA_GARANTIAS]} columnas={columnasGarantias} />
            <Tabla titulo="4. Referencias de Pago" data={database[NOMBRE_TABLA_REFERENCIAS_PAGO]} columnas={columnasReferencias} />

            <hr className="my-8 border-slate-200 dark:border-slate-700"/>
            
            <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-bold mb-4">Datos de Eventos</h2>
            <Tabla titulo="Eventos Registrados" data={database[NOMBRE_TABLA_EVENTOS]} columnas={columnasEventos} />
            <Tabla titulo="Horarios de Eventos" data={database[NOMBRE_TABLA_HORARIOS]} columnas={columnasHorarios} />

            <hr className="my-8 border-slate-200 dark:border-slate-700"/>

            <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-bold mb-4">Configuración General</h2>
            <Tabla titulo="Instalaciones" data={database[NOMBRE_TABLA_INSTALACIONES]} columnas={columnasInstalaciones} onGestionar={() => setModalInstalacionesOpen(true)} />
            <Tabla titulo="Códigos de Documento" data={database[NOMBRE_TABLA_CODIGOS]} columnas={columnasCodigos} onGestionar={() => setModalCodigosOpen(true)} />
            <Tabla titulo="Plan de Cuentas Contables" data={database[NOMBRE_TABLA_CUENTAS_CONTABLES]} columnas={columnasCuentasContables} onGestionar={() => setModalCuentasOpen(true)} />

        </div></main>
      </div>

      {/* Renderizar los modales */}
      <GestionInstalacionesModal isVisible={modalInstalacionesOpen} onClose={() => setModalInstalacionesOpen(false)} instalaciones={database[NOMBRE_TABLA_INSTALACIONES]} />
      <GestionCodigosModal isVisible={modalCodigosOpen} onClose={() => setModalCodigosOpen(false)} codigos={database[NOMBRE_TABLA_CODIGOS]} />
      <GestionCuentasContablesModal isVisible={modalCuentasOpen} onClose={() => setModalCuentasOpen(false)} />

    </div>
  );
}

export default Database;
