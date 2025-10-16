
import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useFormulario, NOMBRE_TABLA_BOLETAS_FACTURAS } from '../context/FormularioContext';
import { useNavigate } from 'react-router-dom';

import Fase2Pagos from '../components/Fase2Pagos';
import Fase3Garantias from '../components/Fase3Garantias';
import GestionCodigosModal from '../components/GestionCodigosModal';
import GestionInstalacionesModal from '../components/GestionInstalacionesModal';

const CATEGORIA_GARANTIA = 'INGRESOS POR FONDOS DE GARANTIA';
const CUENTA_CORRIENTE_GARANTIA_DEFAULT = '00-000-860212';

function AñadirBoletaFactura() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { database, agregarBoletaCompleta } = useFormulario();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(1);
  const [isNroReciboInvalid, setIsNroReciboInvalid] = useState(false);
  const [isNroDocumentoInvalid, setIsNroDocumentoInvalid] = useState(false);
  const [previousCategoria, setPreviousCategoria] = useState('');
  const [previousSubcategoria, setPreviousSubcategoria] = useState('');
  const [formData, setFormData] = useState({
    NroRecibo: '', NroDocumento: '', Documento: 'Boleta', Fecha: new Date().toISOString().slice(0, 10),
    AlquiladoA: '', Instalacion: '', Descripcion: '', Categoria: '', Subcategoria: '',
    cuentaContableId: null, CuentaCorriente: '00-000-283118', Anulado: false,
  });
  const [referencias, setReferencias] = useState([]);
  const [garantiaActiva, setGarantiaActiva] = useState(false);
  const [garantiasData, setGarantiasData] = useState({ descripcion: '', dirigidoA: '', cuentaCorriente: CUENTA_CORRIENTE_GARANTIA_DEFAULT });
  const [referenciasGarantia, setReferenciasGarantia] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [codigoPrefix, setCodigoPrefix] = useState('');
  const [codigoSuffix, setCodigoSuffix] = useState('');
  const [isCodigosModalOpen, setIsCodigosModalOpen] = useState(false);
  const [isInstalacionesModalOpen, setIsInstalacionesModalOpen] = useState(false);

  useEffect(() => {
    if (database) {
        const recibos = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
        const nextReciboNumber = (recibos.length > 0 ? Math.max(...recibos.map(r => parseInt(r.NroRecibo, 10) || 0)) : 0) + 1;
        setFormData(prev => ({ ...prev, NroRecibo: nextReciboNumber.toString() }));
        const categoriasExcluidas = [CATEGORIA_GARANTIA, "ANULADO"];
        setCategorias([...new Set(database.CuentasContables?.filter(c => !categoriasExcluidas.includes(c.Categoria)).map(c => c.Categoria) || [])]);
        setCodigos(database.Codigos || []);
    }
  }, [database]);

  // --- LÓGICA DE VALIDACIÓN DE UNICIDAD ---
  useEffect(() => {
    if (!database || !formData.NroRecibo) { setIsNroReciboInvalid(false); return; }
    const exists = database[NOMBRE_TABLA_BOLETAS_FACTURAS].some(r => r.NroRecibo.toString() === formData.NroRecibo.toString());
    setIsNroReciboInvalid(exists);
  }, [formData.NroRecibo, database]);

  // Efecto para actualizar el formData cuando cambian las partes del NroDocumento
  useEffect(() => {
    const newNroDocumento = codigoPrefix ? `${codigoPrefix}-${codigoSuffix}` : codigoSuffix;
    setFormData(prev => ({ ...prev, NroDocumento: newNroDocumento }));
  }, [codigoPrefix, codigoSuffix]);

  // Efecto para VALIDAR el NroDocumento combinado
  useEffect(() => {
    const currentNroDocumento = codigoPrefix ? `${codigoPrefix}-${codigoSuffix}` : codigoSuffix;
    if (!database || !currentNroDocumento || !codigoSuffix) {
        setIsNroDocumentoInvalid(false);
        return;
    }
    const exists = database[NOMBRE_TABLA_BOLETAS_FACTURAS].some(r => r.NroDocumento && r.NroDocumento.toString() === currentNroDocumento.toString());
    setIsNroDocumentoInvalid(exists);
  }, [codigoPrefix, codigoSuffix, database]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const newState = { ...prev, [name]: val };
      if (name === 'Anulado') {
        if (checked) {
          setPreviousCategoria(prev.Categoria); setPreviousSubcategoria(prev.Subcategoria);
          newState.Categoria = 'ANULADO'; newState.Subcategoria = 'ANULADO';
        } else {
          newState.Categoria = previousCategoria; newState.Subcategoria = previousSubcategoria;
        }
      } else if (name === 'Categoria') {
        const filtered = database.CuentasContables.filter(c => c.Categoria === val).map(c => c.Subcategoria);
        setSubcategorias([...new Set(filtered)]);
        newState.Subcategoria = '';
      }
      return newState;
    });
  };

  const handleSaveAnulado = async () => {
    const cuentaAnulado = database.CuentasContables.find(c => c.Categoria === 'ANULADO');
    const boletaAnuladaPayload = { ...formData, Anulado: true, Categoria: 'ANULADO', Subcategoria: 'ANULADO', cuentaContableId: cuentaAnulado?.id || null, Importe: 0, referencias: [] };
    await agregarBoletaCompleta({ boletaData: boletaAnuladaPayload, garantiaData: null, garantiaActiva: false });
    alert('Recibo anulado y registrado con éxito.');
    navigate('/');
  };

  const handlePhase1Next = () => {
    const requiredFields = ['NroRecibo', 'NroDocumento', 'AlquiladoA', 'Instalacion', 'Categoria', 'Subcategoria'];
    if (requiredFields.some(f => !formData[f] || formData[f] === '-')) { alert(`Complete todos los campos obligatorios (*).`); return; }
    const cuenta = database.CuentasContables.find(c => c.Categoria === formData.Categoria && c.Subcategoria === formData.Subcategoria);
    if (!cuenta) { alert('La combinación Categoría/Subcategoría no es válida.'); return; }
    setFormData(prev => ({ ...prev, cuentaContableId: cuenta.id }));
    setPhase(2);
  };

  const handlePhase1Submit = (e) => {
    e.preventDefault();
    if (isNroReciboInvalid) { alert('Error: El número de recibo ya está en uso.'); return; }
    if (isNroDocumentoInvalid) { alert('Error: El número de documento ya está en uso.'); return; } 
    if (formData.Anulado) { handleSaveAnulado(); } else { handlePhase1Next(); }
  };
  
  const handlePhase2Next = () => {
    if (referencias.length === 0) { alert('Debe agregar al menos una referencia de pago.'); return; }
    setPhase(3);
  };

  const handleSaveAll = async () => {
    const totalImporteBoleta = referencias.reduce((sum, ref) => sum + parseFloat(ref.Importe || 0), 0);
    const boletaPayload = { ...formData, Importe: totalImporteBoleta, referencias: referencias.map(({ id, ...rest }) => rest) };
    let garantiaPayload = null;
    if (garantiaActiva) {
      if (referenciasGarantia.length === 0) { alert('La garantía está activa pero no tiene referencias de pago.'); return; }
      const cuentaGarantia = database.CuentasContables.find(c => c.Categoria === CATEGORIA_GARANTIA);
      const montoTotalGarantia = referenciasGarantia.reduce((sum, ref) => sum + parseFloat(ref.Importe || 0), 0);
      garantiaPayload = { ...garantiasData, montoGarantia: montoTotalGarantia, cuentaContableId: cuentaGarantia?.id, referencias: referenciasGarantia.map(({ id, ...rest }) => rest) };
    }
    await agregarBoletaCompleta({ boletaData: boletaPayload, garantiaData: garantiaPayload, garantiaActiva: garantiaActiva });
    alert('¡Registro guardado con éxito!');
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden"><Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /><main className="grow"><div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto"><div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-6"><h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-extrabold text-center mb-8">{phase === 1 ? 'AÑADIR BOLETA / FACTURA' : phase === 2 ? 'FASE 2: REGISTRAR PAGOS' : 'FASE 3: REGISTRAR GARANTÍA'}</h1>
              
              {phase === 1 && (
                <form onSubmit={handlePhase1Submit}><div className="grid gap-6 md:grid-cols-2">
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">N° Recibo <span className="text-rose-500">*</span></label><input type="text" name="NroRecibo" onChange={handleInputChange} value={formData.NroRecibo} className={`form-input w-full dark:bg-gray-700 ${isNroReciboInvalid ? 'border-red-500' : ''}`} />
                    {isNroReciboInvalid && <p className="text-sm text-red-500 mt-1">Este número de recibo ya existe.</p>}</div>
                    
                    <div><div className="flex items-center justify-between mb-1"><label className="block text-sm font-medium dark:text-gray-300">N° Documento <span className="text-rose-500">*</span></label><button type="button" onClick={() => setIsCodigosModalOpen(true)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">Gestionar</button></div><div className="grid grid-cols-3 gap-2"><select onChange={(e) => setCodigoPrefix(e.target.value)} value={codigoPrefix} className={`form-select dark:bg-gray-700 col-span-1 ${isNroDocumentoInvalid ? 'border-red-500' : ''}`}><option value="">-</option>{codigos.map(c => <option key={c.id} value={c.prefijo}>{c.prefijo}</option>)}</select><input type="text" onChange={(e) => setCodigoSuffix(e.target.value)} value={codigoSuffix} className={`form-input w-full dark:bg-gray-700 col-span-2 ${isNroDocumentoInvalid ? 'border-red-500' : ''}`}/></div>
                    {isNroDocumentoInvalid && <p className="text-sm text-red-500 mt-1">Este número de documento ya existe.</p>}</div>

                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo Documento</label><select name="Documento" onChange={handleInputChange} value={formData.Documento} className="form-select w-full dark:bg-gray-700"><option>Boleta</option><option>Factura</option></select></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label><input type="date" name="Fecha" onChange={handleInputChange} value={formData.Fecha} className="form-input w-full dark:bg-gray-700" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Alquilado a <span className="text-rose-500">*</span></label><input type="text" name="AlquiladoA" onChange={handleInputChange} value={formData.AlquiladoA} className="form-input w-full dark:bg-gray-700" /></div>
                    <div className="md:col-span-2"><div className="flex items-center justify-between mb-1"><label className="block text-sm font-medium dark:text-gray-300">Instalación <span className="text-rose-500">*</span></label><button type="button" onClick={() => setIsInstalacionesModalOpen(true)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">Gestionar</button></div><select name="Instalacion" onChange={handleInputChange} value={formData.Instalacion} className="form-select w-full dark:bg-gray-700"><option value="">Seleccione...</option>{(database?.Instalaciones || []).map(inst => <option key={inst.id} value={inst.nombre}>{inst.nombre}</option>)}</select></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label><textarea name="Descripcion" rows="2" onChange={handleInputChange} value={formData.Descripcion} className="form-textarea w-full dark:bg-gray-700"></textarea></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría <span className="text-rose-500">*</span></label><select name="Categoria" onChange={handleInputChange} value={formData.Categoria} className="form-select w-full dark:bg-gray-700" disabled={formData.Anulado}><option value="">Seleccione...</option>{categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Subcategoría <span className="text-rose-500">*</span></label><select name="Subcategoria" onChange={handleInputChange} value={formData.Subcategoria} className="form-select w-full dark:bg-gray-700" disabled={!formData.Categoria || formData.Anulado}><option value="">Seleccione...</option>{subcategorias.map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Cuenta Corriente</label><input type="text" name="CuentaCorriente" onChange={handleInputChange} value={formData.CuentaCorriente} className="form-input w-full dark:bg-gray-700" /></div>
                    <div className="flex items-center md:col-start-2 mt-6"><input type="checkbox" name="Anulado" onChange={handleInputChange} checked={formData.Anulado} className="form-checkbox" /><label className="ml-2 text-sm text-gray-600 dark:text-gray-300">Anular este recibo</label></div>
                </div><div className="flex justify-end gap-4 mt-8"><button type="submit" className={`btn ${formData.Anulado ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`} disabled={isNroReciboInvalid || isNroDocumentoInvalid}>{formData.Anulado ? 'Guardar Anulación' : 'Siguiente (Fase de Pagos)'}</button></div></form>
              )}

              {phase === 2 && <Fase2Pagos onBack={() => setPhase(1)} onNext={handlePhase2Next} referencias={referencias} setReferencias={setReferencias} />}

              {phase === 3 && <Fase3Garantias onBack={() => setPhase(2)} onSave={handleSaveAll} garantiaActiva={garantiaActiva} setGarantiaActiva={setGarantiaActiva} garantiasData={garantiasData} handleGarantiasChange={(e) => setGarantiasData(prev => ({ ...prev, [e.target.name]: e.target.value }))} referenciasGarantia={referenciasGarantia} setReferenciasGarantia={setReferenciasGarantia} />}

            </div></div></main>
        <GestionCodigosModal isVisible={isCodigosModalOpen} onClose={() => setIsCodigosModalOpen(false)} codigos={codigos}/>
        <GestionInstalacionesModal isVisible={isInstalacionesModalOpen} onClose={() => setIsInstalacionesModalOpen(false)} instalaciones={database?.Instalaciones || []}/>
      </div>
    </div>
  );
}

export default AñadirBoletaFactura; // <-- Changed export name
