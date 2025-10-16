
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { loadDatabasePromise, saveDatabase } from '../database/database';
import { useSettings } from './SettingsContext';

// --- Constantes para Nombres de Tablas ---
export const NOMBRE_TABLA_CUENTAS_CONTABLES = 'CuentasContables';
export const NOMBRE_TABLA_EVENTOS = 'Eventos';
export const NOMBRE_TABLA_HORARIOS = 'Horarios';
export const NOMBRE_TABLA_BOLETAS_FACTURAS = 'BoletasFacturas';
export const NOMBRE_TABLA_GARANTIAS = 'Garantias';
export const NOMBRE_TABLA_RECIBOS = 'Recibos';
export const NOMBRE_TABLA_REFERENCIAS_PAGO = 'ReferenciasDePago';
export const NOMBRE_TABLA_CODIGOS = 'Codigos';
export const NOMBRE_TABLA_INSTALACIONES = 'Instalaciones';

const emptyDatabase = {
    [NOMBRE_TABLA_CUENTAS_CONTABLES]: [], [NOMBRE_TABLA_EVENTOS]: [],
    [NOMBRE_TABLA_HORARIOS]: [], [NOMBRE_TABLA_BOLETAS_FACTURAS]: [],
    [NOMBRE_TABLA_GARANTIAS]: [], [NOMBRE_TABLA_RECIBOS]: [],
    [NOMBRE_TABLA_REFERENCIAS_PAGO]: [], [NOMBRE_TABLA_CODIGOS]: [],
    [NOMBRE_TABLA_INSTALACIONES]: [],
};

export const FormularioContext = createContext();

export function FormularioProvider({ children }) {
  const { settings } = useSettings();

  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(true);
  const [database, setDatabase] = useState(null);
  const [databaseOriginal, setDatabaseOriginal] = useState(null);
  const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tiempoRestanteBackup, setTiempoRestanteBackup] = useState(0);
  const [backupEnProgreso, setBackupEnProgreso] = useState(false);

  // --- REF PARA EVITAR REINICIOS DEL TIMER ---
  const tieneCambiosRef = useRef(tieneCambiosSinGuardar);
  useEffect(() => {
    tieneCambiosRef.current = tieneCambiosSinGuardar;
  }, [tieneCambiosSinGuardar]);

  // --- EFECTOS ---
  useEffect(() => {
    loadDatabasePromise.then(loadedDb => {
      const dbCompleto = { ...emptyDatabase, ...loadedDb };
      setDatabase(dbCompleto); setDatabaseOriginal(dbCompleto); setIsLoading(false);
      console.log("Base de datos cargada y lista.");
    }).catch(error => {
      console.error("Error crítico al cargar la base de datos inicial:", error);
      setMensaje("Error fatal: No se pudo cargar la base de datos.");
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading && database && databaseOriginal) {
      const hayCambios = JSON.stringify(database) !== JSON.stringify(databaseOriginal);
      setTieneCambiosSinGuardar(hayCambios);
      if (hayCambios && !mensaje.includes('guardar') && !mensaje.includes('Backup')) {
        setMensaje('Hay cambios sin guardar.');
      } else if (!hayCambios && mensaje === 'Hay cambios sin guardar.') {
        setMensaje('');
      }
    }
  }, [database, databaseOriginal, isLoading]);

  // --- LÓGICA DE BACKUP AUTOMÁTICO ---
  const ejecutarBackup = useCallback(async () => {
    if (backupEnProgreso || !database) return;
    console.log("[DEBUG] Iniciando proceso de backup...");
    setBackupEnProgreso(true);
    setMensaje('Creando backup automático...');

    try {
        const documentsPath = await Neutralino.os.getPath('documents');
        const backupDir = `${documentsPath}/BackupsApp`;

        try { await Neutralino.filesystem.readDirectory(backupDir); } catch (err) { await Neutralino.filesystem.createDirectory(backupDir); }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = `${backupDir}/backup-${timestamp}.json`;
        
        await Neutralino.filesystem.writeFile(filePath, JSON.stringify(database, null, 2));

        setMensaje('Backup automático completado con éxito.');
        console.log("[DEBUG] Proceso de backup finalizado.");
    } catch (error) {
        console.error("Error durante el backup automático:", error);
        setMensaje('Error al crear el backup.');
    }

    setBackupEnProgreso(false);
    setTimeout(() => setMensaje(tieneCambiosRef.current ? 'Hay cambios sin guardar.' : ''), 3000);
  }, [database, backupEnProgreso]);

  // --- EFECTO DEL TEMPORIZADOR (VERSIÓN FINAL Y CORRECTA) ---
  useEffect(() => {
    const backupIntervalMin = settings.backupInterval;
    const backupIntervalSeg = backupIntervalMin * 60;

    setTiempoRestanteBackup(backupIntervalSeg);

    if (backupIntervalMin <= 0) {
        return;
    }

    const timer = setInterval(() => {
        setTiempoRestanteBackup(prevTime => {
            if (prevTime <= 1) {
                if (tieneCambiosRef.current) {
                    console.log("Ejecutando backup porque hay cambios pendientes.");
                    ejecutarBackup();
                }
                return backupIntervalSeg;
            }
            return prevTime - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.backupInterval, ejecutarBackup]);

  // --- FUNCIÓN PARA RESTAURAR BACKUP ---
  const restaurarDesdeBackup = useCallback(async () => {
    try {
        const documentsPath = await Neutralino.os.getPath('documents');
        const backupDir = `${documentsPath}/BackupsApp`;
        const filePath = await Neutralino.os.showOpenDialog('Cargar archivo de backup', {
            defaultPath: backupDir,
            filters: [{ name: 'Backups JSON', extensions: ['json'] }]
        });

        if (!filePath || filePath.length === 0) {
            setMensaje('Restauración cancelada.');
            setTimeout(() => setMensaje(''), 2000);
            return;
        }

        setMensaje('Restaurando desde backup...');
        const fileContent = await Neutralino.filesystem.readFile(filePath[0]);
        const backupDb = JSON.parse(fileContent);
        const dbRestaurada = { ...emptyDatabase, ...backupDb };

        setDatabase(dbRestaurada);
        await saveDatabase(dbRestaurada);
        setDatabaseOriginal(dbRestaurada);

        setMensaje('¡Restauración completada con éxito!');

    } catch (error) {
        console.error("Error al restaurar desde backup:", error);
        setMensaje('Error en la restauración. Verifique el archivo.');
    } finally {
        setTimeout(() => setMensaje(''), 3000);
    }
  }, []);

    // --- NUEVA FUNCIÓN DE ACTUALIZACIÓN --- 
    const actualizarBoletaCompleta = useCallback((datos) => {
        const { boletaData, garantiaData, garantiaActiva } = datos;
        if (isLoading) return Promise.reject('La base de datos se está cargando');

        setDatabase(prevDb => {
            const newDb = { ...prevDb };
            const boletaId = boletaData.id;

            // 1. Actualizar la boleta/factura principal
            const boletasTabla = newDb[NOMBRE_TABLA_BOLETAS_FACTURAS] || [];
            const indexBoleta = boletasTabla.findIndex(b => b.id === boletaId);
            if (indexBoleta === -1) {
                console.error(`No se encontró la boleta con id ${boletaId} para actualizar.`);
                return prevDb; 
            }
            boletasTabla[indexBoleta] = { ...boletasTabla[indexBoleta], ...boletaData };
            newDb[NOMBRE_TABLA_BOLETAS_FACTURAS] = [...boletasTabla];

            // 2. Reemplazar las referencias de pago de la boleta
            let referenciasTabla = (newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] || []).filter(ref => ref.boletaFacturaId !== boletaId);
            let maxRefId = newDb[NOMBRE_TABLA_REFERENCIAS_PAGO].reduce((max, item) => (item.id > max ? item.id : max), 0);
            const nuevasRefsBoleta = (boletaData.referencias || []).map(ref => ({ ...ref, id: ++maxRefId, boletaFacturaId: boletaId }));
            referenciasTabla.push(...nuevasRefsBoleta);

            // 3. Gestionar la garantía
            const garantiaExistente = (newDb[NOMBRE_TABLA_GARANTIAS] || []).find(g => g.boletaFacturaId === boletaId);

            if (garantiaExistente && !garantiaActiva) { // Se deshabilita una garantía existente
                referenciasTabla = referenciasTabla.filter(ref => ref.garantiaId !== garantiaExistente.id);
                newDb[NOMBRE_TABLA_RECIBOS] = (newDb[NOMBRE_TABLA_RECIBOS] || []).filter(rec => rec.NroReferencia !== `G-${garantiaExistente.id}`);
                newDb[NOMBRE_TABLA_GARANTIAS] = (newDb[NOMBRE_TABLA_GARANTIAS] || []).filter(g => g.id !== garantiaExistente.id);
            } else if (!garantiaExistente && garantiaActiva) { // Se añade una nueva garantía
                let maxGarantiaId = newDb[NOMBRE_TABLA_GARANTIAS].reduce((max, item) => (item.id > max ? item.id : max), 0);
                const nuevaGarantia = { ...garantiaData, id: ++maxGarantiaId, boletaFacturaId: boletaId };
                newDb[NOMBRE_TABLA_GARANTIAS] = [...newDb[NOMBRE_TABLA_GARANTIAS], nuevaGarantia];
                
                let maxReciboId = newDb[NOMBRE_TABLA_RECIBOS].reduce((max, item) => (item.id > max ? item.id : max), 0);
                newDb[NOMBRE_TABLA_RECIBOS].push({ id: ++maxReciboId, Tipo: 'GARANTIA', NroReferencia: `G-${nuevaGarantia.id}` });

                const nuevasRefsGarantia = (garantiaData.referencias || []).map(ref => ({ ...ref, id: ++maxRefId, garantiaId: nuevaGarantia.id }));
                referenciasTabla.push(...nuevasRefsGarantia);
            } else if (garantiaExistente && garantiaActiva) { // Se actualiza una garantía existente
                const indexGarantia = newDb[NOMBRE_TABLA_GARANTIAS].findIndex(g => g.id === garantiaExistente.id);
                const garantiaActualizada = { ...garantiaExistente, ...garantiaData };
                newDb[NOMBRE_TABLA_GARANTIAS][indexGarantia] = garantiaActualizada;

                referenciasTabla = referenciasTabla.filter(ref => ref.garantiaId !== garantiaExistente.id);
                const nuevasRefsGarantia = (garantiaData.referencias || []).map(ref => ({ ...ref, id: ++maxRefId, garantiaId: garantiaExistente.id }));
                referenciasTabla.push(...nuevasRefsGarantia);
            }
            
            newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] = referenciasTabla;

            return newDb;
        });

        setTieneCambiosSinGuardar(true);
        setMensaje('Documento actualizado. No olvide guardar los cambios.');
        return Promise.resolve();
    }, [isLoading]);


  const actualizarEventoCompleto = useCallback((eventoActualizado, horariosNuevos) => {
    if (isLoading) return Promise.reject('La base de datos se está cargando');
    
    return new Promise(resolve => {
        setDatabase(prevDb => {
            const newDb = { ...prevDb };
            const eventoId = eventoActualizado.id;

            // 1. Actualizar el evento
            const eventosTabla = newDb[NOMBRE_TABLA_EVENTOS] || [];
            const indexEvento = eventosTabla.findIndex(e => e.id === eventoId);
            if (indexEvento !== -1) {
                eventosTabla[indexEvento] = eventoActualizado;
            } else {
                console.error(`No se encontró el evento con id ${eventoId} para actualizar.`);
                return prevDb; 
            }
            newDb[NOMBRE_TABLA_EVENTOS] = [...eventosTabla];

            // 2. Reemplazar los horarios
            let horariosTabla = (newDb[NOMBRE_TABLA_HORARIOS] || []).filter(h => h.eventoId !== eventoId);
            let maxHorarioId = newDb[NOMBRE_TABLA_HORARIOS].reduce((max, item) => (item.id > max ? item.id : max), 0);
            const horariosConId = horariosNuevos.map(h => ({
                ...h,
                id: ++maxHorarioId, 
                eventoId: eventoId 
            }));

            newDb[NOMBRE_TABLA_HORARIOS] = [...horariosTabla, ...horariosConId];
            
            resolve();
            return newDb;
        });

        setTieneCambiosSinGuardar(true);
        setMensaje('Evento actualizado. No olvide guardar los cambios.');
    });
  }, [isLoading]);

  // --- OPERACIONES CRUD (INTACTAS) ---
  const agregarEventoCompleto = useCallback((datos) => {
        const { eventoData, horariosData } = datos;
        if (isLoading) return Promise.reject('La base de datos se está cargando');
        return new Promise(resolve => {
            setDatabase(prevDb => {
                const newDb = { ...prevDb };
                const eventosTabla = newDb[NOMBRE_TABLA_EVENTOS] || [];
                const maxEventoId = eventosTabla.reduce((max, item) => (item.id > max ? item.id : max), 0);
                const nuevoEvento = { ...eventoData, id: maxEventoId + 1 };
                newDb[NOMBRE_TABLA_EVENTOS] = [...eventosTabla, nuevoEvento];
                const horariosTabla = newDb[NOMBRE_TABLA_HORARIOS] || [];
                let maxHorarioId = horariosTabla.reduce((max, item) => (item.id > max ? item.id : max), 0);
                const nuevosHorarios = horariosData.map(h => ({
                    ...h,
                    id: ++maxHorarioId,
                    eventoId: nuevoEvento.id
                }));
                newDb[NOMBRE_TABLA_HORARIOS] = [...horariosTabla, ...nuevosHorarios];
                resolve(nuevoEvento);
                return newDb;
            });
            setTieneCambiosSinGuardar(true);
            setMensaje('Evento y horarios añadidos. No olvide guardar los cambios.');
        });
    }, [isLoading]);

  const agregarBoletaCompleta = useCallback((datos) => {
    const { boletaData, garantiaData, garantiaActiva } = datos;
    setDatabase(prevDb => {
      const newDb = { ...prevDb };
      let proximoReciboId = ((newDb[NOMBRE_TABLA_RECIBOS] || []).reduce((max, item) => Math.max(item.id, max), 0)) + 1;
      let proximoReferenciaId = ((newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] || []).reduce((max, item) => Math.max(item.id, max), 0)) + 1;
      const boletaId = ((newDb[NOMBRE_TABLA_BOLETAS_FACTURAS] || []).reduce((max, item) => Math.max(item.id, max), 0)) + 1;
      const nuevaBoleta = { ...boletaData, id: boletaId };
      newDb[NOMBRE_TABLA_BOLETAS_FACTURAS] = [...newDb[NOMBRE_TABLA_BOLETAS_FACTURAS], nuevaBoleta];
      const tipoDoc = boletaData.Anulado ? 'ANULADO' : boletaData.Documento.toUpperCase();
      newDb[NOMBRE_TABLA_RECIBOS] = [...newDb[NOMBRE_TABLA_RECIBOS], { id: proximoReciboId++, Tipo: tipoDoc, NroReferencia: nuevaBoleta.NroRecibo }];
      const refsBoleta = (boletaData.referencias || []).map(ref => ({ ...ref, id: proximoReferenciaId++, boletaFacturaId: boletaId }));
      newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] = [...newDb[NOMBRE_TABLA_REFERENCIAS_PAGO], ...refsBoleta];
      if (garantiaActiva && garantiaData) {
        const garantiaId = ((newDb[NOMBRE_TABLA_GARANTIAS] || []).reduce((max, item) => Math.max(item.id, max), 0)) + 1;
        const nuevaGarantia = { ...garantiaData, id: garantiaId, boletaFacturaId: boletaId };
        newDb[NOMBRE_TABLA_GARANTIAS] = [...newDb[NOMBRE_TABLA_GARANTIAS], nuevaGarantia];
        newDb[NOMBRE_TABLA_RECIBOS] = [...newDb[NOMBRE_TABLA_RECIBOS], { id: proximoReciboId++, Tipo: 'GARANTIA', NroReferencia: `G-${nuevaGarantia.id}` }];
        const refsGarantia = (garantiaData.referencias || []).map(ref => ({ ...ref, id: proximoReferenciaId++, garantiaId: garantiaId }));
        newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] = [...newDb[NOMBRE_TABLA_REFERENCIAS_PAGO], ...refsGarantia];
      }
      return newDb;
    });
    setTieneCambiosSinGuardar(true);
    setMensaje('Documento complejo añadido. No olvide guardar los cambios.');
  }, [isLoading]);

  const agregarRegistro = useCallback((tabla, nuevoRegistro) => {
    if (isLoading) return Promise.reject('La base de datos se está cargando');
    return new Promise(resolve => {
      setDatabase(prevDb => {
        const tablaActual = prevDb[tabla] || [];
        const maxId = tablaActual.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const registroConId = { ...nuevoRegistro, id: maxId + 1 };
        const newDb = { ...prevDb, [tabla]: [...tablaActual, registroConId] };
        resolve(registroConId);
        return newDb;
      });
      setTieneCambiosSinGuardar(true);
      setMensaje('Registro añadido. No olvide guardar los cambios.');
    });
  }, [isLoading]);

  const actualizarRegistro = useCallback((tabla, id, datosNuevos) => {
      if (isLoading) return;
      setDatabase(prevDb => {
          const newDb = { ...prevDb };
          const tablaActual = newDb[tabla] || [];
          const index = tablaActual.findIndex(item => item.id === id);
          if (index > -1) {
              const itemActualizado = { ...tablaActual[index], ...datosNuevos };
              newDb[tabla] = [ ...tablaActual.slice(0, index), itemActualizado, ...tablaActual.slice(index + 1) ];
          }
          return newDb;
      });
      setTieneCambiosSinGuardar(true);
      setMensaje('Registro actualizado. No olvide guardar los cambios.');
  }, [isLoading]);

  const eliminarRegistro = useCallback((tabla, id) => {
    if (isLoading) return;
    setDatabase(prevDb => {
        let newDb = { ...prevDb };
        const eliminarGarantiaCompleta = (garantiaId) => {
            if (!newDb[NOMBRE_TABLA_GARANTIAS]?.find(g => g.id === garantiaId)) return;
            newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] = newDb[NOMBRE_TABLA_REFERENCIAS_PAGO]?.filter(ref => ref.garantiaId !== garantiaId);
            newDb[NOMBRE_TABLA_RECIBOS] = newDb[NOMBRE_TABLA_RECIBOS]?.filter(rec => rec.NroReferencia !== `G-${garantiaId}`);
            newDb[NOMBRE_TABLA_GARANTIAS] = newDb[NOMBRE_TABLA_GARANTIAS]?.filter(g => g.id !== garantiaId);
        };
        const eliminarBoletaCompleta = (boletaId) => {
            const boleta = newDb[NOMBRE_TABLA_BOLETAS_FACTURAS]?.find(b => b.id === boletaId);
            if (!boleta) return;
            newDb[NOMBRE_TABLA_REFERENCIAS_PAGO] = newDb[NOMBRE_TABLA_REFERENCIAS_PAGO]?.filter(ref => ref.boletaFacturaId !== boletaId);
            const garantiaAsociada = newDb[NOMBRE_TABLA_GARANTIAS]?.find(g => g.boletaFacturaId === boletaId);
            if (garantiaAsociada) { eliminarGarantiaCompleta(garantiaAsociada.id); }
            newDb[NOMBRE_TABLA_RECIBOS] = newDb[NOMBRE_TABLA_RECIBOS]?.filter(rec => rec.NroReferencia !== boleta.NroRecibo);
            newDb[NOMBRE_TABLA_BOLETAS_FACTURAS] = newDb[NOMBRE_TABLA_BOLETAS_FACTURAS]?.filter(b => b.id !== boletaId);
        };
        if (tabla === NOMBRE_TABLA_RECIBOS) {
            const recibo = newDb[NOMBRE_TABLA_RECIBOS]?.find(r => r.id === id);
            if (recibo) {
                if (recibo.Tipo === 'GARANTIA') {
                    const garantiaId = parseInt(recibo.NroReferencia.split('-')[1]);
                    if (!isNaN(garantiaId)) eliminarGarantiaCompleta(garantiaId);
                } else {
                    const boleta = newDb[NOMBRE_TABLA_BOLETAS_FACTURAS]?.find(b => b.NroRecibo === recibo.NroReferencia);
                    if (boleta) eliminarBoletaCompleta(boleta.id);
                }
            }
        } else if (tabla === NOMBRE_TABLA_BOLETAS_FACTURAS) {
            eliminarBoletaCompleta(id);
        } else if (tabla === NOMBRE_TABLA_GARANTIAS) {
            eliminarGarantiaCompleta(id);
        } else if (tabla === NOMBRE_TABLA_EVENTOS) {
            newDb[NOMBRE_TABLA_HORARIOS] = (newDb[NOMBRE_TABLA_HORARIOS] || []).filter(h => h.eventoId !== id);
            newDb[NOMBRE_TABLA_EVENTOS] = (newDb[NOMBRE_TABLA_EVENTOS] || []).filter(e => e.id !== id);
        } else {
            newDb[tabla] = (newDb[tabla] || []).filter(item => item.id !== id);
        }
        return newDb;
    });
    setTieneCambiosSinGuardar(true);
    setMensaje('Registro eliminado. No olvide guardar los cambios.');
  }, [isLoading]);

  const guardarCambios = useCallback(() => {
    if (!tieneCambiosSinGuardar) return Promise.resolve();
    setMensaje('Guardando...');
    return saveDatabase(database).then(() => {
      setDatabaseOriginal(database);
      setTieneCambiosSinGuardar(false);
      setMensaje('¡Cambios guardados con éxito!');
      setTimeout(() => setMensaje(''), 2000);
    }).catch(error => {
      console.error("Error al guardar:", error);
      setMensaje('Error al guardar.');
    });
  }, [database, tieneCambiosSinGuardar]);

  const descartarCambios = useCallback(() => {
    if(!tieneCambiosSinGuardar) return;
    setDatabase(databaseOriginal);
    setTieneCambiosSinGuardar(false);
    setMensaje('Cambios descartados.');
    setTimeout(() => setMensaje(''), 2000);
  }, [databaseOriginal, tieneCambiosSinGuardar]);

  // --- VALOR DEL CONTEXTO ---
  if (isLoading) {
    return <div>Cargando base de datos...</div>;
  }
  const value = { 
      database, isLoading, agregarRegistro, agregarBoletaCompleta, agregarEventoCompleto, 
      eliminarRegistro, actualizarRegistro, actualizarEventoCompleto, actualizarBoletaCompleta, // <-- ¡Función añadida aquí!
      mensaje, tieneCambiosSinGuardar, guardarCambios, descartarCambios, 
      tiempoRestanteBackup, backupEnProgreso, ejecutarBackup, restaurarDesdeBackup
  };

  return (
    <FormularioContext.Provider value={value}>
      {children}
    </FormularioContext.Provider>
  );
}

export const useFormulario = () => useContext(FormularioContext);
