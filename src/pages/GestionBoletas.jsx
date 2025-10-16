
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useFormulario, NOMBRE_TABLA_BOLETAS_FACTURAS, NOMBRE_TABLA_GARANTIAS } from '../context/FormularioContext';

function GestionBoletas() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { database, isLoading } = useFormulario();
  const [searchTerm, setSearchTerm] = useState('');
  const [instalacionFilter, setInstalacionFilter] = useState('all');

  const documentosProcesados = useMemo(() => {
    if (isLoading || !database) return [];
    const boletas = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
    const garantias = database[NOMBRE_TABLA_GARANTIAS] || [];
    const boletasConGarantiaIds = new Set(garantias.map(g => g.boletaFacturaId));

    return boletas.map(boleta => ({
      ...boleta,
      tieneGarantia: boletasConGarantiaIds.has(boleta.id) ? 'Sí' : 'No',
      estado: boleta.Anulado === 1 ? 'Anulado' : 'Vigente',
    }));
  }, [database, isLoading]);

  const instalaciones = useMemo(() => {
      if (!documentosProcesados) return [];
      return [...new Set(documentosProcesados.map(doc => doc.Instalacion).filter(Boolean))];
  }, [documentosProcesados]);

  const filteredDocumentos = useMemo(() => {
    return documentosProcesados.filter(doc => {
        const searchMatch = !searchTerm || doc.NroDocumento?.toLowerCase().includes(searchTerm.toLowerCase());
        const instalacionMatch = instalacionFilter === 'all' || doc.Instalacion === instalacionFilter;
        return searchMatch && instalacionMatch;
    });
  }, [documentosProcesados, searchTerm, instalacionFilter]);

  const handleAdd = () => {
    navigate('/añadir-boleta-factura');
  };

  const handleEdit = (id) => {
    navigate(`/editar-boleta-factura/${id}`); // <-- Redirigir a la página de edición
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      alert(`Funcionalidad "Eliminar" para el documento ${id} pendiente de implementación.`);
    }
  };

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center"><p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Cargando datos...</p></div>
        </div>
      );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-5">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Gestión de Boletas y Facturas</h1>
              <button onClick={handleAdd} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">
                <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16"><path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" /></svg>
                <span className="hidden xs:block ml-2">Añadir Documento</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                        type="search" 
                        className="form-input w-full dark:bg-gray-700" 
                        placeholder="Buscar por N° de Documento..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select className="form-select dark:bg-gray-700 dark:text-gray-300" value={instalacionFilter} onChange={e => setInstalacionFilter(e.target.value)}>
                        <option value="all">Todas las Instalaciones</option>
                        {instalaciones.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Lista de Documentos Emitidos ({filteredDocumentos.length})</h2>
              </header>
              <div className="p-3">
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                      <tr>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">N° Documento</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Tipo Doc.</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Alquilado A</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Fecha</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Instalación</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Descripción</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Garantía</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Estado</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-right">Importe</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Acciones</div></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredDocumentos.length > 0 ? filteredDocumentos.map(doc => (
                        <tr key={doc.id}>
                          <td className="p-2 whitespace-nowrap"><div className="font-medium text-gray-800 dark:text-gray-100">{doc.NroDocumento}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.Documento}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.AlquiladoA}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.Fecha}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.Instalacion}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left text-xs">{doc.Descripcion}</div></td>
                          <td className="p-2 whitespace-nowrap text-center"><div className={`font-medium ${doc.tieneGarantia === 'Sí' ? 'text-sky-500' : 'text-gray-400'}`}>{doc.tieneGarantia}</div></td>
                          <td className="p-2 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doc.estado === 'Vigente' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-300' : 'bg-rose-100 dark:bg-rose-800 text-rose-500'}`}>
                                {doc.estado}
                            </span>
                          </td>
                          <td className="p-2 whitespace-nowrap"><div className="text-right font-medium text-emerald-500">S/ {parseFloat(doc.Importe || 0).toFixed(2)}</div></td>
                          <td className="p-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEdit(doc.id)} className="text-gray-400 hover:text-indigo-500"><span className="sr-only">Editar</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                <button onClick={() => handleDelete(doc.id)} className="text-rose-500 hover:text-rose-600"><span className="sr-only">Eliminar</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="10" className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No se encontraron documentos que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default GestionBoletas;
