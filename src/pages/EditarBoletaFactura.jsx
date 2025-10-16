
import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useFormulario, NOMBRE_TABLA_BOLETAS_FACTURAS, NOMBRE_TABLA_GARANTIAS } from '../context/FormularioContext';
import { useNavigate, useParams } from 'react-router-dom';

import Fase2Pagos from '../components/Fase2Pagos';
import Fase3Garantias from '../components/Fase3Garantias';
import GestionCodigosModal from '../components/GestionCodigosModal';
import GestionInstalacionesModal from '../components/GestionInstalacionesModal';

const CATEGORIA_GARANTIA = 'INGRESOS POR FONDOS DE GARANTIA';

function EditarBoletaFactura() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { database, isLoading, actualizarBoletaCompleta } = useFormulario();
  const navigate = useNavigate();
  const { id } = useParams();

  const [phase, setPhase] = useState(1);
  const [formData, setFormData] = useState(null);
  const [referencias, setReferencias] = useState([]);
  const [garantiaActiva, setGarantiaActiva] = useState(false);
  // Estado de garantía inicializado sin valores por defecto
  const [garantiasData, setGarantiasData] = useState({ descripcion: '', dirigidoA: '', cuentaCorriente: '' });
  const [referenciasGarantia, setReferenciasGarantia] = useState([]);
  
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [codigoPrefix, setCodigoPrefix] = useState('');
  const [codigoSuffix, setCodigoSuffix] = useState('');
  const [isCodigosModalOpen, setIsCodigosModalOpen] = useState(false);
  const [isInstalacionesModalOpen, setIsInstalacionesModalOpen] = useState(false);

  // Efecto para cargar los datos del documento
  useEffect(() => {
    if (database && id) {
      const boletaAEditar = database[NOMBRE_TABLA_BOLETAS_FACTURAS].find(b => b.id.toString() === id);

      if (boletaAEditar) {
        // La fecha se formatea o se deja vacía si no existe. No se usa la fecha actual.
        const fechaFormateada = boletaAEditar.Fecha ? new Date(boletaAEditar.Fecha).toISOString().slice(0, 10) : '';
        
        setFormData({ ...boletaAEditar, Fecha: fechaFormateada });
        setReferencias(boletaAEditar.referencias || []);

        const garantiaAsociada = database[NOMBRE_TABLA_GARANTIAS]?.find(g => g.boletaFacturaId?.toString() === id);
        if (garantiaAsociada) {
            setGarantiaActiva(true);
            setGarantiasData(garantiaAsociada);
            setReferenciasGarantia(garantiaAsociada.referencias || []);
        }

        if (boletaAEditar.NroDocumento) {
            const partes = boletaAEditar.NroDocumento.split('-');
            if (partes.length > 1) {
                setCodigoPrefix(partes[0]);
                setCodigoSuffix(partes.slice(1).join('-'));
            } else {
                setCodigoPrefix('');
                setCodigoSuffix(partes[0]);
            }
        }
      } else {
        alert('No se encontró el documento a editar.');
        navigate('/gestion-boletas');
      }
      
      const categoriasExcluidas = [CATEGORIA_GARANTIA, "ANULADO"];
      setCategorias([...new Set(database.CuentasContables?.filter(c => !categoriasExcluidas.includes(c.Categoria)).map(c => c.Categoria) || [])]);
      setCodigos(database.Codigos || []);
    }
  }, [database, id, navigate]);

  // Efecto para cargar subcategorías
  useEffect(() => {
    if (formData?.Categoria && database) {
        const filtered = database.CuentasContables.filter(c => c.Categoria === formData.Categoria).map(c => c.Subcategoria);
        setSubcategorias([...new Set(filtered)]);
        if (!filtered.includes(formData.Subcategoria)) {
            setFormData(prev => ({...prev, Subcategoria: ''}));
        }
    }
  }, [formData?.Categoria, database]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  // Lógica de navegación y guardado
  const handlePhase1Next = () => {
    const requiredFields = ['AlquiladoA', 'Instalacion', 'Categoria', 'Subcategoria'];
    if (requiredFields.some(f => !formData[f] || formData[f] === '-')) { alert(`Complete todos los campos obligatorios.`); return; }
    const cuenta = database.CuentasContables.find(c => c.Categoria === formData.Categoria && c.Subcategoria === formData.Subcategoria);
    if (!cuenta) { alert('La combinación Categoría/Subcategoría no es válida.'); return; }
    setFormData(prev => ({ ...prev, cuentaContableId: cuenta.id }));
    setPhase(2);
  };
  
  const handlePhase2Next = () => {
    if (referencias.length === 0 && !formData.Anulado) { alert('Debe agregar al menos una referencia de pago.'); return; }
    setPhase(3);
  };

  const handleSaveAll = async () => {
    const totalImporteBoleta = referencias.reduce((sum, ref) => sum + parseFloat(ref.Importe || 0), 0);
    const boletaPayload = { ...formData, Importe: totalImporteBoleta, referencias: referencias };
    
    let garantiaPayload = null;
    if (garantiaActiva) {
      if (referenciasGarantia.length === 0) { alert('La garantía está activa pero no tiene referencias de pago.'); return; }
      const cuentaGarantia = database.CuentasContables.find(c => c.Categoria === CATEGORIA_GARANTIA);
      const montoTotalGarantia = referenciasGarantia.reduce((sum, ref) => sum + parseFloat(ref.Importe || 0), 0);
      garantiaPayload = { ...garantiasData, montoGarantia: montoTotalGarantia, cuentaContableId: cuentaGarantia?.id, referencias: referenciasGarantia };
    }

    await actualizarBoletaCompleta({ boletaData: boletaPayload, garantiaData: garantiaPayload, garantiaActiva: garantiaActiva });
    alert('¡Registro actualizado con éxito!');
    navigate('/gestion-boletas');
  };

  if (isLoading || !formData) {
    return <div className="flex h-screen items-center justify-center"><p>Cargando datos del documento...</p></div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow"><div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto"><div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-extrabold text-center mb-8">{phase === 1 ? 'EDITAR BOLETA / FACTURA' : phase === 2 ? 'FASE 2: EDITAR PAGOS' : 'FASE 3: EDITAR GARANTÍA'}</h1>
              
              {phase === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); handlePhase1Next(); }}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">N° Recibo</label><input type="text" value={formData.NroRecibo} className="form-input w-full dark:bg-gray-600 text-gray-400" readOnly /></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">N° Documento</label><div className="grid grid-cols-3 gap-2"><select value={codigoPrefix} className="form-select dark:bg-gray-600 col-span-1 text-gray-400" disabled><option value="">-</option>{codigos.map(c => <option key={c.id} value={c.prefijo}>{c.prefijo}</option>)}</select><input type="text" value={codigoSuffix} className="form-input w-full dark:bg-gray-600 text-gray-400 col-span-2" readOnly/></div></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo Documento</label><select name="Documento" onChange={handleInputChange} value={formData.Documento} className="form-select w-full dark:bg-gray-700"><option>Boleta</option><option>Factura</option></select></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label><input type="date" name="Fecha" onChange={handleInputChange} value={formData.Fecha} className="form-input w-full dark:bg-gray-700" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Alquilado a</label><input type="text" name="AlquiladoA" onChange={handleInputChange} value={formData.AlquiladoA} className="form-input w-full dark:bg-gray-700" /></div>
                    <div className="md:col-span-2"><div className="flex items-center justify-between mb-1"><label className="block text-sm font-medium dark:text-gray-300">Instalación</label><button type="button" onClick={() => setIsInstalacionesModalOpen(true)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">Gestionar</button></div><select name="Instalacion" onChange={handleInputChange} value={formData.Instalacion} className="form-select w-full dark:bg-gray-700"><option value="">Seleccione...</option>{(database?.Instalaciones || []).map(inst => <option key={inst.id} value={inst.nombre}>{inst.nombre}</option>)}</select></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label><textarea name="Descripcion" rows="2" onChange={handleInputChange} value={formData.Descripcion} className="form-textarea w-full dark:bg-gray-700"></textarea></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría</label><select name="Categoria" onChange={handleInputChange} value={formData.Categoria} className="form-select w-full dark:bg-gray-700" disabled={formData.Anulado}><option value="">Seleccione...</option>{categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Subcategoría</label><select name="Subcategoria" onChange={handleInputChange} value={formData.Subcategoria} className="form-select w-full dark:bg-gray-700" disabled={!formData.Categoria || formData.Anulado}><option value="">Seleccione...</option>{subcategorias.map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Cuenta Corriente</label><input type="text" name="CuentaCorriente" onChange={handleInputChange} value={formData.CuentaCorriente} className="form-input w-full dark:bg-gray-700" /></div>
                    <div className="flex items-center md:col-start-2 mt-6"><input type="checkbox" name="Anulado" onChange={handleInputChange} checked={formData.Anulado} className="form-checkbox" /><label className="ml-2 text-sm text-gray-600 dark:text-gray-300">Anular este recibo</label></div>
                  </div><div className="flex justify-between items-center mt-8"><button type="button" onClick={() => navigate('/gestion-boletas')} className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">Cancelar</button><button type="submit" className="btn bg-indigo-500 hover:bg-indigo-600 text-white">Siguiente (Fase de Pagos)</button></div>
                </form>
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

export default EditarBoletaFactura;
