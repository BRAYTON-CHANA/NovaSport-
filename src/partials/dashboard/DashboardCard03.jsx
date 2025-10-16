import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useFormulario, NOMBRE_TABLA_BOLETAS_FACTURAS, NOMBRE_TABLA_REFERENCIAS_PAGO } from '../../context/FormularioContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

function DashboardCard03({ dateRange }) { // dateRange es { from: Date, to: Date }
  const { database } = useFormulario();

  const boletas = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
  const todasLasReferencias = database[NOMBRE_TABLA_REFERENCIAS_PAGO] || [];

  const fechaInicio = dateRange?.from;
  const fechaFin = dateRange?.to;

  // Lógica de filtrado A-D-A-P-T-A-D-A
  const referencias = todasLasReferencias.filter(r => {
    if (!fechaInicio || !fechaFin) return true;
    try {
      const fechaReferencia = new Date(r.Fecha);
      const normFechaInicio = new Date(fechaInicio);
      normFechaInicio.setHours(0, 0, 0, 0);
      const normFechaFin = new Date(fechaFin);
      normFechaFin.setHours(23, 59, 59, 999);
      return fechaReferencia >= normFechaInicio && fechaReferencia <= normFechaFin;
    } catch (e) {
      return false;
    }
  });

  const boletasMap = new Map(boletas.map(b => [b.id, { instalacion: b.Instalacion, anulado: b.Anulado }]));

  const ingresosPorInstalacion = referencias.reduce((acc, r) => {
    const boletaId = r.boletaFacturaId;
    
    if (boletaId) {
      const boletaInfo = boletasMap.get(boletaId);
      if (boletaInfo && !boletaInfo.anulado) {
        const monto = r.Importe || 0;
        const instalacionNombre = boletaInfo.instalacion || 'Sin Asignar';

        if (!acc[instalacionNombre]) {
          acc[instalacionNombre] = 0;
        }
        acc[instalacionNombre] += monto;
      }
    } 
    
    return acc;
  }, {});

  const labels = Object.keys(ingresosPorInstalacion);
  const dataValues = Object.values(ingresosPorInstalacion);
  const totalIngresos = dataValues.reduce((sum, value) => sum + value, 0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Distribución de Ingresos',
        data: dataValues,
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)', 'rgba(52, 211, 153, 0.8)', 'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(217, 70, 239, 0.8)',
        ],
        borderColor: ['#FFFFFF'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) {
              const percentage = totalIngresos > 0 ? (context.parsed / totalIngresos * 100).toFixed(2) : 0;
              label += `${formatCurrency(context.parsed)} (${percentage}%)`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="col-span-full xl:col-span-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Ingresos por Instalación</h2>
        <div className="h-[250px] flex items-center justify-center relative">
           <Doughnut data={chartData} options={options} />
        </div>
        <div className="pt-4">
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            {labels.map((label, index) => (
              <li key={label} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span style={{ backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length] }} className="w-3 h-3 rounded-full mr-2"></span>
                  <span>{label}</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(dataValues[index])}</span>
              </li>
            ))}
          </ul>
          {labels.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-4">
                {fechaInicio && fechaFin 
                  ? "No hay datos para el período seleccionado."
                  : "No hay ingresos de boletas para mostrar."
                }
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard03;
