/**
 * =========================================================================
 *                               TIPOS DE DATOS
 * =========================================================================
 */

/**
 * @typedef {object} CuentaContableItem
 * @property {number} id
 * @property {string} Codigo
 * @property {string} Categoria
 * @property {string} Subcategoria
 */

/**
 * @typedef {object} EventoItem
 * @property {number} id
 * @property {string} nombreEvento
 * @property {string} instalacion
 * @property {string} tipoEvento
 * @property {string} motivo
 * @property {string} descripcion
 * @property {string} nombreRemitente
 * @property {string} cargo
 * @property {boolean} representaInstitucion
 * @property {string} cualInstitucion
 * @property {string} nombreSolicitante
 * @property {string} dniRuc
 * @property {string} correo
 * @property {string} telefono
 */

/**
 * @typedef {object} HorarioItem
 * @property {number} id
 * @property {number} eventoId
 * @property {string} espacioDeportivo
 * @property {string} fecha
 * @property {string} horaInicio
 * @property {string} horaFin
 */

/**
 * @typedef {object} BoletaFacturaItem
 * @property {number} id
 * @property {number} cuentaContableId
 * @property {string} NroDocumento
 * @property {string} Fecha
 * @property {string} AlquiladoA
 * @property {string} Instalacion
 * @property {string} Descripcion
 * @property {string} CuentaCorriente
 * @property {number} EstadoDeposito
 * @property {number} Importe
 * @property {number} Garantia
 * @property {number} Anulado
 * @property {string} Documento
 */

/**
 * @typedef {object} GarantiaItem
 * @property {number} id
 * @property {number} boletaFacturaId
 * @property {number} cuentaContableId
 * @property {string} NroGarantia
 * @property {string} Descripcion
 * @property {string} CuentaCorriente
 * @property {number} Importe
 * @property {string} DirigidoA
 */

/**
 * @typedef {object} ReciboItem
 * @property {number} id
 * @property {'BOLETA' | 'FACTURA' | 'GARANTIA' | 'ANULADO'} Tipo
 * @property {string} NroReferencia
 */

/**
 * @typedef {object} ReferenciaPagoItem
 * @property {number} id
 * @property {string} NroReferencia
 * @property {string} Fecha
 * @property {number} Importe
 * @property {'BOLETA_FACTURA' | 'GARANTIA'} tipoDocumento
 * @property {number} documentoId
 */

/**
 * @typedef {object} CodigoItem
 * @property {number} id
 * @property {string} prefijo
 * @property {string} ciudad
 */

/**
 * Representa una instalación o espacio físico.
 * @typedef {object} InstalacionItem
 * @property {number} id - El identificador único.
 * @property {string} nombre - El nombre de la instalación (e.g., "Piscina Olímpica").
 */

/**
 * -------------------------------------------------------------------------
 *                            ESTRUCTURA DE LA BASE DE DATOS
 * -------------------------------------------------------------------------
 */

/**
 * @typedef {object} Database
 * @property {Array<CuentaContableItem>} CuentasContables
 * @property {Array<EventoItem>} Eventos
 * @property {Array<HorarioItem>} Horarios
 * @property {Array<BoletaFacturaItem>} BoletasFacturas
 * @property {Array<GarantiaItem>} Garantias
 * @property {Array<ReciboItem>} Recibos
 * @property {Array<ReferenciaPagoItem>} ReferenciasDePago
 * @property {Array<CodigoItem>} Codigos
 * @property {Array<InstalacionItem>} Instalaciones // <-- NUEVA TABLA
 */
