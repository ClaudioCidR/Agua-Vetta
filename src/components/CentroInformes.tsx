import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { useInformeVentas } from '../hooks/useInformeVentas';
import { useInformeClientes } from '../hooks/useInformeClientes';

interface CentroInformesProps {
  onNavigate: (vista: string) => void;
}

const CentroInformes: React.FC<CentroInformesProps> = ({ onNavigate }) => {
  const { kpis: kpisVentas, calcularKPIs: calcularKPIsVentas } = useInformeVentas();
  const { kpis: kpisClientes, calcularKPIs: calcularKPIsClientes } = useInformeClientes();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarKPIs = async () => {
      setLoading(true);
      // Calcular KPIs para los últimos 30 días
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - 30);
      const fechaInicio = fecha.toISOString().split('T')[0];

      await Promise.all([
        calcularKPIsVentas({ fechaInicio }),
        calcularKPIsClientes({ fechaInicio })
      ]);
      setLoading(false);
    };

    cargarKPIs();
  }, [calcularKPIsVentas, calcularKPIsClientes]);

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando centro de informes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Centro de Informes
        </h1>
        <p className="text-gray-600">
          Sistema de Gestión y Análisis - Agua Vetta
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Datos de los últimos 30 días
        </p>
      </div>

      {/* Grid de Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard de Ventas */}
        <DashboardCard
          titulo="Ventas"
          descripcion="Análisis de ventas y transacciones"
          icono="💰"
          color="blue"
          kpis={[
            {
              label: 'Total Ventas',
              valor: kpisVentas ? formatearMoneda(kpisVentas.totalVentas) : '$0'
            },
            {
              label: 'Transacciones',
              valor: kpisVentas?.cantidadTransacciones || 0
            },
            {
              label: 'Ticket Promedio',
              valor: kpisVentas ? formatearMoneda(kpisVentas.ticketPromedio) : '$0'
            }
          ]}
          onVerInforme={() => onNavigate('informe-ventas')}
        />

        {/* Dashboard de Clientes */}
        <DashboardCard
          titulo="Clientes"
          descripcion="Gestión y análisis de clientes"
          icono="👥"
          color="green"
          kpis={[
            {
              label: 'Total Clientes',
              valor: kpisClientes?.totalClientes || 0
            },
            {
              label: 'Clientes Activos',
              valor: kpisClientes?.clientesActivos || 0
            },
            {
              label: 'Distribuidores',
              valor: kpisClientes?.clientesDistribuidores || 0
            },
            {
              label: 'Hogar',
              valor: kpisClientes?.clientesHogar || 0
            }
          ]}
          onVerInforme={() => onNavigate('informe-clientes')}
        />

        {/* Dashboard de Inventario y Bidones */}
        <DashboardCard
          titulo="Inventario y Bidones"
          descripcion="Control de stock y movimientos"
          icono="📦"
          color="purple"
          kpis={[
            {
              label: 'Stock Disponible',
              valor: 'Próximamente'
            },
            {
              label: 'En Tránsito',
              valor: 'Próximamente'
            }
          ]}
          onVerInforme={() => onNavigate('informe-inventario')}
        />

        {/* Dashboard de Despacho y Rutas */}
        <DashboardCard
          titulo="Despacho y Rutas"
          descripcion="Seguimiento de entregas y rutas"
          icono="🚚"
          color="orange"
          kpis={[
            {
              label: 'Despachos Hoy',
              valor: 'Próximamente'
            },
            {
              label: 'Rutas Activas',
              valor: 'Próximamente'
            }
          ]}
          onVerInforme={() => onNavigate('informe-despacho')}
        />

        {/* Dashboard de Cobranza */}
        <DashboardCard
          titulo="Cobranza"
          descripcion="Cuentas por cobrar y pagos"
          icono="💳"
          color="red"
          kpis={[
            {
              label: 'Por Cobrar',
              valor: 'Próximamente'
            },
            {
              label: 'Cuentas Vencidas',
              valor: 'Próximamente'
            }
          ]}
          onVerInforme={() => onNavigate('informe-cobranza')}
        />

        {/* Dashboard de Producción */}
        <DashboardCard
          titulo="Producción"
          descripcion="Control de producción diaria"
          icono="🏭"
          color="cyan"
          kpis={[
            {
              label: 'Litros Producidos',
              valor: 'Próximamente'
            },
            {
              label: 'Bidones Llenados',
              valor: 'Próximamente'
            }
          ]}
          onVerInforme={() => onNavigate('informe-produccion')}
        />
      </div>
    </div>
  );
};

export default CentroInformes;
