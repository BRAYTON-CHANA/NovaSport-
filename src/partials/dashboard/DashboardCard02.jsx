import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  useFormulario, 
  NOMBRE_TABLA_BOLETAS_FACTURAS, 
  NOMBRE_TABLA_REFERENCIAS_PAGO
} from '../../context/FormularioContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

function DashboardCard02({ dateRange }) {
  const { database } = useFormulario();

  const processDataForChart = () => {
    const boletas = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
    const todasLasReferencias = database[NOMBRE_TABLA_REFERENCIAS_PAGO] || [];
    const boletasMap = new Map(boletas.map(b => [b.id, { tipo: b.Documento, anulado: b.Anulado }]));

    const fechaInicio = dateRange?.from;
    const fechaFin = dateRange?.to;

    let labels = [];
    let aggregatedData = {};
    let mode = 'monthly';

    if (!fechaInicio || !fechaFin) {
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toLocaleString('es-ES', { month: 'short', year: 'numeric' }).replace('.','').replace(' de','');
        labels.push(key);
        aggregatedData[key] = { boletas: 0, garantias: 0 };
      }
    } else {
      const diffTime = Math.abs(fechaFin - fechaInicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 90) {
        mode = 'monthly';
        let currentDate = new Date(fechaInicio);
        while (currentDate <= fechaFin) {
          const key = currentDate.toLocaleString('es-ES', { month: 'short', year: 'numeric' }).replace('.','').replace(' de','');
          if (!aggregatedData[key]) {
            labels.push(key);
            aggregatedData[key] = { boletas: 0, garantias: 0 };
          }
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(1);
        }
      } else {
        mode = 'daily';
        let currentDate = new Date(fechaInicio);
        while (currentDate <= fechaFin) {
          const key = currentDate.toLocaleString('es-ES', { day: '2-digit', month: 'short' }).replace('.','');
          labels.push(key);
          aggregatedData[key] = { boletas: 0, garantias: 0 };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    const referencias = todasLasReferencias.filter(r => {
      if (!fechaInicio || !fechaFin) return true;
      try {
        const fechaReferencia = new Date(r.Fecha);
        const normFechaInicio = new Date(fechaInicio); normFechaInicio.setHours(0, 0, 0, 0);
        const normFechaFin = new Date(fechaFin); normFechaFin.setHours(23, 59, 59, 999);
        return fechaReferencia >= normFechaInicio && fechaReferencia <= normFechaFin;
      } catch (e) { return false; }
    });

    referencias.forEach(r => {
      const importe = r.Importe || 0;
      try {
        const date = new Date(r.Fecha);
        if (isNaN(date.getTime())) return;

        let key;
        if (mode === 'monthly') {
          key = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' }).replace('.','').replace(' de','');
        } else {
          key = date.toLocaleString('es-ES', { day: '2-digit', month: 'short' }).replace('.','');
        }

        if (aggregatedData.hasOwnProperty(key)) {
          if (r.boletaFacturaId) {
            const docInfo = boletasMap.get(r.boletaFacturaId);
            if (docInfo && !docInfo.anulado) {
              aggregatedData[key].boletas += importe;
            }
          } else {
            aggregatedData[key].garantias += importe;
          }
        }
      } catch(e) { /* Ignorar */ }
    });
    
    const boletasData = labels.map(key => aggregatedData[key]?.boletas || 0);
    const garantiasData = labels.map(key => aggregatedData[key]?.garantias || 0);

    // Devolver `referencias` para usarlo fuera
    return { labels, boletasData, garantiasData, referencias };
  };

  // Recibir `referencias` aquí
  const { labels, boletasData, garantiasData, referencias } = processDataForChart();

  const chartData = {
    labels,
    datasets: [
      { label: 'Ingresos por Boletas/Facturas', data: boletasData, borderColor: 'rgb(139, 92, 246)', backgroundColor: 'rgba(139, 92, 246, 0.5)', tension: 0.3 },
      { label: 'Ingresos por Garantías', data: garantiasData, borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.5)', tension: 0.3 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: { y: { ticks: { callback: value => formatCurrency(value) } } },
  };

  return (
    <div className="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Tendencia de Ingresos</h2>
        <div className="h-[350px]">
          {/* Usar `referencias` que ahora sí está en el scope correcto */}
          {referencias.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">No hay datos para mostrar en el período seleccionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard02;
