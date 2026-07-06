import { useState } from 'react';
import type { FormEvent } from 'react';
import { useProductos } from '../hooks/useProductos';
import type { Producto } from '../hooks/useProductos';

export default function ProductosMaintainer() {
  const { productos, loading, error, crearProducto, actualizarProducto, eliminarProducto } = useProductos();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre('');
    setPrecio('');
  };

  const iniciarEdicion = (p: Producto) => {
    setMensaje(null);
    setEditandoId(p.id_producto);
    setNombre(p.producto);
    setPrecio(String(p.precio));
  };

  const handleEliminar = async (p: Producto) => {
    setMensaje(null);
    if (!window.confirm(`¿Eliminar el producto "${p.producto}"? Esta acción no se puede deshacer.`)) return;

    const exito = await eliminarProducto(p.id_producto);
    if (exito) {
      setMensaje('✓ Producto eliminado correctamente');
      if (editandoId === p.id_producto) limpiarFormulario();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje(null);

    if (!nombre.trim()) return;

    const datos = {
      producto: nombre.trim(),
      precio: parseFloat(precio) || 0,
    };

    const exito = editandoId
      ? await actualizarProducto(editandoId, datos)
      : await crearProducto(datos);

    if (exito) {
      setMensaje(editandoId ? '✓ Producto actualizado correctamente' : '✓ Producto guardado correctamente');
      limpiarFormulario();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 lg:col-span-1">
        <h2 className="text-lg font-bold text-gray-700">{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">⚠️ {error}</div>
        )}
        {mensaje && (
          <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">{mensaje}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del Producto *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Bidón 20L"
            className="w-full border p-2 rounded-lg bg-gray-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Precio ($)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className="w-full border p-2 rounded-lg bg-gray-50"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg shadow transition"
          >
            {loading ? 'Guardando...' : editandoId ? 'Actualizar Producto' : 'Guardar Producto'}
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

      {/* LISTADO */}
      <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
        <h2 className="text-lg font-bold text-gray-700 mb-3">Productos Registrados ({productos.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                <th className="p-3">Producto</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400 italic">
                    {loading ? 'Cargando...' : 'No hay productos registrados.'}
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr
                    key={p.id_producto}
                    className={`border-t text-sm transition ${editandoId === p.id_producto ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="p-3 font-medium">{p.producto}</td>
                    <td className="p-3 text-right text-gray-700">
                      ${p.precio.toLocaleString('es-CL')}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => iniciarEdicion(p)}
                          className="text-xs px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(p)}
                          className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
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
