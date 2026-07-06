import { useState } from 'react';
import type { FormEvent } from 'react';
import { useClientes } from '../hooks/useClientes';
import type { Cliente } from '../hooks/useClientes';

const TIPOS_CLIENTE = ['DISTRIBUIDOR', 'HOGAR'] as const;

export default function ClientesMaintainer() {
  const { clientes, loading, error, crearCliente, actualizarCliente, eliminarCliente } = useClientes();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipoCliente, setTipoCliente] = useState<(typeof TIPOS_CLIENTE)[number]>('DISTRIBUIDOR');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setRut('');
    setNombre('');
    setTipoCliente('DISTRIBUIDOR');
    setTelefono('');
    setDireccion('');
    setComuna('');
  };

  const iniciarEdicion = (c: Cliente) => {
    setMensaje(null);
    setEditandoId(c.id_cliente);
    setRut(c.rut);
    setNombre(c.nombre);
    setTipoCliente((TIPOS_CLIENTE as readonly string[]).includes(c.tipo_cliente)
      ? (c.tipo_cliente as (typeof TIPOS_CLIENTE)[number])
      : 'DISTRIBUIDOR');
    setTelefono(c.telefono || '');
    setDireccion(c.direccion_despacho || '');
    setComuna(c.comuna || '');
  };

  const handleEliminar = async (c: Cliente) => {
    setMensaje(null);
    if (!window.confirm(`¿Eliminar al cliente "${c.nombre}"? Esta acción no se puede deshacer.`)) return;

    const exito = await eliminarCliente(c.id_cliente);
    if (exito) {
      setMensaje('✓ Cliente eliminado correctamente');
      if (editandoId === c.id_cliente) limpiarFormulario();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje(null);

    if (!rut.trim() || !nombre.trim()) return;

    const datos = {
      rut: rut.trim(),
      nombre: nombre.trim(),
      tipo_cliente: tipoCliente,
      telefono: telefono.trim() || null,
      direccion_despacho: direccion.trim() || null,
      comuna: comuna.trim() || null
    };

    const exito = editandoId
      ? await actualizarCliente(editandoId, datos)
      : await crearCliente(datos);

    if (exito) {
      setMensaje(editandoId ? '✓ Cliente actualizado correctamente' : '✓ Cliente guardado correctamente en la base de datos');
      limpiarFormulario();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORMULARIO NUEVO / EDITAR CLIENTE */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 lg:col-span-1">
        <h2 className="text-lg font-bold text-gray-700">{editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>


        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">⚠️ {error}</div>
        )}
        {mensaje && (
          <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">{mensaje}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">RUT *</label>
          <input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="Ej: 12345678-9"
            className="w-full border p-2 rounded-lg bg-gray-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre o razón social"
            className="w-full border p-2 rounded-lg bg-gray-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Tipo Cliente</label>
          <select
            value={tipoCliente}
            onChange={(e) => setTipoCliente(e.target.value as (typeof TIPOS_CLIENTE)[number])}
            className="w-full border p-2 rounded-lg bg-gray-50"
          >
            {TIPOS_CLIENTE.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border p-2 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Dirección de Despacho</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full border p-2 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Comuna</label>
          <input
            type="text"
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className="w-full border p-2 rounded-lg bg-gray-50"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg shadow transition"
          >
            {loading ? 'Guardando...' : editandoId ? 'Actualizar Cliente' : 'Guardar Cliente'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="px-4 py-2 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* LISTADO DE CLIENTES (para confirmar que se guardó en la BD) */}
      <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
        <h2 className="text-lg font-bold text-gray-700 mb-3">Clientes Registrados ({clientes.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                <th className="p-3">RUT</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Comuna</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400 italic">
                    {loading ? 'Cargando...' : 'No hay clientes registrados.'}
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr
                    key={c.id_cliente}
                    className={`border-b hover:bg-gray-50 text-gray-800 ${editandoId === c.id_cliente ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-3">{c.rut}</td>
                    <td className="p-3 font-medium">{c.nombre}</td>
                    <td className="p-3">{c.tipo_cliente}</td>
                    <td className="p-3">{c.telefono || '-'}</td>
                    <td className="p-3">{c.comuna || '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(c)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(c)}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
