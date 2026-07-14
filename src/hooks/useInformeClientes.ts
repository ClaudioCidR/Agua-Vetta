import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ClienteInfo, FiltrosInforme, KPIClientes } from '../types/informes';

export const useInformeClientes = () => {
  const [clientes, setClientes] = useState<ClienteInfo[]>([]);
  const [kpis, setKpis] = useState<KPIClientes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener información detallada de clientes con estadísticas
  const fetchClientesInfo = useCallback(async (filtros?: FiltrosInforme) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true });

      if (filtros?.tipoCliente) {
        query = query.eq('tipo_cliente', filtros.tipoCliente);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enriquecer con estadísticas de ventas
      const clientesEnriquecidos = await Promise.all(
        (data || []).map(async (cliente) => {
          const { data: ventas } = await supabase
            .from('ventas')
            .select('id_ventas, fecha')
            .eq('id_cliente', cliente.id_cliente)
            .order('fecha', { ascending: false });

          // Calcular total de compras
          let totalCompras = 0;
          if (ventas && ventas.length > 0) {
            for (const venta of ventas) {
              const { data: detalle } = await supabase
                .from('venta_det')
                .select('cantidad, precio_unitario')
                .eq('id_ventas', venta.id_ventas);

              totalCompras += (detalle || []).reduce(
                (acc, d) => acc + (d.cantidad * d.precio_unitario),
                0
              );
            }
          }

          return {
            ...cliente,
            total_compras: totalCompras,
            cantidad_ventas: ventas?.length || 0,
            ultima_compra: ventas && ventas.length > 0 ? ventas[0].fecha : undefined
          };
        })
      );

      setClientes(clientesEnriquecidos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular KPIs de clientes
  const calcularKPIs = useCallback(async (filtros?: FiltrosInforme) => {
    setLoading(true);
    setError(null);

    try {
      const { data: todosClientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*');

      if (clientesError) throw clientesError;

      // Clientes activos (con compras en el período)
      let fechaInicio = filtros?.fechaInicio;
      if (!fechaInicio) {
        // Por defecto, últimos 30 días
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - 30);
        fechaInicio = fecha.toISOString().split('T')[0];
      }

      const { data: ventasRecientes } = await supabase
        .from('ventas')
        .select('id_cliente')
        .gte('fecha', fechaInicio);

      const clientesActivos = new Set(
        (ventasRecientes || []).map(v => v.id_cliente)
      ).size;

      // Clientes nuevos (creados en el período)
      const { data: clientesNuevos } = await supabase
        .from('clientes')
        .select('id_cliente')
        .gte('created_at', fechaInicio);

      const kpisCalculados: KPIClientes = {
        totalClientes: todosClientes?.length || 0,
        clientesActivos,
        clientesNuevos: clientesNuevos?.length || 0,
        clientesDistribuidores: todosClientes?.filter(c => c.tipo_cliente === 'DISTRIBUIDOR').length || 0,
        clientesHogar: todosClientes?.filter(c => c.tipo_cliente === 'HOGAR').length || 0,
      };

      setKpis(kpisCalculados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clientes,
    kpis,
    loading,
    error,
    fetchClientesInfo,
    calcularKPIs
  };
};
