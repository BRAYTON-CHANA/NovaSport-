import React, { useState } from 'react';
import ExcelJS from 'exceljs';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

function ViewExcel() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [excelSheets, setExcelSheets] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsProcessing(true);
    setExcelSheets([]);
    const reader = new FileReader();

    reader.onerror = (err) => {
      console.error("FileReader Error:", err);
      setIsProcessing(false);
    };

    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const allSheetData = [];

        workbook.eachSheet((worksheet, sheetId) => {
          const tablesData = [];
          const tables = worksheet.getTables();

          tables.forEach(table => {
            const tableObject = JSON.parse(JSON.stringify(table.getColumn()));
            const tableRef = tableObject.table.table.tableRef;

            if (tableRef) {
                const extractedData = [];
                const rangeRefs = tableRef.split(':');
                const startCellRef = rangeRefs[0];
                const endCellRef = rangeRefs.length > 1 ? rangeRefs[1] : startCellRef;

                const startRow = worksheet.getCell(startCellRef).row;
                const endRow = worksheet.getCell(endCellRef).row;
                const startCol = worksheet.getCell(startCellRef).col;
                const endCol = worksheet.getCell(endCellRef).col;

                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    if (rowNumber >= startRow && rowNumber <= endRow) {
                        const rowData = [];
                        for (let i = startCol; i <= endCol; i++) {
                            const cell = row.getCell(i);
                            let cellValue = cell.value;

                            if (cellValue !== null && typeof cellValue === 'object') {
                                if (cellValue.result !== undefined) {
                                    cellValue = cellValue.result;
                                } else if (cellValue.richText) {
                                    cellValue = cellValue.richText.map(rt => rt.text).join('');
                                }
                            }

                            if (cellValue === null || cellValue === undefined) {
                                cellValue = '';
                            } else if (typeof cellValue === 'boolean') {
                                cellValue = cellValue ? 'VERDADERO' : 'FALSO';
                            }

                            rowData.push(String(cellValue));
                        }
                        extractedData.push(rowData);
                    }
                });

                if (extractedData.length > 0) {
                  tablesData.push({
                      name: table.name,
                      headers: extractedData[0],
                      rows: extractedData.slice(1)
                  });
                }
            }
          });
          
          if (tablesData.length > 0) {
              allSheetData.push({
                  sheetName: worksheet.name,
                  tables: tablesData
              });
          }
        });
        
        setExcelSheets(allSheetData);

      } catch (err) {
        console.error("Processing Error with ExcelJS:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Visor de Tablas Excel</h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <label className={`btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span>{isProcessing ? 'Procesando...' : 'Subir Archivo Excel'}</span>
                  <input type="file" accept=".xlsx, .xlsm" onChange={handleFileUpload} disabled={isProcessing} className="hidden" />
                </label>
              </div>
            </div>

            {isProcessing && <div className="text-center p-8">Analizando archivo, por favor espera...</div>}

            <div className="space-y-8">
              {excelSheets.map((sheet, sheetIndex) => (
                <div key={sheetIndex}>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Hoja: {sheet.sheetName}</h2>
                  {sheet.tables.map((table, tableIndex) => (
                    <div key={tableIndex} className="mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-5">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tabla: {table.name}</h3>
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full">
                          <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
                            <tr>
                              {table.headers.map((header, i) => (
                                <th key={i} className="p-2 whitespace-nowrap">
                                  <div className="font-semibold text-left">{header}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                            {table.rows.map((row, i) => (
                              <tr key={i}>
                                {row.map((cell, j) => (
                                  <td key={j} className="p-2 whitespace-nowrap">
                                    <div className="text-left">{cell}</div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewExcel;