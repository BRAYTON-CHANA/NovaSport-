import React, { useState, useCallback } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useSettings } from '../context/SettingsContext';
import { useFormulario } from '../context/FormularioContext';

function Backups() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { 
    tiempoRestanteBackup, 
    tieneCambiosSinGuardar, 
    restaurarDesdeBackup, // <-- OBTENER LA FUNCIÓN DE RESTAURACIÓN
    backupEnProgreso 
  } = useFormulario();

  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value, 10);
    if (!isNaN(newInterval) && newInterval > 0) {
      updateSettings({ backupInterval: newInterval });
    } else if (e.target.value === '' || newInterval === 0) {
      updateSettings({ backupInterval: 0 });
    }
  };

  // --- FUNCIÓN PARA ABRIR LA CARPETA DE BACKUPS ---
  const handleOpenBackupFolder = useCallback(async () => {
    try {
      const documentsPath = await Neutralino.os.getPath('documents');
      const backupDir = `${documentsPath}/BackupsApp`;
      // Intenta leer el directorio para ver si existe
      await Neutralino.filesystem.readDirectory(backupDir);
      await Neutralino.os.open(backupDir);
    } catch (err) {
        // Si falla (porque no existe), lo crea y luego lo abre
        try {
            const documentsPath = await Neutralino.os.getPath('documents');
            const backupDir = `${documentsPath}/BackupsApp`;
            await Neutralino.filesystem.createDirectory(backupDir);
            await Neutralino.os.open(backupDir);
        } catch (error) {
            console.error('Error al crear o abrir la carpeta de backups:', error);
        }
    }
  }, []);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Gestión de Backups</h1>
            </div>

            {/* --- SECCIÓN DE RESTAURACIÓN (NUEVA) --- */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Restaurar desde Backup</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Carga un archivo de backup (.json) para restaurar todos los datos de la aplicación. Esta acción sobrescribirá los datos actuales de forma irreversible.
              </p>
              <div className="flex items-center space-x-4">
                  <button 
                    className="btn bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50"
                    onClick={restaurarDesdeBackup}
                    disabled={backupEnProgreso}
                  >
                    {backupEnProgreso ? 'Proceso en curso...' : 'Seleccionar Archivo y Restaurar'}
                  </button>
                  <button 
                    className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300"
                    onClick={handleOpenBackupFolder}
                  >
                    Abrir Carpeta de Backups
                  </button>
              </div>
            </div>

            {/* Sección de Backups Automáticos */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Backups Automáticos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Define un intervalo para que la aplicación guarde una copia de seguridad automáticamente. El backup solo se creará si existen cambios sin guardar.
              </p>
              
              <div className="flex items-center space-x-4">
                <label htmlFor="backup-interval" className="font-medium text-gray-700 dark:text-gray-200">Intervalo de guardado (minutos):</label>
                <input
                  id="backup-interval"
                  type="number"
                  className="form-input w-24 text-center dark:bg-gray-700 dark:text-gray-200"
                  value={settings.backupInterval > 0 ? settings.backupInterval : ''}
                  onChange={handleIntervalChange}
                  min="0"
                  placeholder="Off"
                />
              </div>

              <div className="mt-6">
                {settings.backupInterval > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Próximo intento de backup en:
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 tabular-nums tracking-widest">
                      {formatTime(tiempoRestanteBackup)}
                    </p>
                    <p className={`text-xs mt-1 ${tieneCambiosSinGuardar ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tieneCambiosSinGuardar ? 
                        'Cambios pendientes detectados. El backup se ejecutará.' :
                        '(El backup se omitirá si no hay cambios sin guardar)'
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    El backup automático está desactivado.
                  </p>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Backups;
