import React, { useState } from 'react';
import CentroInformes from './CentroInformes';
import InformeVentas from './InformeVentas';
import DetalleVentaCompleto from './DetalleVentaCompleto';
import InformeClientes from './InformeClientes';
import InformeProductos from './InformeProductos';
import InformePlaceholder from './InformePlaceholder';

type VistaInforme = 
  | 'centro'
  | 'informe-ventas'
  | 'detalle-venta'
  | 'informe-clientes'
  | 'informe-productos'
  | 'informe-inventario'
  | 'informe-despacho'
  | 'informe-cobranza'
  | 'informe-produccion';

const ModuloInformes: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<VistaInforme>('centro');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<string | null>(null);

  const navegarA = (vista: string) => {
    setVistaActual(vista as VistaInforme);
  };

  const volverAlCentro = () => {
    setVistaActual('centro');
    setVentaSeleccionada(null);
  };

  const verDetalleVenta = (idVenta: string) => {
    setVentaSeleccionada(idVenta);
    setVistaActual('detalle-venta');
  };

  const volverAListadoVentas = () => {
    setVistaActual('informe-ventas');
    setVentaSeleccionada(null);
  };

  // Renderizar vista según el estado
  switch (vistaActual) {
    case 'centro':
      return <CentroInformes onNavigate={navegarA} />;

    case 'informe-ventas':
      return (
        <InformeVentas
          onVolver={volverAlCentro}
          onVerDetalle={verDetalleVenta}
        />
      );

    case 'detalle-venta':
      if (!ventaSeleccionada) {
        setVistaActual('informe-ventas');
        return null;
      }
      return (
        <DetalleVentaCompleto
          idVenta={ventaSeleccionada}
          onVolver={volverAListadoVentas}
        />
      );

    case 'informe-clientes':
      return <InformeClientes onVolver={volverAlCentro} />;

    case 'informe-productos':
      return <InformeProductos onVolver={volverAlCentro} />;

    case 'informe-inventario':
      return (
        <InformePlaceholder
          titulo="Informe de Inventario y Bidones"
          descripcion="Control de stock, movimientos y alertas de inventario"
          icono="📦"
          onVolver={volverAlCentro}
        />
      );

    case 'informe-despacho':
      return (
        <InformePlaceholder
          titulo="Informe de Despacho y Rutas"
          descripcion="Seguimiento de entregas, rutas y eficiencia de despacho"
          icono="🚚"
          onVolver={volverAlCentro}
        />
      );

    case 'informe-cobranza':
      return (
        <InformePlaceholder
          titulo="Informe de Cobranza"
          descripcion="Cuentas por cobrar, pagos pendientes y gestión de cobranza"
          icono="💳"
          onVolver={volverAlCentro}
        />
      );

    case 'informe-produccion':
      return (
        <InformePlaceholder
          titulo="Informe de Producción"
          descripcion="Control de producción diaria, litros producidos y eficiencia operacional"
          icono="🏭"
          onVolver={volverAlCentro}
        />
      );

    default:
      return <CentroInformes onNavigate={navegarA} />;
  }
};

export default ModuloInformes;
