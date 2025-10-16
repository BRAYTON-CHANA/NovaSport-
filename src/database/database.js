/**
 * =========================================================================
 *                            GESTOR DE BASE DE DATOS
 * =========================================================================
 */

const isNeutralino = typeof Neutralino !== 'undefined';
const DB_WEB_KEY = 'app-database';
const DB_NATIVE_PATH = '/database.json';

/** @type {import('../types/types').Database} */
const emptyDatabase = {
    CuentasContables: [],
    Eventos: [],
    Horarios: [],
    BoletasFacturas: [],
    Garantias: [],
    Recibos: [],
    ReferenciasDePago: [],
    Codigos: [],
    Instalaciones: [], // <-- NUEVA TABLA AÑADIDA
};

// --- DATOS POR DEFECTO PARA LA SIEMBRA (SEEDING) ---

const defaultCuentasContables = [
    // ... (la lista larga de cuentas contables permanece aquí sin cambios)
    { Codigo: '1', Categoria: 'INGRESOS PRESUPUESTARIOS', Subcategoria: 'INGRESOS PRESUPUESTARIOS' },
    { Codigo: '1,3', Categoria: 'VENTA DE BIENES Y SERVICIOS Y DERECHOS ADMINISTRATIVOS', Subcategoria: 'VENTA DE BIENES Y SERVICIOS Y DERECHOS ADMINISTRATIVOS' },
    { Codigo: '1,3,1', Categoria: 'VENTA DE BIENES ', Subcategoria: 'VENTA DE BIENES' },
    { Codigo: '1,3,19,1,1', Categoria: 'VENTA DE OTROS BIENES', Subcategoria: 'SUMINISTRO DE AGUA' },
    { Codigo: '1,3,19,1,2', Categoria: 'VENTA DE OTROS BIENES', Subcategoria: 'VENTA DE BASES PARA LICITacion PUBLICA, CONCURSO PUBLICO Y OTROS' },
    { Codigo: '1,3,3', Categoria: 'VENTA DE SERVICIOS', Subcategoria: 'VENTA DE SERVICIOS' },
    { Codigo: '1,3,33,2', Categoria: 'SERVICIOS DE EDUCACION, RECREACION Y CULTURA', Subcategoria: 'SERVICIOS RECREATIVOS Y CULTURALES' },
    { Codigo: '1,3,33,2,1', Categoria: 'SERVICIOS DE EDUCACION, RECREacion Y CULTURA', Subcategoria: 'VACACIONES UTILES' },
    { Codigo: '1,3,33,2,99', Categoria: 'SERVICIOS DE EDUCACION, RECREACION Y CULTURA', Subcategoria: 'OTROS SERVICIOS CULTURALES Y RECREATIVOS' },
    { Codigo: '1,3,33,2,99', Categoria: 'SERVICIOS DE EDUCACION, RECREACION Y CULTURA', Subcategoria: 'ENTRADAS AL PUBLICO  - ACTIVIDADES RECREATIVAS' },
    { Codigo: '1,3,33,2,99', Categoria: 'SERVICIOS DE EDUCACION, RECREACION Y CULTURA', Subcategoria: 'INSCRIPCIONES A PROGRAMAS' },
    { Codigo: '1,3,34,1', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'SERVICIOS MEDICOS - ASISTENCIALES' },
    { Codigo: '1,3,34,11', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'ATENCION MEDICA' },
    { Codigo: '1,3,34,12', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'ATENCION DENTAL' },
    { Codigo: '1,3,34,199', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'OTROS SERVICIOS MEDICOS - ASISTENCIALES' },
    { Codigo: '1,3,34,199', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'REHABILITACION FISICA' },
    { Codigo: '1,3,34,2', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'EXAMENES DE LABORATORIO Y DE AYUDA AL DIAGNOSTICO' },
    { Codigo: '1,3,34,21', Categoria: 'SERVICIOS DE SALUD', Subcategoria: 'EXAMENES DE LABORATORIO' },
    { Codigo: '1,3,35,1', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'INMUEBLES Y TERRENOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'EDIFICIOS E INSTALACIONES' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE ESPACIOS PUBLICITARIOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'CANJE POR ESPACIOS PUBLICITARIOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE ESTADIOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE COLISEOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE COMPLEJOS DEPORTIVOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE MINI COMPLEJOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE PISCINAS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE LOSAS DEPORTIVAS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE GIMNASIOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE TERRENOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE SALAS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE KIOSKOS' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE PISTA ATLETICA' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'INSTALACION DE EQUIPO DE TELEVISION' },
    { Codigo: '1,3,35,11', Categoria: 'INGRESO POR ALQUILERES', Subcategoria: 'ALQUILER DE ESTACIONAMIENTO' },
    { Codigo: '1,3,39,2', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'SERVICIOS A TERCEROS' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'MANTENIMIENTO Y CONSERVACION' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'USO DE SERVICIOS HIGENICOS' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION de SERVICIOS', Subcategoria: 'DERECHO DE TRAMITE' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'CONSTANCIAS' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'CARNETS' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'FOTOCOPIAS' },
    { Codigo: '1,3,39,29', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'PASES E INSCRIPCION DE VENDEDORES AMBULANTES' },
    { Codigo: '1,3,39,218', Categoria: 'OTROS INGRESOS POR PRESTACION DE SERVICIOS', Subcategoria: 'SUMINISTRO DE ENERGIA' },
    { Codigo: '1,5,2', Categoria: 'MULTAS Y SANCIONES NO TRIBUTARIAS', Subcategoria: 'MULTAS Y SANCIONES NO TRIBUTARIAS' },
    { Codigo: '1,5,22,1', Categoria: 'SANCIONES', Subcategoria: 'SANCIONES ADMINISTRATIVAS' },
    { Codigo: '1,5,22,11', Categoria: 'SANCIONES', Subcategoria: 'SANCIONES DE ADMINISTRACION GENERAL (PENALIDADES)' },
    { Codigo: '1,5,5', Categoria: 'INGRESOS DIVERSOS', Subcategoria: 'INGRESOS DIVERSOS' },
    { Codigo: '1,5,51,499', Categoria: 'INGRESOS DIVERSOS', Subcategoria: 'OTROS INGRESOS DIVERSOS' },
    { Codigo: '1,5,51,499', Categoria: 'INGRESOS DIVERSOS', Subcategoria: 'INGRESOS EXTRAORDINARIOS' },
    { Codigo: '1,9,11,11', Categoria: 'SALDOS DE BALANCE', Subcategoria: 'SALDOS DE BALANCE' },
    { Codigo: '0,0,0,0,0,0', Categoria: 'INGRESOS POR FONDOS DE GARANTIA', Subcategoria: 'INGRESOS POR FONDOS DE GARANTIA' },
    { Codigo: '0,0', Categoria: 'ANULADO', Subcategoria: 'ANULADO' },
];

const defaultInstalaciones = ['Coliseo A', 'Coliseo B', 'Piscina'];

export const saveDatabase = async (dbState) => {
    try {
        const dbString = JSON.stringify(dbState, null, 2);
        if (isNeutralino) {
            await Neutralino.filesystem.writeFile(DB_NATIVE_PATH, dbString);
        } else {
            localStorage.setItem(DB_WEB_KEY, dbString);
        }
    } catch (error) {
        console.error("Error fatal al guardar la base de datos:", error);
    }
};

export const loadDatabasePromise = new Promise(async (resolve) => {
    let dbData = null;
    let db;
    let needsSave = false;

    try {
        if (isNeutralino) {
            try { 
                dbData = await Neutralino.filesystem.readFile(DB_NATIVE_PATH); 
            } catch (e) {
                if (e.code !== 'NE_FS_FILENOTF') throw e;
            }
        } else {
            dbData = localStorage.getItem(DB_WEB_KEY);
        }

        if (dbData) {
            // --- Lógica para base de datos EXISTENTE ---
            const parsedDb = JSON.parse(dbData);
            db = { ...emptyDatabase, ...parsedDb }; // Asegura que todas las tablas existan

            // --- INICIO DE LA MODIFICACIÓN ---
            // Comprueba si CuentasContables está vacío y lo siembra si es necesario.
            if (!db.CuentasContables || db.CuentasContables.length === 0) {
                console.log("Sembrando 'CuentasContables' en base de datos existente.");
                const uniqueCuentasContables = defaultCuentasContables.filter(
                    (cuenta, index, self) =>
                        index === self.findIndex(c => c.Categoria === cuenta.Categoria && c.Subcategoria === cuenta.Subcategoria)
                );
                db.CuentasContables = uniqueCuentasContables.map((cuenta, index) => ({
                    id: index + 1,
                    ...cuenta,
                }));
                needsSave = true;
            }

            // Comprueba si Instalaciones está vacío y lo siembra si es necesario.
            if (!db.Instalaciones || db.Instalaciones.length === 0) {
                console.log("Sembrando 'Instalaciones' en base de datos existente.");
                db.Instalaciones = defaultInstalaciones.map((nombre, index) => ({
                    id: index + 1,
                    nombre: nombre,
                }));
                needsSave = true;
            }

            if (needsSave) {
                await saveDatabase(db);
            }
            // --- FIN DE LA MODIFICACIÓN ---

            resolve(db);
            return;

        }
    } catch (error) {
        console.error("Error al cargar o migrar la base de datos. Se creará una DB nueva.", error);
    }

    // --- Lógica para base de datos NUEVA (si lo anterior falla o no hay datos) ---
    console.log("No se encontró base de datos. Creando y sembrando una por defecto.");

    const uniqueCuentasContables = defaultCuentasContables.filter(
        (cuenta, index, self) =>
            index === self.findIndex(c => c.Categoria === cuenta.Categoria && c.Subcategoria === cuenta.Subcategoria)
    );

    /** @type {import('../types/types').Database} */
    const defaultDb = {
        ...emptyDatabase,
        CuentasContables: uniqueCuentasContables.map((cuenta, index) => ({
            id: index + 1,
            ...cuenta,
        })),
        Instalaciones: defaultInstalaciones.map((nombre, index) => ({
            id: index + 1,
            nombre: nombre,
        })),
    };
    
    await saveDatabase(defaultDb);
    resolve(defaultDb);
});
