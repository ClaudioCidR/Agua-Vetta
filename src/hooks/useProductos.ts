import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Producto {
  id_producto: string;
  producto: string;
  precio: number;
}

export type NuevoProducto = Omit<Producto, 'id_producto'>;

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('producto', { ascending: true });

    if (error) setError(error.message);
    else setProductos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const crearProducto = async (nuevo: NuevoProducto) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('productos')
      .insert(nuevo)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    setProductos((prev) => [...prev, data].sort((a, b) => a.producto.localeCompare(b.producto)));
    setLoading(false);
    return true;
  };

  const actualizarProducto = async (idProducto: string, cambios: NuevoProducto) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id_producto', idProducto)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    setProductos((prev) =>
      prev
        .map((p) => (p.id_producto === idProducto ? data : p))
        .sort((a, b) => a.producto.localeCompare(b.producto))
    );
    setLoading(false);
    return true;
  };

  const eliminarProducto = async (idProducto: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id_producto', idProducto);

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    setProductos((prev) => prev.filter((p) => p.id_producto !== idProducto));
    setLoading(false);
    return true;
  };

  return { productos, loading, error, setError, fetchProductos, crearProducto, actualizarProducto, eliminarProducto };
};
