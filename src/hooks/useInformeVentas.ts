import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  VentaCabecera,
  DetalleVenta,
  VentaCompleta,
  FiltrosInforme,
  KPIVentas
} from '../types/informes';

export const useInformeVentas = () => {
  const [ventas, setVentas] = useState<VentaCabecera[]>([]);
  const [ventaDetalle, setVentaDetalle] = useState<VentaCompleta | null>(null);
  const [kpis, setKpis] = useState<KPIVentas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista de ventas con filtros
  const fetchVentas = useCallback(async (filtros?: FiltrosInforme) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('ventas')
        .select(`
          *,
          clientes (
            nombre,
            rut
          )
        `)
        .order('fecha', { ascending: false });

      // Aplicar filtros
      if (filtros?.fechaInicio) {
        query = query.gte('fecha', filtros.fechaInicio);
      }
      if (filtros?.fechaFin) {
        query = query.lte('fecha', filtros.fechaFin);
      }
      if (filtros?.idCliente) {
        query = query.eq('id_cliente', filtros.idCliente);
      }
      if (filtros?.tipoDocumento) {
        query = query.eq('tip_documento', filtros.tipoDocumento);
      }
      if (filtros?.formaPago) {
        query = query.eq('forma_pago', filtros.formaPago);
      }
      if (filtros?.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros?.canal) {
        query = query.eq('canal_venta', filtros.canal);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear datos con nombre del cliente
      const ventasFormateadas: VentaCabecera[] = (data || []).map((v: any) => ({
        id_ventas: v.id_ventas,
        fecha: v.fecha,
        id_cliente: v.id_cliente,
        nombre_cliente: v.clientes?.nombre,
        nombre_distribuidor: v.clientes?.nombre,
        tip_documento: v.tip_documento,
        n_documento: v.n_documento,
        forma_pago: v.forma_pago,
        fecha_pago: v.fecha_pago,
        estado: v.estado,
        canal_venta: v.canal_venta,
        notas: v.notas,
        valor_total: 0 // Se calculará con el detalle
      }));

      // Calcular valor total de cada venta
      for (const venta of ventasFormateadas) {
        const { data: detalle } = await supabase
          .from('venta_det')
          .select('cantidad, precio_unitario')
          .eq('id_ventas', venta.id_ventas);

        venta.valor_total = (detalle || []).reduce(
          (acc, d) => acc + (d.cantidad * d.precio_unitario),
          0
        );
      }

      setVentas(ventasFormateadas);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener detalle completo de una venta específica
  const fetchVentaDetalle = useCallback(async (idVenta: string) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener cabecera
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .select(`
          *,
          clientes (
            nombre,
            rut
          )
        `)
        .eq('id_ventas', idVenta)
        .single();

      if (ventaError) throw ventaError;

      // Obtener detalle
      const { data: detalleData, error: detalleError } = await supabase
        .from('venta_det')
        .select(`
          *,
          productos (
            producto
          )
        `)
        .eq('id_ventas', idVenta);

      if (detalleError) throw detalleError;

      // Formatear detalle
      const detalleFormateado: DetalleVenta[] = (detalleData || []).map((d: any) => ({
        id_venta_det: d.id_venta_det,
        id_ventas: d.id_ventas,
        id_producto: d.id_producto,
        nombre_producto: d.productos?.producto || 'Producto desconocido',
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        total: d.cantidad * d.precio_unitario,
        fecha_venta: ventaData.fecha
      }));

      const ventaCompleta: VentaCompleta = {
        id_ventas: ventaData.id_ventas,
        fecha: ventaData.fecha,
        id_cliente: ventaData.id_cliente,
        nombre_cliente: ventaData.clientes?.nombre,
        nombre_distribuidor: ventaData.clientes?.nombre,
        tip_documento: ventaData.tip_documento,
        n_documento: ventaData.n_documento,
        forma_pago: ventaData.forma_pago,
        fecha_pago: ventaData.fecha_pago,
        estado: ventaData.estado,
        canal_venta: ventaData.canal_venta,
        notas: ventaData.notas,
        valor_total: detalleFormateado.reduce((acc, d) => acc + d.total, 0),
        detalle: detalleFormateado
      };

      setVentaDetalle(ventaCompleta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular KPIs de ventas
  const calcularKPIs = useCallback(async (filtros?: FiltrosInforme) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('ventas').select('*');

      // Aplicar filtros
      if (filtros?.fechaInicio) {
        query = query.gte('fecha', filtros.fechaInicio);
      }
      if (filtros?.fechaFin) {
        query = query.lte('fecha', filtros.fechaFin);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calcular totales por cada venta
      const ventasConTotal = await Promise.all(
        (data || []).map(async (v) => {
          const { data: detalle } = await supabase
            .from('venta_det')
            .select('cantidad, precio_unitario')
            .eq('id_ventas', v.id_ventas);

          const total = (detalle || []).reduce(
            (acc, d) => acc + (d.cantidad * d.precio_unitario),
            0
          );

          return { ...v, total };
        })
      );

      const kpisCalculados: KPIVentas = {
        totalVentas: ventasConTotal.reduce((acc, v) => acc + v.total, 0),
        cantidadTransacciones: ventasConTotal.length,
        ticketPromedio: ventasConTotal.length > 0
          ? ventasConTotal.reduce((acc, v) => acc + v.total, 0) / ventasConTotal.length
          : 0,
        ventasEfectivo: ventasConTotal
          .filter(v => v.forma_pago === 'EFECTIVO')
          .reduce((acc, v) => acc + v.total, 0),
        ventasTarjeta: ventasConTotal
          .filter(v => v.forma_pago === 'TARJETA')
          .reduce((acc, v) => acc + v.total, 0),
        ventasTransferencia: ventasConTotal
          .filter(v => v.forma_pago === 'TRANSFERENCIA')
          .reduce((acc, v) => acc + v.total, 0),
      };

      setKpis(kpisCalculados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ventas,
    ventaDetalle,
    kpis,
    loading,
    error,
    fetchVentas,
    fetchVentaDetalle,
    calcularKPIs
  };
};
