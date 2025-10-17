import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useFormulario, NOMBRE_TABLA_BOLETAS_FACTURAS, NOMBRE_TABLA_CUENTAS_CONTABLES } from '../../context/FormularioContext';
import DashboardCard04_Filters from './DashboardCard04_Filters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

function DashboardCard04({ dateRange }) {
  const { database } = useFormulario();
  
  const [filterState, setFilterState] = useState({ 
    viewMode: 'category', 
    selectedSubcategories: [] 
  });

  const boletasYFacturas = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
  const cuentasContables = database[NOMBRE_TABLA_CUENTAS_CONTABLES] || [];

  const { 
    cuentaIdToCategoriaMap, 
    cuentaIdToSubcategoriaMap, 
    groupedSubcategories 
  } = useMemo(() => {
    const idToCat = new Map();
    const idToSub = new Map();
    const grouped = {};

    cuentasContables.forEach(c => {
      idToCat.set(c.id, c.Categoria);
      idToSub.set(c.id, c.Subcategoria);
      if (!grouped[c.Categoria]) {
        grouped[c.Categoria] = [];
      }
      // Evitar duplicados en las listas de subcategorías
      if (!grouped[c.Categoria].includes(c.Subcategoria)) {
        grouped[c.Categoria].push(c.Subcategoria);
      }
    });

    return { 
      cuentaIdToCategoriaMap: idToCat, 
      cuentaIdToSubcategoriaMap: idToSub,
      groupedSubcategories: grouped
    };
  }, [cuentasContables]);

  const handleFilterChange = (viewMode, selectedSubcategories) => {
    setFilterState({ viewMode, selectedSubcategories });
  };

  const documentosFiltrados = boletasYFacturas.filter(doc => {
    const fechaInicio = dateRange?.from;
    const fechaFin = dateRange?.to;
    if (!fechaInicio || !fechaFin) return true;
    try {
      const fechaDocumento = new Date(doc.Fecha);
      const normFechaInicio = new Date(fechaInicio); normFechaInicio.setHours(0, 0, 0, 0);
      const normFechaFin = new Date(fechaFin); normFechaFin.setHours(23, 59, 59, 999);
      return fechaDocumento >= normFechaInicio && fechaDocumento <= normFechaFin;
    } catch (e) {
      return false;
    }
  });

  const processedData = useMemo(() => {
    let dataMap = {};
    if (filterState.viewMode === 'category') {
      documentosFiltrados.forEach(doc => {
        if (doc.Anulado) return;
        const categoria = cuentaIdToCategoriaMap.get(doc.cuentaContableId) || 'Sin Categoría';
        const importe = doc.Importe || 0;
        dataMap[categoria] = (dataMap[categoria] || 0) + importe;
      });
    } else {
      documentosFiltrados.forEach(doc => {
        if (doc.Anulado) return;
        const subcategoria = cuentaIdToSubcategoriaMap.get(doc.cuentaContableId);
        if (filterState.selectedSubcategories.includes(subcategoria)) {
          const importe = doc.Importe || 0;
          dataMap[subcategoria] = (dataMap[subcategoria] || 0) + importe;
        }
      });
    }
    
    const sortedEntries = Object.entries(dataMap).sort(([, a], [, b]) => b - a);
    return {
      labels: sortedEntries.map(([label]) => label),
      data: sortedEntries.map(([, value]) => value)
    };

  }, [documentosFiltrados, filterState, cuentaIdToCategoriaMap, cuentaIdToSubcategoriaMap]);

  const chartData = {
    labels: processedData.labels,
    datasets: [{
      label: 'Ingresos',
      data: processedData.data,
      backgroundColor: 'rgba(52, 211, 153, 0.7)',
      borderColor: 'rgba(40, 160, 120, 1)',
      borderWidth: 1,
      borderRadius: 5,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Ingresos: ${formatCurrency(context.parsed.x)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { callback: value => formatCurrency(value) }
      }
    }
  };

  return (
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">Ingresos por {filterState.viewMode === 'category' ? 'Categoría' : 'Subcategoría'}</h2>
        <DashboardCard04_Filters 
          groupedSubcategories={groupedSubcategories}
          onFilterChange={handleFilterChange}
        />
      </header>
      <div className="p-4">
        {/* Aumentar la altura del contenedor del gráfico */}
        <div className="h-[550px]">
          {processedData.labels.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">No hay datos para mostrar con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard04;
