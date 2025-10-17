
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useFormulario, NOMBRE_TABLA_BOLETAS_FACTURAS, NOMBRE_TABLA_GARANTIAS } from '../context/FormularioContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoUrl from '../images/logoNovasport.png'; // Importar el logo

function GestionBoletas() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { database, isLoading } = useFormulario();
  const [searchTerm, setSearchTerm] = useState('');
  const [instalacionFilter, setInstalacionFilter] = useState('all');

  const documentosProcesados = useMemo(() => {
    if (isLoading || !database) return [];
    const boletas = database[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
    const garantias = database[NOMBRE_TABLA_GARANTIAS] || [];
    const boletasConGarantiaIds = new Set(garantias.map(g => g.boletaFacturaId));

    return boletas.map(boleta => ({
      ...boleta,
      tieneGarantia: boletasConGarantiaIds.has(boleta.id) ? 'Sí' : 'No',
      estado: boleta.Anulado === 1 ? 'Anulado' : 'Vigente',
    }));
  }, [database, isLoading]);

  const instalaciones = useMemo(() => {
      if (!documentosProcesados) return [];
      return [...new Set(documentosProcesados.map(doc => doc.Instalacion).filter(Boolean))];
  }, [documentosProcesados]);

  const filteredDocumentos = useMemo(() => {
    return documentosProcesados.filter(doc => {
        const searchMatch = !searchTerm || doc.NroDocumento?.toLowerCase().includes(searchTerm.toLowerCase());
        const instalacionMatch = instalacionFilter === 'all' || doc.Instalacion === instalacionFilter;
        return searchMatch && instalacionMatch;
    });
  }, [documentosProcesados, searchTerm, instalacionFilter]);

  const handleAdd = () => {
    navigate('/añadir-boleta-factura');
  };

  const handleEdit = (id) => {
    navigate(`/editar-boleta-factura/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      alert(`Funcionalidad "Eliminar" para el documento ${id} pendiente de implementación.`);
    }
  };

  const handlePrint = (doc) => {
    const printId = `print-container-${doc.id}`;
    if (document.getElementById(printId)) return;
  
    const printContainer = document.createElement('div');
    printContainer.id = printId;
    Object.assign(printContainer.style, {
      position: 'absolute',
      left: '-9999px',
      width: '210mm',
      height: '290mm',
      backgroundColor: 'white',
      padding: '1cm',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: 'black',
      display: 'flex',
      flexDirection: 'column'
    });
  
    const [year, month, day] = doc.Fecha ? doc.Fecha.split('-') : ['', '', ''];
  
    // Asegúrate de que logoUrl esté definido en el scope
    const logoSrc = typeof logoUrl !== 'undefined' ? logoUrl : '';
  
    printContainer.innerHTML = `
      <style>
        .table, .table th, .table td { border: 1px solid black; border-collapse: collapse; }
        .table { width: 100%; table-layout: fixed; }
        .table th, .table td { padding: 3px; text-align: center; word-wrap: break-word; }
        .no-border, .no-border th, .no-border td { border: none; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .main-content { flex-grow: 1; display: flex; flex-direction: column; }
        .main-content .table { height: 100%; }
        .main-content .expanding-row { height: 100%; }
        .footer-final { text-align: center; font-weight: bold; padding-top: 10px; border-top: 2px solid blue; margin-top: auto; }
      </style>
  
      <div class="header-part">
        <table class="table no-border">
          <tr>
            <td style="width: 20%; text-align: center;">
              <img src="${logoSrc}" alt="logo" style="width: 80px; margin-bottom: 5px;" />
              <p style="font-size: 8px; font-weight: bold;">INSTITUTO PERUANO DEL DEPORTE</p>
            </td>
            <td style="width: 50%; text-align: center;">
              <p class="font-bold">INSTITUTO PERUANO DEL DEPORTE</p>
              <p class="font-bold">CONSEJO REGIONAL MOQUEGUA</p>
              <h3 class="font-bold" style="font-size: 14px; margin: 5px 0;">RECIBO DE INGRESOS</h3>
            </td>
            <td style="width: 30%;">
              <table class="table" style="height: 100%;">
                <tr>
                  <td colspan="3" class="font-bold">N° ${doc.NroDocumento || ''}</td>
                </tr>
                <tr>
                  <td>DIA</td><td>MES</td><td>AÑO</td>
                </tr>
                <tr>
                  <td style="height: 25px;">${day}</td>
                  <td>${month}</td>
                  <td>${year}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
  
        <table class="table" style="margin-top: 5px;">
          <tr>
            <td class="text-left" style="width: 15%;"><b>Señor (es):</b></td>
            <td class="text-left">${doc.AlquiladoA || ''}</td>
          </tr>
        </table>
      </div>
  
<div class="main-content" style="
    /* 1. Contenedor Flexible: Define la altura total y el flujo vertical */
    height: 400px; /* <--- AJUSTA ESTA ALTURA A LO QUE NECESITES (e.g., 100vh) */
    display: flex;
    flex-direction: column;
    margin-top: 5px;
    /* QUITAMOS EL BORDE EXTERIOR DEL DIV */
    border: none; 
">
    <table style="
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
        font-size: 10px;
        table-layout: fixed;
        border-top: 1px solid black; /* AÑADIMOS EL BORDE SUPERIOR DE LA TABLA AQUÍ */
        border-left: 1px solid black; /* AÑADIMOS EL BORDE IZQUIERDO AQUÍ */
        border-right: 1px solid black; /* AÑADIMOS EL BORDE DERECHO AQUÍ */
    ">
        <thead>
            <tr style="background-color: #f0f0f0;">
                <th style="
                    width: 15%;
                    padding: 5px;
                    border-right: 1px solid black;
                    border-bottom: 1px solid black;
                    text-align: center;
                    font-weight: bold;
                ">CÓDIGO</th>
                <th style="
                    padding: 5px;
                    border-right: 1px solid black;
                    text-align: center;
                    border-bottom: 1px solid black;
                    font-weight: bold;
                ">CONCEPTO</th>
                <th style="
                    width: 20%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                    text-align: center;
                    font-weight: bold;
                ">IMPORTE</th>
            </tr>
        </thead>
    </table>

    <table style="
        /* 2. Expansión Vertical: Ocupa todo el espacio restante */
        width: 100%;
        height: 100%; 
        border-collapse: collapse;
        font-family: Arial, sans-serif;
        font-size: 10px;
        table-layout: fixed;
        border-left: 1px solid black; /* Mantenemos el borde izquierdo */
        border-right: 1px solid black; /* Mantenemos el borde derecho */
    ">
        <tbody>
            <tr style="height: 100%;">
                <td style="
                    width: 15%;
                    vertical-align: top;
                    padding: 8px 5px;
                    border-right: 1px solid black;
                    text-align: left;
                ">${doc.CodigoContable || ''}</td>
                
                <td style="
                    vertical-align: top;
                    padding: 8px 5px;
                    border-right: 1px solid black;
                    text-align: left;
                    line-height: 1.3;
                ">
                    <p style="margin: 0;"><strong>PRÁCTICA DEPORTIVA</strong></p>
                    <p style="margin: 0 0 5px 0;">INGRESO POR ALQUILERES</p>
                    <p style="margin: 0 0 8px 0;">${doc.Descripcion || 'DESCRIPCIÓN GENÉRICA'}</p>
                    
                    <p style="margin: 0; font-size: 9px;">CUENTA CORRIENTE: ${doc.CuentaCorriente || '00-000-283118'}</p>
                    <p style="margin: 0; font-size: 9px;">REF: ${doc.Referencia || ''}</p>
                    <p style="margin: 0; font-size: 9px;">N BOLETA: ${doc.NroBoleta || ''}</p>
                </td>
                
                <td style="
                    width: 20%;
                    vertical-align: top;
                    padding: 8px 5px;
                    text-align: right;
                    font-weight: bold;
                ">${parseFloat(doc.Importe || 500.00).toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    <table style="
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
        font-size: 10px;
        table-layout: fixed;
        border: 1px solid black; /* AÑADIMOS EL BORDE INFERIOR COMPLETO AQUÍ */
    ">
        <tfoot>
            <tr style="background-color: #e0e0e0;">
                <td colspan="2" style="
                    width: 80%;
                    padding: 5px;
                    border-right: 1px solid black;
                    text-align: right;
                    font-weight: bold;
                ">TOTAL</td>
                <td style="
                    width: 20%;
                    padding: 5px;
                    text-align: right;
                    font-weight: bold;
                ">${parseFloat(doc.Importe || 500.00).toFixed(2)}</td>
            </tr>
        </tfoot>
    </table>
</div>
      <div class="footer-part">
     <table style="
    margin-top: 2px;
    font-size: 8px;
    border-collapse: collapse; /* Colapsa los bordes para una apariencia más limpia */
    width: 100%; /* Asegura que la tabla use el espacio disponible */
">
    <tr>
        <td colspan="15" style="
            font-weight: bold;
            text-align: center;
            border: 1px solid black;
            padding: 2px;
            background-color: #f0f0f0; /* Fondo ligero para el encabezado */
        ">CÓDIGO DE LA CONTABILIDAD PRESUPUESTAL Y CLASIFICACIÓN PROGRAMÁTICA DEL GASTO PÚBLICO</td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
        <td rowspan="2" colspan="2" style="
            border: 1px solid black;
            vertical-align: middle;
            padding: 2px 1px;
        ">CTA. MAYOR</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">SECTOR</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">PLIEGO</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">PROGRAMA</td>
        <td colspan="2" style="border: 1px solid black; padding: 2px 1px;">SUB</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">OBRA</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">ACTIVIDAD</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">TAREA</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">FUNCIONAL</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">FUENTE FINANCIAMIENTO</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">DEPENDENCIA</td>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">V°B°</td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
        <td rowspan="2" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">PROGRAMA</td>
        <td rowspan="2" style="border: 1px solid black; vertical-align: middle; padding: 2px 1px;">PROYECTO</td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
        <td style="border: 1px solid black; padding: 2px 1px;">DEBE</td>
        <td style="border: 1px solid black; padding: 2px 1px;">HABER</td>
    </tr>
    <tr style="height: 25px; text-align: center;">
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;">09</td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
    </tr>
</table>
  



<table style="
    width: 100%;
    border-collapse: collapse;
    font-size: 10px; /* Tamaño de fuente base reducido */
    text-align: center;
    border: 1px solid black;
">
    <tr>
        <td colspan="5" style="
            border-right: 1px solid black; 
            font-weight: bold; 
            height: 20px; 
            padding: 2px;
        ">CONTABILIDAD PATRIMONIAL</td>

        
        <td rowspan="9" style="
            border: 1px solid black; 
            vertical-align: middle; /* <-- CENTRADO VERTICAL DE FIRMAS */
            text-align: center; 
            font-weight: bold; 
            width: 25%;
        ">
        
            V°B° 


            

            <table style="
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px; 
                text-align: center; 
                border: none;
                font-size: 9px; /* Fuente aún más pequeña para los nombres */
            ">
                <tr>
        <td style="
            width: 50%;
            border: none;
            padding: 0 5px;
            /* --- ESTILOS CLAVE AÑADIDOS --- */
            display: flex;             /* 1. Lo convierte en un Flex Container */
            flex-direction: column;    /* 2. Apila los elementos (HR y P) verticalmente */
            justify-content: center;   /* 3. Centra horizontalmente (si no hay ancho fijo) y verticalmente el bloque de contenido */
            align-items: center;       /* 4. Centra horizontalmente los elementos hijos (HR y P) */
        ">
            <hr style="border: 0.5px solid black; width: 90%; margin: 5px auto 2px;">
            <p style="font-weight: bold; margin: 0; white-space: nowrap;">TESORERIA</p>
        </td>

        <td style="
            width: 50%;
            border: none;
            padding: 0 5px;
            /* --- ESTILOS CLAVE AÑADIDOS --- */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        ">
            <hr style="border: 0.5px solid black; width: 90%; margin: 5px auto 2px;">
            <p style="font-weight: bold; margin: 0; white-space: nowrap;">ADMINISTRADOR</p>
        </td>
                    
                </tr>
            </table>
        </td>
    </tr>

    <tr style="font-weight: bold; height: 16px;"> <td colspan="3" style="border: 1px solid black; font-size: 9px;">CÓDIGO</td> <td colspan="2" style="border: 1px solid black; font-size: 9px;">IMPORTE</td> </tr>

    <tr style="font-weight: bold; height: 18px;"> <td style="width: 15%; border: 1px solid black; font-size: 8px;">CTA. MAYOR</td> <td colspan="2" style="width: 20%; border: 1px solid black; font-size: 8px;">SUB CUENTA</td> <td style="width: 15%; border: 1px solid black; font-size: 8px;">DEBE</td> <td style="width: 15%; border: 1px solid black; font-size: 8px;">HABER</td> </tr>

    <tr style="height: 25px; vertical-align: middle;">
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">10</td>
        <td colspan="2" style="border-left: none; border-right: none; padding-top: 2px;">101<br>01.10</td>
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">0.00</td>
        <td style="border-left: none; border-right: 1px solid black; padding-top: 2px;">0.00</td>
    </tr>

    <tr style="height: 25px; vertical-align: middle;">
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">12</td>
        <td colspan="2" style="border-left: none; border-right: none; padding-top: 2px;">125<br>06</td>
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">0.00</td>
        <td style="border-left: none; border-right: 1px solid black; padding-top: 2px;">0.00</td>
    </tr>

    <tr style="height: 25px; vertical-align: middle;">
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">10</td>
        <td colspan="2" style="border-left: none; border-right: none; padding-top: 2px;">104<br>05.61</td>
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">0.00</td>
        <td style="border-left: none; border-right: 1px solid black; padding-top: 2px;">0.00</td>
    </tr>

    <tr style="height: 25px; vertical-align: middle;">
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">10</td>
        <td colspan="2" style="border-left: none; border-right: none; padding-top: 2px;">101<br>01.1</td>
        <td style="border-left: 1px solid black; border-right: 1px solid black; padding-top: 2px;">0.00</td>
        <td style="border-left: none; border-right: 1px solid black; padding-top: 2px;">0.00</td>
    </tr>

    <tr>
        <td colspan="5" style="
            border: 1px solid black; 
            text-align: left; 
            height: 20px; 
            padding-left: 5px;
        ">V°B°</td>
    </tr>
</table>
     
  </div>
    `;
  
    document.body.appendChild(printContainer);
  
    // Generación de imagen/PDF
    html2canvas(printContainer, { scale: 3, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Recibo_${doc.NroDocumento || 'sin_numero'}.pdf`);
      document.body.removeChild(printContainer);
    }).catch((err) => {
      console.error('Error al generar el PDF:', err);
      if (document.getElementById(printId)) {
        document.body.removeChild(printContainer);
      }
    });
  };
  



  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center"><p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Cargando datos...</p></div>
        </div>
      );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-5">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Gestión de Boletas y Facturas</h1>
              <button onClick={handleAdd} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">
                <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16"><path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" /></svg>
                <span className="hidden xs:block ml-2">Añadir Documento</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                        type="search" 
                        className="form-input w-full dark:bg-gray-700" 
                        placeholder="Buscar por N° de Documento..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select className="form-select dark:bg-gray-700 dark:text-gray-300" value={instalacionFilter} onChange={e => setInstalacionFilter(e.target.value)}>
                        <option value="all">Todas las Instalaciones</option>
                        {instalaciones.map(i => <option key={i} value={i}>{i}</option>)}\
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Lista de Documentos Emitidos ({filteredDocumentos.length})</h2>
              </header>
              <div className="p-3">
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                      <tr>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">N° Documento</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Tipo Doc.</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Alquilado A</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Fecha</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Instalación</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Descripción</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Garantía</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Estado</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-right">Importe</div></th>
                        <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Acciones</div></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredDocumentos.length > 0 ? filteredDocumentos.map(doc => (
                        <tr key={doc.id}>
                          <td className="p-2 whitespace-nowrap"><div className="font-medium text-gray-800 dark:text-gray-100">{doc.NroDocumento}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.Documento}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.AlquiladoA}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.Fecha}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left">{doc.Instalacion}</div></td>
                          <td className="p-2 whitespace-nowrap"><div className="text-left text-xs">{doc.Descripcion}</div></td>
                          <td className="p-2 whitespace-nowrap text-center"><div className={`font-medium ${doc.tieneGarantia === 'Sí' ? 'text-sky-500' : 'text-gray-400'}`}>{doc.tieneGarantia}</div></td>
                          <td className="p-2 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doc.estado === 'Vigente' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-300' : 'bg-rose-100 dark:bg-rose-800 text-rose-500'}`}>\n                                {doc.estado}\n                            </span>
                          </td>
                          <td className="p-2 whitespace-nowrap"><div className="text-right font-medium text-emerald-500">S/ {parseFloat(doc.Importe || 0).toFixed(2)}</div></td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handlePrint(doc)} className="text-gray-400 hover:text-blue-500" title="Imprimir">
                                    <span className="sr-only">Imprimir</span>
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M5 4V3a2 2 0 012-2h6a2 2 0 012 2v1h-1.5a.5.5 0 00-.5.5v1.5H5.5a.5.5 0 00-.5-.5H5zm1.5 0v1.5h8V4.5a.5.5 0 00-.5-.5h-7a.5.5 0 00-.5.5zM4 9a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H4zm0 1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1z"/>
                                    </svg>
                                </button>
                                <button onClick={() => handleEdit(doc.id)} className="text-gray-400 hover:text-indigo-500" title="Editar"><span className="sr-only">Editar</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                <button onClick={() => handleDelete(doc.id)} className="text-rose-500 hover:text-rose-600" title="Eliminar"><span className="sr-only">Eliminar</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="10" className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No se encontraron documentos que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default GestionBoletas;
