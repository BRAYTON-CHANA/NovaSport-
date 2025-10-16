import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFormulario, NOMBRE_TABLA_HORARIOS, NOMBRE_TABLA_EVENTOS } from '../../context/FormularioContext';

// --- Estilos (sin cambios) ---
const colorClasses = {
  emerald: 'bg-emerald-100 dark:bg-emerald-400/30 text-emerald-600 dark:text-emerald-300',
  indigo: 'bg-indigo-100 dark:bg-indigo-400/30 text-indigo-600 dark:text-indigo-300',
  sky: 'bg-sky-100 dark:bg-sky-400/30 text-sky-600 dark:text-sky-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-400/30 text-yellow-600 dark:text-yellow-300',
  rose: 'bg-rose-100 dark:bg-rose-400/30 text-rose-600 dark:text-rose-300',
  blue: 'bg-blue-100 dark:bg-blue-400/30 text-blue-600 dark:text-blue-300',
  teal: 'bg-teal-100 dark:bg-teal-400/30 text-teal-600 dark:text-teal-300',
  orange: 'bg-orange-100 dark:bg-orange-400/30 text-orange-600 dark:text-orange-300',
  lime: 'bg-lime-100 dark:bg-lime-400/30 text-lime-600 dark:text-lime-300',
  pink: 'bg-pink-100 dark:bg-pink-400/30 text-pink-600 dark:text-pink-300',
  purple: 'bg-purple-100 dark:bg-purple-400/30 text-purple-600 dark:text-purple-300',
  cyan: 'bg-cyan-100 dark:bg-cyan-400/30 text-cyan-600 dark:text-cyan-300',
  amber: 'bg-amber-100 dark:bg-amber-400/30 text-amber-600 dark:text-amber-300',
  fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-400/30 text-fuchsia-600 dark:text-fuchsia-300',
};
const colorPalette = Object.keys(colorClasses);
const statusColorClasses = {
    Finalizado: 'bg-rose-100 dark:bg-rose-500/30 text-rose-500 dark:text-rose-400',
    'En Proceso': 'bg-emerald-100 dark:bg-emerald-400/30 text-emerald-500 dark:text-emerald-400',
    Programado: 'bg-sky-100 dark:bg-sky-500/30 text-sky-600 dark:text-sky-400',
};

const initialFilters = {
  instalacion: 'all',
  institucion: 'all',
  tipoEvento: 'all',
  espacioDeportivo: 'all'
};

function DashboardCard14() {
  const { database } = useFormulario();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState({ date: null, events: [] });

  // --- Estados para los filtros ---
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({ instalaciones: [], instituciones: [], tiposEvento: [], espaciosDeportivos: [] });

  const modalContent = useRef(null);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modalOpen || (modalContent.current && modalContent.current.contains(target))) return;
      setModalOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [modalOpen]);

  const parseDate = (str) => {
    const [day, month, year] = str.split('/');
    return new Date(year, parseInt(month) - 1, day);
  };

  // --- Efecto para poblar las opciones de los filtros ---
  useEffect(() => {
    const eventos = database[NOMBRE_TABLA_EVENTOS] || [];
    const horarios = database[NOMBRE_TABLA_HORARIOS] || [];
    
    const allInstalaciones = [...new Set(eventos.map(e => e.instalacion).filter(Boolean))];
    const allInstituciones = [...new Set(eventos.map(e => e.representaInstitucion ? e.cualInstitucion : 'PÚBLICO').filter(Boolean))];
    const allTiposEvento = [...new Set(eventos.map(e => e.tipoEvento).filter(Boolean))];
    const allEspaciosDeportivos = [...new Set(horarios.map(h => h.espacioDeportivo).filter(Boolean))];

    setFilterOptions({
      instalaciones: allInstalaciones.sort(),
      instituciones: allInstituciones.sort(),
      tiposEvento: allTiposEvento.sort(),
      espaciosDeportivos: allEspaciosDeportivos.sort()
    });
  }, [database]);

  // --- Efecto principal para combinar, filtrar y agrupar eventos ---
  useEffect(() => {
    const horarios = database[NOMBRE_TABLA_HORARIOS] || [];
    const eventos = database[NOMBRE_TABLA_EVENTOS] || [];
    const eventosMap = new Map(eventos.map(e => [e.id, e]));

    const combinedEvents = horarios.map(horario => {
        const eventoData = eventosMap.get(horario.eventoId) || {};
        return { ...eventoData, ...horario };
    });

    const filteredEvents = combinedEvents.filter(event => {
        const institucionDelEvento = event.representaInstitucion ? event.cualInstitucion : 'PÚBLICO';
        return (filters.instalacion === 'all' || event.instalacion === filters.instalacion) &&
               (filters.institucion === 'all' || institucionDelEvento === filters.institucion) &&
               (filters.tipoEvento === 'all' || event.tipoEvento === filters.tipoEvento) &&
               (filters.espacioDeportivo === 'all' || event.espacioDeportivo === filters.espacioDeportivo);
    });
    
    const grouped = filteredEvents.reduce((acc, horario) => {
      const dateStr = parseDate(horario.fecha).toDateString();
      if (!acc[dateStr]) { acc[dateStr] = []; }
      acc[dateStr].push(horario);
      return acc;
    }, {});

    setEventsByDate(grouped);
  }, [database, filters]);

  // --- Efecto para generar el calendario (depende de eventsByDate) ---
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthEventColorMap = new Map();
    let colorIndex = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    Object.values(eventsByDate).flat().forEach(event => {
      if (!monthEventColorMap.has(event.eventoId)) {
        monthEventColorMap.set(event.eventoId, colorPalette[colorIndex % colorPalette.length]);
        colorIndex++;
      }
    });

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const adjustedStartDay = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;
    const calendarDays = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = 0; i < adjustedStartDay; i++) {
        calendarDays.push({ day: prevMonthLastDay - adjustedStartDay + 1 + i, isCurrentMonth: false, events: [] });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateStr = date.toDateString();
        const originalEvents = eventsByDate[dateStr] || [];
        const eventsWithColor = originalEvents.map(event => ({ ...event, color: monthEventColorMap.get(event.eventoId) }));
        calendarDays.push({ day: i, isCurrentMonth: true, isToday: new Date().toDateString() === dateStr, events: eventsWithColor });
    }

    const totalCells = calendarDays.length;
    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
        calendarDays.push({ day: i, isCurrentMonth: false, events: [] });
    }

    setDays(calendarDays);
  }, [currentDate, eventsByDate]);

  // --- Handlers ---
  const getEventStatus = (fecha, horaInicio, horaFin) => {
    const now = new Date();
    const parseDateTime = (dateStr, timeStr) => {
        const [day, month, year] = dateStr.split('/');
        let [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') { hours = '00'; }
        if (modifier && modifier.toUpperCase() === 'PM') { hours = parseInt(hours, 10) + 12; }
        return new Date(year, parseInt(month) - 1, day, hours, minutes);
    };
    const start = parseDateTime(fecha, horaInicio);
    const end = parseDateTime(fecha, horaFin);

    if (now > end) return 'Finalizado';
    if (now >= start && now <= end) return 'En Proceso';
    return 'Programado';
  };

  const handleDayClick = (e, day) => {
    e.stopPropagation();
    if (day.isCurrentMonth && day.events.length > 0) {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.day);
        setSelectedDayData({ date: clickedDate, events: day.events });
        setModalOpen(true);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <React.Fragment>
      <div className="col-span-12 bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700">
        {/* Header con título y navegación de mes */}
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Calendario de Horarios</h2>
          <div className="flex items-center">
            <button onClick={handlePrevMonth} className="btn-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">&lt;</button>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mx-4">
                {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h3>
            <button onClick={handleNextMonth} className="btn-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">&gt;</button>
          </div>
        </header>

        {/* Sección de Filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* Filtro Instalación */}
                <select name="instalacion" value={filters.instalacion} onChange={handleFilterChange} className="form-select w-full text-sm dark:bg-gray-700 dark:text-gray-200">
                    <option value="all">Toda Instalación</option>
                    {filterOptions.instalaciones.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {/* Filtro Institución */}
                <select name="institucion" value={filters.institucion} onChange={handleFilterChange} className="form-select w-full text-sm dark:bg-gray-700 dark:text-gray-200">
                    <option value="all">Toda Institución</option>
                    {filterOptions.instituciones.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {/* Filtro Tipo de Evento */}
                <select name="tipoEvento" value={filters.tipoEvento} onChange={handleFilterChange} className="form-select w-full text-sm dark:bg-gray-700 dark:text-gray-200">
                    <option value="all">Todo Tipo de Evento</option>
                    {filterOptions.tiposEvento.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {/* Filtro Espacio Deportivo */}
                <select name="espacioDeportivo" value={filters.espacioDeportivo} onChange={handleFilterChange} className="form-select w-full text-sm dark:bg-gray-700 dark:text-gray-200">
                    <option value="all">Todo Espacio Deportivo</option>
                    {filterOptions.espaciosDeportivos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {/* Botón Reset */}
                <button onClick={resetFilters} className="btn-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 w-full">Limpiar Filtros</button>
            </div>
        </div>

        {/* Cuerpo del Calendario */}
        <div className="p-3">
            <div className="grid grid-cols-7 gap-px">
                {weekDays.map(day => (<div key={day} className="text-center text-xs font-semibold text-gray-500 p-2">{day}</div>))}
                {days.map((day, index) => (
                    <div key={index} onClick={(e) => handleDayClick(e, day)} className={`relative h-20 md:h-28 p-1 text-sm border border-gray-100 dark:border-gray-700/60 ${day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} ${day.events.length > 0 && day.isCurrentMonth ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}>
                        <div className={`text-right ${!day.isCurrentMonth && 'opacity-40'} ${day.isToday && 'font-bold text-violet-600'}`}>{day.day}</div>
                        {day.events.length > 0 && (
                            <div className="absolute bottom-1 left-1 right-1 px-1">
                                {day.events.slice(0, 3).map(event => (
                                    <div key={event.id} className={`truncate text-xs rounded px-1 mb-0.5 ${colorClasses[event.color] || colorClasses.emerald}`}>{event.nombreEvento}</div>
                                ))}
                                {day.events.length > 3 && (<div className="text-xs text-gray-500 dark:text-gray-400">+ {day.events.length - 3} más</div>)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* --- Modal (sin cambios) --- */}
      {createPortal(
        <React.Fragment>
          <div className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-50 transition-opacity ${modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden="true"></div>
          <div id="event-modal" className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center transform px-4 sm:px-6 transition-all ${modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div ref={modalContent} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-auto max-w-lg w-full max-h-full">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">Eventos del {selectedDayData.date?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</div>
                        <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"><div className="sr-only">Close</div><svg className="w-4 h-4 fill-current"><path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" /></svg></button>
                    </div>
                </div>
                <div className="p-5">
                    <div className="space-y-4">
                        {selectedDayData.events.map(event => {
                            const status = getEventStatus(event.fecha, event.horaInicio, event.horaFin);
                            return (
                                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${colorClasses[event.color]?.replace('text-', 'border-').replace(/bg-([a-z]+)-100/, 'border-$1-500')} bg-gray-50 dark:bg-gray-700/20`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className={`font-bold text-lg ${colorClasses[event.color]?.split(' ')[2]}`}>{event.nombreEvento}</h4>
                                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColorClasses[status]}`}>{status}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                        <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">Remitente:</strong> {event.nombreRemitente || 'N/A'}</p>
                                        <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">Institución:</strong> {event.representaInstitucion ? event.cualInstitucion : 'PÚBLICO'}</p>
                                        <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">Tipo:</strong> {event.tipoEvento || 'N/A'}</p>
                                        <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">Instalación:</strong> {event.instalacion || 'N/A'}</p>
                                        <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">Espacio:</strong> {event.espacioDeportivo || 'N/A'}</p>
                                        <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">Horario:</strong> {event.horaInicio} - {event.horaFin}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )}
    </React.Fragment>
  );
}

export default DashboardCard14;
