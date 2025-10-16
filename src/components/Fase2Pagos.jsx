
import React, { useMemo } from 'react';
import DatePicker from 'react-datepicker';

const Fase2Pagos = ({ onBack, onNext, referencias, setReferencias, errors, setErrors }) => {
    const [newRef, setNewRef] = React.useState({ NroReferencia: '', Fecha: new Date(), Importe: '' });

    const totalReferencias = useMemo(() => {
        return referencias.reduce((sum, ref) => sum + parseFloat(ref.Importe || 0), 0);
    }, [referencias]);

    const handleNewRefChange = (e) => {
        const { name, value } = e.target;
        setNewRef(prev => ({...prev, [name]: value}));
        if(errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };
    
    const handleDateChange = (date) => {
        setNewRef(prev => ({...prev, Fecha: date}));
    };

    const handleAddReferencia = () => {
        if (!newRef.NroReferencia || !newRef.Importe) {
            alert('El N° de Referencia y el Importe son obligatorios.');
            return;
        }
        setReferencias(prev => [
            ...prev, 
            { id: crypto.randomUUID(), ...newRef, Importe: parseFloat(newRef.Importe), Fecha: newRef.Fecha.toISOString().slice(0, 10) }
        ]);
        setNewRef({ NroReferencia: '', Fecha: new Date(), Importe: '' });
    };

    const handleRemoveReferencia = (id) => {
        setReferencias(prev => prev.filter(ref => ref.id !== id));
    };

    return (
        <div className="space-y-6"> {/* Contenedor principal para organizar el espacio */}
            {/* --- TARJETA PARA AÑADIR REFERENCIAS --- */}
            <div className="p-5 bg-white dark:bg-slate-800/50 shadow-lg rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Añadir Referencia de Pago</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="NroReferencia">N° Referencia <span className="text-rose-500">*</span></label><input id="NroReferencia" type="text" name="NroReferencia" value={newRef.NroReferencia} onChange={handleNewRefChange} className="form-input w-full dark:bg-gray-700" /></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="Fecha">Fecha <span className="text-rose-500">*</span></label><DatePicker selected={newRef.Fecha} onChange={handleDateChange} dateFormat="dd/MM/yyyy" className="form-input w-full dark:bg-gray-700" /></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300" htmlFor="Importe">Importe <span className="text-rose-500">*</span></label><input id="Importe" type="number" name="Importe" value={newRef.Importe} onChange={handleNewRefChange} className="form-input w-full dark:bg-gray-700" /></div>
                </div>
                <div className="flex justify-end mt-4">
                    <button type="button" onClick={handleAddReferencia} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">Añadir Referencia</button>
                </div>
            </div>

            {/* --- SECCIÓN DE LISTA DE REFERENCIAS Y RESUMEN --- */}
            <div className="p-5 bg-white dark:bg-slate-800/50 shadow-lg rounded-lg">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Resumen de Pagos</h3>
                 {referencias.length === 0 ? (
                    //  DISEÑO MEJORADO PARA CUANDO LA LISTA ESTÁ VACÍA
                     <div className="text-center py-10">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <h4 className="mt-2 text-md font-semibold text-gray-800 dark:text-gray-100">Sin referencias de pago</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Añade una referencia usando el formulario de arriba.</p>
                     </div>
                 ) : (
                    <div className="space-y-6">
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full dark:text-gray-300">
                                <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50"><tr><th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">N° Referencia</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Fecha</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-right">Importe</div></th><th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Acción</div></th></tr></thead>
                                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">{referencias.map(ref => (<tr key={ref.id}><td className="p-2 whitespace-nowrap">{ref.NroReferencia}</td><td className="p-2 whitespace-nowrap">{ref.Fecha}</td><td className="p-2 whitespace-nowrap text-right">S/ {parseFloat(ref.Importe).toFixed(2)}</td><td className="p-2 whitespace-nowrap text-center"><button onClick={() => handleRemoveReferencia(ref.id)} className="text-rose-500 hover:text-rose-600 font-medium">Eliminar</button></td></tr>))}</tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg shadow-inner w-full max-w-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Importe Total:</span>
                                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">S/ {totalReferencias.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">Este será el importe final de la boleta/factura.</p>
                            </div>
                        </div>
                    </div>
                 )}
            </div>

            {/* --- BOTONES DE NAVEGACIÓN --- */}
            <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={onBack} className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">Atrás</button>
                <button type="button" onClick={onNext} className="btn bg-indigo-500 hover:bg-indigo-600 text-white" disabled={referencias.length === 0}>Siguiente</button>
            </div>
        </div>
    );
};

export default Fase2Pagos;
