import React from 'react';
import { useFormulario, NOMBRE_TABLA_REFERENCIAS_PAGO, NOMBRE_TABLA_BOLETAS_FACTURAS } from '../../context/FormularioContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

function DashboardCard01({ dateRange }) {
  const { database } = useFormulario();

  const todasLasReferencias = database[NOMBRE_TABLA_REFERENCIAS_PAGO] || [];
  const boletasYFacturas = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];

  const referencias = todasLasReferencias.filter(r => {
    const fechaInicio = dateRange?.from;
    const fechaFin = dateRange?.to;
    if (!fechaInicio || !fechaFin) return true;
    try {
      const fechaReferencia = new Date(r.Fecha);
      const normFechaInicio = new Date(fechaInicio); normFechaInicio.setHours(0, 0, 0, 0);
      const normFechaFin = new Date(fechaFin); normFechaFin.setHours(23, 59, 59, 999);
      return fechaReferencia >= normFechaInicio && fechaReferencia <= normFechaFin;
    } catch (e) {
      return false;
    }
  });

  const docsMap = new Map(boletasYFacturas.map(d => [d.id, { tipo: d.Documento, anulado: d.Anulado }]));

  const { ingresosBoletas, ingresosFacturas, ingresosGarantias } = referencias.reduce((acc, r) => {
    const importe = r.Importe || 0;
    if (r.boletaFacturaId) {
      const docInfo = docsMap.get(r.boletaFacturaId);
      if (docInfo && !docInfo.anulado) {
        if (docInfo.tipo === 'Boleta') acc.ingresosBoletas += importe;
        else if (docInfo.tipo === 'Factura') acc.ingresosFacturas += importe;
      }
    } else {
      acc.ingresosGarantias += importe;
    }
    return acc;
  }, { ingresosBoletas: 0, ingresosFacturas: 0, ingresosGarantias: 0 });

  // --- NUEVO LAYOUT HORIZONTAL Y COMPACTO ---
  return (
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 flex justify-around text-center">
        
        {/* Total Boletas */}
        <div>
          <div className="text-md font-semibold text-gray-500 dark:text-gray-400">Ingresos por Boletas</div>
          <div className="text-2xl font-bold text-emerald-500">{formatCurrency(ingresosBoletas)}</div>
        </div>

        {/* Total Facturas */}
        <div>
          <div className="text-md font-semibold text-gray-500 dark:text-gray-400">Ingresos por Facturas</div>
          <div className="text-2xl font-bold text-violet-500">{formatCurrency(ingresosFacturas)}</div>
        </div>

        {/* Total Garantías */}
        <div>
          <div className="text-md font-semibold text-gray-500 dark:text-gray-400">Ingresos por Garantías</div>
          <div className="text-2xl font-bold text-sky-500">{formatCurrency(ingresosGarantias)}</div>
        </div>

      </div>
    </div>
  );
}

export default DashboardCard01;
