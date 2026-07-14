import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ProductoInfo, FiltrosInforme } from '../types/informes';

export const useInformeProductos = () => {
  const [productos, setProductos] = useState<ProductoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener información detallada de productos con estadísticas
  const fetchProductosInfo = useCallback(async (filtros?: FiltrosInforme) => {
    setLoading(true);
    setError(null);

    try {
      const { data: todosProductos, error: prodError } = await supabase
        .from('productos')
        .select('*')
        .order('producto', { ascending: true });

      if (prodError) throw prodError;

      // Enriquecer con estadísticas de ventas
      const productosEnriquecidos = await Promise.all(
        (todosProductos || []).map(async (producto) => {
          let query = supabase
            .from('venta_det')
            .select('cantidad, precio_unitario, ventas(fecha)')
            .eq('id_producto', producto.id_producto);

          // Aplicar filtro de fechas si existe
          if (filtros?.fechaInicio || filtros?.fechaFin) {
            const { data: ventasIds } = await supabase
              .from('ventas')
              .select('id_ventas')
              .gte('fecha', filtros.fechaInicio || '1900-01-01')
              .lte('fecha', filtros.fechaFin || '2100-12-31');

            const ids = (ventasIds || []).map(v => v.id_ventas);
            query = query.in('id_ventas', ids);
          }

          const { data: ventas } = await query;

          const totalVendido = (ventas || []).reduce((acc, v) => acc + v.cantidad, 0);
          const ingresosGenerados = (ventas || []).reduce(
            (acc, v) => acc + (v.cantidad * v.precio_unitario),
            0
          );

          return {
            ...producto,
            total_vendido: totalVendido,
            cantidad_ventas: ventas?.length || 0,
            ingresos_generados: ingresosGenerados
          };
        })
      );

      setProductos(productosEnriquecidos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    productos,
    loading,
    error,
    fetchProductosInfo
  };
};
