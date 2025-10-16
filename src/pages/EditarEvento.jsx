import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';

import { useSettings } from '../context/SettingsContext';
import { useFormulario, NOMBRE_TABLA_EVENTOS, NOMBRE_TABLA_HORARIOS } from '../context/FormularioContext';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import GestionInstalacionesModal from '../components/GestionInstalacionesModal';
import EditListModal from '../components/EditListModal';

registerLocale('es', es);

// --- HELPERS ---
const parseTimeString = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') { hours = '00'; }
    if (modifier === 'PM') { hours = parseInt(hours, 10) + 12; }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
};


// --- COMPONENTES INTERNOS ---
const CustomTimePicker = ({ selected, onChange, hasError }) => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const selectedHour = selected ? selected.getHours() : 0;
    const selectedMinute = selected ? selected.getMinutes() : 0;
    const displayHour = selectedHour % 12 === 0 ? 12 : selectedHour % 12;
    const displayAmPm = selectedHour >= 12 ? 'PM' : 'AM';

    const handleTimeChange = (part, value) => {
        const newDate = selected ? new Date(selected) : new Date();
        let currentHour = newDate.getHours();
        if (part === 'hour') {
            const newHour = parseInt(value, 10);
            const isPM = currentHour >= 12;
            if (isPM && newHour !== 12) newDate.setHours(newHour + 12);
            else if (!isPM && newHour === 12) newDate.setHours(0);
            else newDate.setHours(newHour);
        } else if (part === 'minute') {
            newDate.setMinutes(parseInt(value, 10));
        } else if (part === 'ampm') {
            const isPM = value === 'PM';
            if (isPM && currentHour < 12) newDate.setHours(currentHour + 12);
            else if (!isPM && currentHour >= 12) newDate.setHours(currentHour - 12);
        }
        onChange(newDate);
    };
    const errorClasses = hasError ? 'border-rose-500' : 'dark:border-gray-600';
    return (
        <div className={`flex gap-2 rounded-md border ${errorClasses} p-1.5`}>
            <select value={displayHour} onChange={(e) => handleTimeChange('hour', e.target.value)} className="form-select dark:bg-gray-800 border-none w-full">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
            <select value={selectedMinute.toString().padStart(2, '0')} onChange={(e) => handleTimeChange('minute', e.target.value)} className="form-select dark:bg-gray-800 border-none w-full">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
            <select value={displayAmPm} onChange={(e) => handleTimeChange('ampm', e.target.value)} className="form-select dark:bg-gray-800 border-none w-full"><option>AM</option><option>PM</option></select>
        </div>
    );
};

const EventoForm = ({ formData, handleInputChange, database, settings, handleOpenModal, handleOpenInstalacionesModal, errors }) => (
    <div className="space-y-8">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Datos del Evento</h2><div className="grid gap-6 md:grid-cols-2"><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="nombreEvento">Nombre Evento <span className="text-rose-500">*</span></label><input id="nombreEvento" type="text" name="nombreEvento" onChange={handleInputChange} value={formData.nombreEvento} className={`form-input w-full dark:bg-gray-700 ${errors.nombreEvento ? 'border-rose-500' : ''}`} required /></div><div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="instalacion">Instalación <span className="text-rose-500">*</span></label>
            <div className="flex items-center gap-2">
                <select id="instalacion" name="instalacion" onChange={handleInputChange} value={formData.instalacion} className={`form-select w-full dark:bg-gray-700 ${errors.instalacion ? 'border-rose-500' : ''}`} required>
                    {(database.Instalaciones || []).map(item => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
                </select>
                <button type="button" onClick={handleOpenInstalacionesModal} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Gestionar</button>
            </div>
        </div><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="tipoEvento">Tipo Evento <span className="text-rose-500">*</span></label><div className="flex items-center gap-2">
            <select id="tipoEvento" name="tipoEvento" onChange={handleInputChange} value={formData.tipoEvento} className={`form-select w-full dark:bg-gray-700 ${errors.tipoEvento ? 'border-rose-500' : ''}`} required>
                {(settings.comboValues.tiposEvento || []).map(item => <option key={item}>{item}</option>)}
            </select>
            <button type="button" onClick={() => handleOpenModal('tiposEvento')} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">...</button></div></div><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="motivo">Motivo <span className="text-rose-500">*</span></label><div className="flex items-center gap-2">
            <select id="motivo" name="motivo" onChange={handleInputChange} value={formData.motivo} className={`form-select w-full dark:bg-gray-700 ${errors.motivo ? 'border-rose-500' : ''}`} required>
                 {(settings.comboValues.motivos || []).map(item => <option key={item}>{item}</option>)}
            </select>
            <button type="button" onClick={() => handleOpenModal('motivos')} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">...</button></div></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="descripcion">Descripción</label><textarea id="descripcion" name="descripcion" onChange={handleInputChange} value={formData.descripcion} className="form-textarea w-full md:col-span-2 dark:bg-gray-700"></textarea></div></div></div>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Datos del Remitente</h2><div className="grid gap-6 md:grid-cols-2"><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="nombreRemitente">Nombre Remitente <span className="text-rose-500">*</span></label><input id="nombreRemitente" type="text" name="nombreRemitente" onChange={handleInputChange} value={formData.nombreRemitente} className={`form-input w-full dark:bg-gray-700 ${errors.nombreRemitente ? 'border-rose-500' : ''}`} required /></div><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="cargo">Cargo <span className="text-rose-500">*</span></label><input id="cargo" type="text" name="cargo" onChange={handleInputChange} value={formData.cargo} className={`form-input w-full dark:bg-gray-700 ${errors.cargo ? 'border-rose-500' : ''}`} required /></div></div></div>
        <div className="p-5"><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Datos del Solicitante</h2><div className="space-y-4"><div className="flex items-center"><input id="representaInstitucion" type="checkbox" name="representaInstitucion" onChange={handleInputChange} checked={formData.representaInstitucion} className="form-checkbox" /><label className="ml-2 text-sm text-gray-600 dark:text-gray-300" htmlFor="representaInstitucion">¿Representa a una institución o entidad?</label></div>{formData.representaInstitucion && (<div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="cualInstitucion">¿Cuál?</label><input id="cualInstitucion" type="text" name="cualInstitucion" onChange={handleInputChange} value={formData.cualInstitucion} className={`form-input w-full dark:bg-gray-700 ${errors.cualInstitucion ? 'border-rose-500' : ''}`} /></div>)}<div className="grid gap-6 md:grid-cols-2"><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="nombreSolicitante">Nombre Solicitante <span className="text-rose-500">*</span></label><input id="nombreSolicitante" type="text" name="nombreSolicitante" onChange={handleInputChange} value={formData.nombreSolicitante} className={`form-input w-full dark:bg-gray-700 ${errors.nombreSolicitante ? 'border-rose-500' : ''}`} required /></div><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="dniRuc">DNI/RUC <span className="text-rose-500">*</span></label><input id="dniRuc" type="text" name="dniRuc" onChange={handleInputChange} value={formData.dniRuc} className={`form-input w-full dark:bg-gray-700 ${errors.dniRuc ? 'border-rose-500' : ''}`} required /></div><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="correo">Correo <span className="text-rose-500">*</span></label><input id="correo" type="email" name="correo" onChange={handleInputChange} value={formData.correo} className={`form-input w-full dark:bg-gray-700 ${errors.correo ? 'border-rose-500' : ''}`} required /></div><div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="telefono">Teléfono <span className="text-rose-500">*</span></label><input id="telefono" type="tel" name="telefono" onChange={handleInputChange} value={formData.telefono} className={`form-input w-full dark:bg-gray-700 ${errors.telefono ? 'border-rose-500' : ''}`} required /></div></div></div></div>
    </div>
);

const HorarioForm = ({ formData, horarios, setHorarios, settings, handleOpenModal, errors: horarioErrors, setErrors: setHorarioErrors }) => {
    const getInitialHorarioState = () => {
        const defaultStartTime = new Date();
        defaultStartTime.setHours(8, 0, 0, 0);
        const defaultEndTime = new Date();
        defaultEndTime.setHours(9, 0, 0, 0);
        return {
            espacioDeportivo: (settings.comboValues.espaciosDeportivos && settings.comboValues.espaciosDeportivos[0]) || '',
            fecha: null,
            horaInicio: defaultStartTime,
            horaFin: defaultEndTime
        };
    };

    const [newHorario, setNewHorario] = useState(getInitialHorarioState());
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        setNewHorario(getInitialHorarioState());
    }, [settings]);

    const handleHorarioChange = (field, value) => {
        setNewHorario(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
    };

    const validateHorario = () => {
        const newErrors = {};
        if (!newHorario.fecha) newErrors.fecha = true;
        if (newHorario.horaFin <= newHorario.horaInicio) newErrors.horaFin = true;
        return newErrors;
    };

    const handleAddHorario = () => {
        const newErrors = validateHorario();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formattedHorario = {
            id: crypto.randomUUID(), // ID Temporal del lado del cliente
            espacioDeportivo: newHorario.espacioDeportivo,
            fecha: newHorario.fecha.toLocaleDateString('es-ES'),
            horaInicio: newHorario.horaInicio.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            horaFin: newHorario.horaFin.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
        setHorarios(prev => [...prev, formattedHorario]);
        setNewHorario(getInitialHorarioState());
        setErrors({});
        if (horarioErrors.global) setHorarioErrors(prev => ({ ...prev, global: null }));
    };

    const handleRemoveHorario = (id) => {
        setHorarios(prev => prev.filter(h => h.id !== id));
    };

    return (
        <div className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Configuración de Horario para "{formData.nombreEvento || ''}"</h2>
            {horarioErrors.global && <div className="mb-4 text-center text-sm text-rose-500">{horarioErrors.global}</div>}
            <div className="grid gap-4 md:grid-cols-4 items-start border p-4 rounded-md dark:border-gray-700">
                <div className="md:col-span-1"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Espacio Deportivo</label><div className="flex items-center gap-2">
                    <select name="espacioDeportivo" value={newHorario.espacioDeportivo} onChange={(e) => handleHorarioChange('espacioDeportivo', e.target.value)} className="form-select w-full dark:bg-gray-700">
                        {(settings.comboValues.espaciosDeportivos || []).map(item => <option key={item}>{item}</option>)}
                    </select>
                    <button type="button" onClick={() => handleOpenModal('espaciosDeportivos')} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">...</button></div></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label><DatePicker selected={newHorario.fecha} onChange={date => handleHorarioChange('fecha', date)} dateFormat="dd/MM/yyyy" locale="es" className={`form-input w-full dark:bg-gray-700 ${errors.fecha ? 'border-rose-500' : ''}`} placeholderText="Seleccionar fecha" /></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Hora Inicio</label><CustomTimePicker selected={newHorario.horaInicio} onChange={date => handleHorarioChange('horaInicio', date)} hasError={errors.horaInicio} /></div>
                <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Hora Fin</label><CustomTimePicker selected={newHorario.horaFin} onChange={date => handleHorarioChange('horaFin', date)} hasError={errors.horaFin} />{errors.horaFin && <div className="text-xs mt-1 text-rose-500">La hora de fin debe ser posterior a la de inicio.</div>}</div>
                <div className="md:col-span-4 flex justify-end mt-2"><button type="button" onClick={handleAddHorario} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">Añadir Horario</button></div>
            </div>
            <div className="mt-8"><h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Horarios Agregados</h3>{horarios.length === 0 ? (<div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"><p className="text-gray-500 dark:text-gray-400">Aún no se han agregado horarios para este evento.</p></div>) : (<div className="overflow-x-auto"><table className="table-auto w-full dark:text-gray-300"><thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50"><tr><th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Espacio Deportivo</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Fecha</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Hora Inicio</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Hora Fin</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Acciones</div></th></tr></thead><tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">{horarios.map(h => (<tr key={h.id}><td className="p-2 whitespace-nowrap">{h.espacioDeportivo}</td><td className="p-2 whitespace-nowrap">{h.fecha}</td><td className="p-2 whitespace-nowrap">{h.horaInicio}</td><td className="p-2 whitespace-nowrap">{h.horaFin}</td><td className="p-2 whitespace-nowrap text-center"><button onClick={() => handleRemoveHorario(h.id)} className="text-rose-500 hover:text-rose-600">Eliminar</button></td></tr>))}</tbody></table></div>)}</div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DE EDICIÓN (VERSIÓN FINAL Y VERIFICADA) ---

function EditarEvento() {
  const { eventoId } = useParams();
  // ¡Traemos las nuevas funciones del contexto!
  const { database, isLoading, actualizarEventoCompleto, guardarCambios } = useFormulario(); 
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingListKey, setEditingListKey] = useState(null);
  const [isInstalacionesModalOpen, setIsInstalacionesModalOpen] = useState(false);
  
  const [formData, setFormData] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoading && database && eventoId) {
      const idNumerico = parseInt(eventoId);
      const eventoAEditar = database[NOMBRE_TABLA_EVENTOS]?.find(e => e.id === idNumerico);
      
      if (eventoAEditar) {
        setFormData({ ...eventoAEditar });
        
        const horariosDelEvento = database[NOMBRE_TABLA_HORARIOS]?.filter(h => h.eventoId === idNumerico) || [];
        
        setHorarios(horariosDelEvento.map(h => ({ ...h })));

      } else {
        console.error("Evento con ID", eventoId, "no fue encontrado. Redirigiendo.");
        navigate('/gestion-eventos');
      }
    }
  }, [database, eventoId, navigate, isLoading]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validateStep1 = () => {
      const newErrors = {};
      const requiredFields = ['nombreEvento', 'instalacion', 'tipoEvento', 'motivo', 'nombreRemitente', 'cargo', 'nombreSolicitante', 'dniRuc', 'correo', 'telefono'];
      requiredFields.forEach(field => {
          if (!formData[field]) newErrors[field] = true;
      });
      if (formData.representaInstitucion && !formData.cualInstitucion) newErrors.cualInstitucion = true;
      return newErrors;
  };

  const handleNextStep = (e) => {
      e.preventDefault();
      const newErrors = validateStep1();
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
          setStep(2);
      }
  };

  const handlePrevStep = () => { 
      setErrors({});
      setStep(1);
  };

  // --- FUNCIÓN DE GUARDADO FINAL ---
  const handleFinalSubmit = async () => {
    if (horarios.length === 0) {
        setErrors(prev => ({ ...prev, global: 'Debe agregar al menos un horario para guardar el evento.'}));
        return;
    }
    
    try {
        console.log("Iniciando guardado...");
        await actualizarEventoCompleto(formData, horarios);
        await guardarCambios(); // Persiste todos los cambios en el archivo
        console.log("¡Guardado completado con éxito!");
        navigate('/gestion-eventos');
    } catch (error) {
        console.error("Error al guardar los cambios del evento:", error);
        // Opcional: Mostrar un mensaje de error al usuario
        alert("Ocurrió un error al guardar los cambios. Por favor, intente de nuevo.");
    }
  }

  const handleOpenModal = (key) => { setEditingListKey(key); setModalOpen(true); };
  
  const handleSaveList = (listName, updatedList) => {
    updateSettings({
        comboValues: {
            ...settings.comboValues,
            [listName]: updatedList
        }
    });
    setModalOpen(false);
  };
  
  const getModalTitle = () => `Editar ${{'tiposEvento':'Tipos de Evento','motivos':'Motivos', 'espaciosDeportivos': 'Espacios Deportivos'}[editingListKey] || 'Lista'}`

  if (isLoading || !formData) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Cargando datos del evento...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Por favor, espere un momento.</p>
            </div>
        </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow"><div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-8">Editar Evento</h1>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={e => e.preventDefault()}>
              {step === 1 && <EventoForm formData={formData} handleInputChange={handleInputChange} database={database} settings={settings} handleOpenModal={handleOpenModal} handleOpenInstalacionesModal={() => setIsInstalacionesModalOpen(true)} errors={errors} />}
              {step === 2 && <HorarioForm formData={formData} horarios={horarios} setHorarios={setHorarios} settings={settings} handleOpenModal={handleOpenModal} errors={errors} setErrors={setErrors} />}
              <div className="flex justify-between items-center mt-8">
                <div>
                    {step === 2 && <button onClick={handlePrevStep} className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">Atrás</button>}
                </div>
                <div className="flex gap-4">
                    {step === 1 && <button onClick={handleNextStep} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">Siguiente</button>}
                    {step === 2 && <button onClick={handleFinalSubmit} className="btn bg-emerald-500 hover:bg-emerald-600 text-white">Guardar Cambios</button>}
                </div>
              </div>
            </form>
          </div>
        </div></main>
        
        <EditListModal 
            modalOpen={modalOpen} 
            setModalOpen={setModalOpen}
            title={getModalTitle()} 
            items={(editingListKey && settings.comboValues[editingListKey]) ? settings.comboValues[editingListKey] : []} 
            onSave={(updatedList) => handleSaveList(editingListKey, updatedList)} 
        />
        
        <GestionInstalacionesModal
            isVisible={isInstalacionesModalOpen}
            onClose={() => setIsInstalacionesModalOpen(false)}
            instalaciones={database.Instalaciones || []}
        />
      </div>
    </div>
  );
}

export default EditarEvento;
