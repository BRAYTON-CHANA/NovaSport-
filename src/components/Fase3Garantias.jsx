
import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';

const Fase3Garantias = ({ onBack, onSave, garantiaActiva, setGarantiaActiva, garantiasData, handleGarantiasChange, referenciasGarantia, setReferenciasGarantia }) => {

    const [newRef, setNewRef] = useState({ NroReferencia: '', Fecha: new Date(), Importe: '' });

    const montoTotalGarantia = useMemo(() => {
        return referenciasGarantia.reduce((sum, ref) => sum + parseFloat(ref.Importe || 0), 0);
    }, [referenciasGarantia]);

    const handleNewRefChange = (e) => {
        const { name, value } = e.target;
        setNewRef(prev => ({...prev, [name]: value}));
    };

    const handleDateChange = (date) => {
        setNewRef(prev => ({...prev, Fecha: date}));
    };

    const handleAddReferencia = () => {
        if (!newRef.NroReferencia || !newRef.Importe) {
            alert('El N° de Referencia y el Importe son obligatorios para la garantía.');
            return;
        }
        setReferenciasGarantia(prev => [
            ...prev, 
            { id: crypto.randomUUID(), ...newRef, Importe: parseFloat(newRef.Importe), Fecha: newRef.Fecha.toISOString().slice(0, 10) }
        ]);
        setNewRef({ NroReferencia: '', Fecha: new Date(), Importe: '' });
    };

    const handleRemoveReferencia = (id) => {
        setReferenciasGarantia(prev => prev.filter(ref => ref.id !== id));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
            <div className="flex items-center bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-lg">
                <input 
                    type="checkbox" 
                    id="activarGarantia" 
                    checked={garantiaActiva} 
                    onChange={(e) => setGarantiaActiva(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                />
                <label htmlFor="activarGarantia" className="ml-3 text-lg font-bold text-gray-800 dark:text-gray-100">¿Registrar o Aumentar Garantía?</label>
            </div>

            <div className={`space-y-6 transition-opacity duration-300 ${garantiaActiva ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                
                <div className="p-5 bg-white dark:bg-slate-800/50 shadow-lg rounded-lg">
                     <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Datos de la Garantía</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                            <textarea name="descripcion" value={garantiasData.descripcion} onChange={handleGarantiasChange} className="form-textarea w-full dark:bg-gray-700" rows="2"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Dirigido A</label>
                            <input type="text" name="dirigidoA" value={garantiasData.dirigidoA} onChange={handleGarantiasChange} className="form-input w-full dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cuenta Corriente</label>
                            <input type="text" name="cuentaCorriente" value={garantiasData.cuentaCorriente} onChange={handleGarantiasChange} className="form-input w-full dark:bg-gray-700" />
                        </div>
                     </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800/50 shadow-lg rounded-lg">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Añadir Referencia de Pago para Garantía</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">N° Referencia <span className="text-rose-500">*</span></label><input type="text" name="NroReferencia" value={newRef.NroReferencia} onChange={handleNewRefChange} className="form-input w-full dark:bg-gray-700" /></div>
                        <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label><DatePicker selected={newRef.Fecha} onChange={handleDateChange} dateFormat="dd/MM/yyyy" className="form-input w-full dark:bg-gray-700" /></div>
                        <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Importe <span className="text-rose-500">*</span></label><input type="number" name="Importe" value={newRef.Importe} onChange={handleNewRefChange} className="form-input w-full dark:bg-gray-700" /></div>
                    </div>
                    <div className="flex justify-end mt-4"><button type="button" onClick={handleAddReferencia} className="btn bg-sky-500 hover:bg-sky-600 text-white">Añadir Referencia de Garantía</button></div>
                </div>

                 <div className="p-5 bg-white dark:bg-slate-800/50 shadow-lg rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Resumen de Garantía</h3>
                    {referenciasGarantia.length === 0 ? (
                        <div className="text-center py-6"><p className="text-gray-500 dark:text-gray-400">Aún no se han agregado referencias para la garantía.</p></div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="table-auto w-full dark:text-gray-300">
                                     <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50"><tr><th className="p-2">N° Referencia</th><th className="p-2">Fecha</th><th className="p-2 text-right">Importe</th><th className="p-2 text-center">Acción</th></tr></thead>
                                     <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">{referenciasGarantia.map(ref => (<tr key={ref.id}><td className="p-2">{ref.NroReferencia}</td><td className="p-2">{ref.Fecha}</td><td className="p-2 text-right">S/ {parseFloat(ref.Importe).toFixed(2)}</td><td className="p-2 text-center"><button type="button" onClick={() => handleRemoveReferencia(ref.id)} className="text-rose-500 hover:text-rose-600 font-medium">Eliminar</button></td></tr>))}</tbody>
                                </table>
                            </div>
                            <div className="flex justify-end pt-2">
                                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg shadow-inner w-full max-w-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Monto Total Garantía:</span>
                                        <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">S/ {montoTotalGarantia.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onBack} className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">Atrás</button>
                <button type="submit" className="btn bg-emerald-500 hover:bg-emerald-600 text-white">
                    {garantiaActiva ? 'Guardar Boleta y Garantía' : 'Guardar Boleta (sin Garantía)'}
                </button>
            </div>
        </form>
    );
};

export default Fase3Garantias;
