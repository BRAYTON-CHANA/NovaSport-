
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
// ¡Importamos las herramientas necesarias!
import { useFormulario, NOMBRE_TABLA_EVENTOS } from '../context/FormularioContext';

// --- COMPONENTE DROPDOWN PARA ACCIONES (Sin cambios) ---
const AccionesDropdown = ({ evento, onEdit, onDelete }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const trigger = useRef(null);
    const dropdown = useRef(null);

    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!dropdown.current) return;
            if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
            setDropdownOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    }, [dropdownOpen]);

    return (
        <div className="relative inline-flex">
            <button
                ref={trigger}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 p-1"
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
            >
                <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
            </button>
            <div
                ref={dropdown}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
                className={`origin-top-right z-10 absolute top-full right-0 min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${dropdownOpen ? '' : 'hidden'}`}
            >
                <ul>
                    <li>
                        <button
                            className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 flex py-1 px-3"
                            onClick={() => { onEdit(); setDropdownOpen(false); }}
                        >
                            Editar
                        </button>
                    </li>
                    <li>
                        <button
                            className="font-medium text-sm text-rose-500 hover:text-rose-600 flex py-1 px-3"
                            onClick={() => { onDelete(); setDropdownOpen(false); }}
                        >
                            Eliminar
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (Con lógica de eliminación) ---

function GestionEventos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [instalacionFilter, setInstalacionFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [motivoFilter, setMotivoFilter] = useState('all');
  // Obtenemos todo lo que necesitamos del contexto
  const { database, eliminarRegistro, guardarCambios } = useFormulario();

  const instalaciones = useMemo(() => database ? [...new Set(database.Eventos.map(e => e.instalacion))] : [], [database]);
  const tipos = useMemo(() => database ? [...new Set(database.Eventos.map(e => e.tipoEvento))] : [], [database]);
  const motivos = useMemo(() => database ? [...new Set(database.Eventos.map(e => e.motivo))] : [], [database]);

  const filteredEventos = useMemo(() => {
    if (!database || !database.Eventos) return [];
    const horarioCounts = (database.Horarios || []).reduce((acc, horario) => {
      acc[horario.eventoId] = (acc[horario.eventoId] || 0) + 1;
      return acc;
    }, {});
    return database.Eventos
      .map(evento => ({ ...evento, horariosCount: horarioCounts[evento.id] || 0 }))
      .filter(evento => {
        const searchMatch = evento.nombreEvento.toLowerCase().includes(searchTerm.toLowerCase());
        const instalacionMatch = instalacionFilter === 'all' || evento.instalacion === instalacionFilter;
        const tipoMatch = tipoFilter === 'all' || evento.tipoEvento === tipoFilter;
        const motivoMatch = motivoFilter === 'all' || evento.motivo === motivoFilter;
        return searchMatch && instalacionMatch && tipoMatch && motivoMatch;
      });
  }, [database, searchTerm, instalacionFilter, tipoFilter, motivoFilter]);
  
  const handleEdit = (eventoId) => {
    navigate(`/editar-evento/${eventoId}`);
  };

  // --- LÓGICA DE ELIMINACIÓN IMPLEMENTADA ---
  const handleDelete = async (eventoId) => {
    // Usamos window.confirm para una capa extra de seguridad
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento y todos sus horarios asociados? Esta acción no se puede deshacer.')) {
        try {
            // 1. Llama a la función del contexto para eliminar del estado
            eliminarRegistro(NOMBRE_TABLA_EVENTOS, eventoId);
            // 2. Guarda los cambios en el archivo database.json
            await guardarCambios();
            console.log(`El evento con ID ${eventoId} fue eliminado exitosamente.`);
        } catch (error) {
            console.error('Error al eliminar el evento:', error);
            alert('Ocurrió un error al eliminar el evento. Por favor, inténtelo de nuevo.');
        }
    }
  };

  if (!database) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow"><div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                    <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-8">Gestión de Eventos</h1>
                    <div className="text-center text-gray-500 dark:text-gray-400">Cargando datos...</div>
                </div></main>
            </div>
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
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Gestión de Eventos</h1>
              <button onClick={() => navigate('/añadir-evento')} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">
                <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16"><path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" /></svg>
                <span className="hidden xs:block ml-2">Añadir Evento</span>
              </button>
            </div>

            {/* Panel de Filtros */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <input 
                        type="search" 
                        className="form-input w-full dark:bg-gray-700" 
                        placeholder="Buscar por nombre..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select className="form-select dark:bg-gray-700 dark:text-gray-300" value={instalacionFilter} onChange={e => setInstalacionFilter(e.target.value)}>
                        <option value="all">Todas las Instalaciones</option>
                        {instalaciones.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select className="form-select dark:bg-gray-700 dark:text-gray-300" value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}>
                        <option value="all">Todos los Tipos</option>
                        {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="form-select dark:bg-gray-700 dark:text-gray-300" value={motivoFilter} onChange={e => setMotivoFilter(e.target.value)}>
                        <option value="all">Todos los Motivos</option>
                        {motivos.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Lista de Eventos Registrados ({filteredEventos.length})</h2>
              </header>
              <div className="p-3">
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                      <tr>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Nombre del Evento</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Instalación</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Tipo</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Motivo</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">N° de Horarios</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Acciones</div></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredEventos.length > 0 ? (
                        filteredEventos.map(evento => (
                          <tr key={evento.id}>
                            <td className="p-2 whitespace-nowrap"><div className="font-medium text-gray-800 dark:text-gray-100">{evento.nombreEvento}</div></td>
                            <td className="p-2 whitespace-nowrap"><div className="text-left">{evento.instalacion}</div></td>
                            <td className="p-2 whitespace-nowrap"><div className="text-left">{evento.tipoEvento}</div></td>
                            <td className="p-2 whitespace-nowrap"><div className="text-left">{evento.motivo}</div></td>
                            <td className="p-2 whitespace-nowrap"><div className="text-center font-medium text-gray-600 dark:text-gray-300">{evento.horariosCount}</div></td>
                            <td className="p-2 whitespace-nowrap text-center">
                                <AccionesDropdown 
                                    evento={evento} 
                                    onEdit={() => handleEdit(evento.id)} 
                                    onDelete={() => handleDelete(evento.id)} 
                                />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No se encontraron eventos que coincidan con los filtros seleccionados.
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

export default GestionEventos;
