import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Producto {
  id_producto: string;
  producto: string;
  precio: number;
}

export interface Cliente {
  id_cliente: string;
  rut: string;
  nombre: string;
  tipo_cliente: string;
}

export interface LineaDetalle {
  producto: Producto;
  cantidad: number;
}

export const usePlantaVentas = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar catálogo de productos al iniciar
  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) setError(error.message);
      else setProductos(data || []);
    };
    fetchProductos();
  }, []);

  // 2. Buscar cliente distribuidor por RUT
  const buscarClientePorRut = async (rut: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('rut', rut)
      .eq('tipo_cliente', 'DISTRIBUIDOR')
      .maybeSingle();

    if (error) setError(error.message);
    else if (!data) setError('Cliente no encontrado o no es Distribuidor');
    else setCliente(data);
    setLoading(false);
  };

  // 3. Guardar la venta (Cabecera + Detalle)
  const guardarVentaPlanta = async (
    idCliente: string,
    tipoDoc: 'BOLETA' | 'FACTURA' | 'FACT.PENDIENTE',
    nDoc: number | null,
    formaPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA',
    detalles: LineaDetalle[],
    notas: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // A. Insertar la cabecera de la venta
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert({
          id_cliente: idCliente,
          canal_venta: 'PLANTA',
          tip_documento: tipoDoc,
          n_documento: nDoc,
          forma_pago: formaPago,
          estado: 'PAGADO', // En planta la venta se asume pagada de inmediato
          notas: notas
        })
        .select()
        .single();

      if (ventaError) throw new Error(ventaError.message);

      // B. Preparar las líneas del detalle
      const lineasInsertar = detalles.map((d) => ({
        id_ventas: ventaData.id_ventas,
        id_producto: d.producto.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.producto.precio
      }));

      // C. Insertar el detalle completo
      const { error: detalleError } = await supabase
        .from('venta_det')
        .insert(lineasInsertar);

      if (detalleError) throw new Error(detalleError.message);

      setLoading(false);
      return true; // Venta exitosa
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  return {
    productos,
    cliente,
    setCliente,
    buscarClientePorRut,
    guardarVentaPlanta,
    loading,
    error,
    setError
  };
};