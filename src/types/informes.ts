// Tipos e interfaces para el módulo de informes

// =============== TIPOS DE VENTAS ===============
export interface VentaCabecera {
  id_ventas: string;
  fecha: string;
  id_cliente: string;
  nombre_cliente?: string;
  nombre_distribuidor?: string;
  tip_documento: 'BOLETA' | 'FACTURA' | 'FACT.PENDIENTE';
  n_documento: number | null;
  forma_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  fecha_pago?: string | null;
  estado: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  canal_venta?: string;
  notas?: string;
  valor_total?: number;
}

export interface DetalleVenta {
  id_venta_det: string;
  id_ventas: string;
  id_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha_venta: string;
}

export interface VentaCompleta extends VentaCabecera {
  detalle: DetalleVenta[];
}

// =============== TIPOS DE CLIENTES ===============
export interface ClienteInfo {
  id_cliente: string;
  rut: string;
  nombre: string;
  tipo_cliente: string;
  telefono: string | null;
  direccion_despacho: string | null;
  comuna: string | null;
  total_compras?: number;
  cantidad_ventas?: number;
  ultima_compra?: string;
}

// =============== TIPOS DE PRODUCTOS ===============
export interface ProductoInfo {
  id_producto: string;
  producto: string;
  precio: number;
  total_vendido?: number;
  cantidad_ventas?: number;
  ingresos_generados?: number;
}

// =============== TIPOS DE INVENTARIO ===============
export interface MovimientoBidon {
  id_movimiento: string;
  fecha: string;
  tipo_movimiento: string;
  cantidad: number;
  id_cliente?: string;
  nombre_cliente?: string;
  observaciones?: string;
}

export interface StockBidon {
  tipo_bidon: string;
  stock_actual: number;
  stock_minimo?: number;
  en_transito?: number;
}

// =============== TIPOS DE DESPACHO ===============
export interface DespachoInfo {
  id_despacho: string;
  fecha: string;
  ruta: string;
  conductor?: string;
  estado: string;
  cantidad_entregas: number;
  entregas_completadas?: number;
  entregas_pendientes?: number;
}

// =============== TIPOS DE COBRANZA ===============
export interface CuentaPorCobrar {
  id_ventas: string;
  fecha_venta: string;
  id_cliente: string;
  nombre_cliente: string;
  tip_documento: string;
  n_documento: number | null;
  monto: number;
  dias_atraso: number;
  estado: string;
}

// =============== TIPOS DE PRODUCCIÓN ===============
export interface ProduccionDiaria {
  fecha: string;
  litros_producidos: number;
  bidones_llenados: number;
  turno?: string;
  operador?: string;
}

// =============== FILTROS ===============
export interface FiltrosInforme {
  fechaInicio?: string;
  fechaFin?: string;
  idCliente?: string;
  tipoCliente?: string;
  tipoDocumento?: string;
  formaPago?: string;
  estado?: string;
  canal?: string;
  ruta?: string;
  conductor?: string;
}

// =============== KPIs ===============
export interface KPIVentas {
  totalVentas: number;
  cantidadTransacciones: number;
  ticketPromedio: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia: number;
}

export interface KPIClientes {
  totalClientes: number;
  clientesActivos: number;
  clientesNuevos: number;
  clientesDistribuidores: number;
  clientesHogar: number;
}

export interface KPIInventario {
  bidonesDisponibles: number;
  bidonesEnTransito: number;
  bidonesRequeridos: number;
  alertasStock: number;
}

export interface KPIDespacho {
  despachosRealizados: number;
  despachosCompletados: number;
  despachosPendientes: number;
  eficienciaDespacho: number;
}

export interface KPICobranza {
  totalPorCobrar: number;
  cuentasVencidas: number;
  montoVencido: number;
  diasPromedioAtraso: number;
}

export interface KPIProduccion {
  litrosTotales: number;
  bidonesProcesados: number;
  promedioLitrosDia: number;
  eficienciaOperacional: number;
}
