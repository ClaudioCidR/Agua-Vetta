import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Cliente {
  id_cliente: string;
  rut: string;
  nombre: string;
  tipo_cliente: string;
  telefono: string | null;
  direccion_despacho: string | null;
  comuna: string | null;
}

export type NuevoCliente = Omit<Cliente, 'id_cliente'>;

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) setError(error.message);
    else setClientes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Crear un nuevo cliente y confirmar que quedó guardado en la base de datos
  const crearCliente = async (nuevo: NuevoCliente) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('clientes')
      .insert(nuevo)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    setClientes((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setLoading(false);
    return true;
  };

  // Actualizar un cliente existente
  const actualizarCliente = async (idCliente: string, cambios: NuevoCliente) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('clientes')
      .update(cambios)
      .eq('id_cliente', idCliente)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    setClientes((prev) =>
      prev
        .map((c) => (c.id_cliente === idCliente ? data : c))
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    setLoading(false);
    return true;
  };

  // Eliminar un cliente
  const eliminarCliente = async (idCliente: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id_cliente', idCliente);

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    setClientes((prev) => prev.filter((c) => c.id_cliente !== idCliente));
    setLoading(false);
    return true;
  };

  return {
    clientes,
    loading,
    error,
    setError,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
  };
};
