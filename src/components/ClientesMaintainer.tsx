import { useState } from 'react';
import type { FormEvent } from 'react';
import { useClientes } from '../hooks/useClientes';
import type { Cliente } from '../hooks/useClientes';
import { validarRut, formatearRut, limpiarRut } from '../lib/validadorRut';
import { validarTelefono, formatearTelefono, limpiarTelefono } from '../lib/validadorTelefono';

const TIPOS_CLIENTE = ['DISTRIBUIDOR', 'HOGAR'] as const;

interface ClientesMaintainerProps {
  onClienteCreado?: () => void;
}

export default function ClientesMaintainer({ onClienteCreado }: ClientesMaintainerProps) {
  const { clientes, loading, error, crearCliente, actualizarCliente, eliminarCliente } = useClientes();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rut, setRut] = useState('');
  const [rutValido, setRutValido] = useState<boolean | null>(null);
  const [nombre, setNombre] = useState('');
  const [tipoCliente, setTipoCliente] = useState<(typeof TIPOS_CLIENTE)[number]>('DISTRIBUIDOR');
  const [telefono, setTelefono] = useState('');
  const [telefonoValido, setTelefonoValido] = useState<boolean | null>(null);
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Sanitizar número de teléfono para WhatsApp (agregar código de país +56)
  const sanitizarParaWhatsApp = (tel: string | null): string | null => {
    if (!tel) return null;
    const telLimpio = limpiarTelefono(tel);
    if (telLimpio.length < 8) return null;
    // Si es un número chileno de 9 dígitos, agregar +56
    if (telLimpio.length === 9) {
      return `56${telLimpio}`;
    }
    return telLimpio;
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setRut('');
    setRutValido(null);
    setNombre('');
    setTipoCliente('DISTRIBUIDOR');
    setTelefono('');
    setTelefonoValido(null);
    setDireccion('');
    setComuna('');
  };

  const handleRutChange = (valor: string) => {
    // Permitir solo números, puntos, guiones y K
    const valorLimpio = valor.replace(/[^0-9kK.-]/g, '');
    setRut(valorLimpio);

    // Validar el RUT solo si tiene contenido
    if (valorLimpio.trim().length > 0) {
      const esValido = validarRut(valorLimpio);
      setRutValido(esValido);
    } else {
      setRutValido(null);
    }
  };

  const handleRutBlur = () => {
    // Formatear el RUT al perder el foco, solo si es válido
    if (rut.trim().length > 0 && rutValido) {
      setRut(formatearRut(rut));
    }
  };

  const handleTelefonoChange = (valor: string) => {
    // Permitir solo números y espacios
    const valorLimpio = valor.replace(/[^0-9\s]/g, '');
    
    // Limitar a 9 dígitos (sin contar espacios)
    const soloNumeros = valorLimpio.replace(/\s/g, '');
    if (soloNumeros.length > 9) return;
    
    setTelefono(valorLimpio);

    // Validar el teléfono
    const esValido = validarTelefono(valorLimpio);
    setTelefonoValido(valorLimpio.trim().length === 0 ? null : esValido);
  };

  const handleTelefonoBlur = () => {
    // Formatear el teléfono al perder el foco, solo si tiene contenido
    if (telefono.trim().length > 0) {
      const telefonoFormateado = formatearTelefono(telefono);
      setTelefono(telefonoFormateado);
      setTelefonoValido(validarTelefono(telefonoFormateado));
    }
  };

  const iniciarEdicion = (c: Cliente) => {
    setMensaje(null);
    setEditandoId(c.id_cliente);
    setRut(c.rut);
    setRutValido(validarRut(c.rut));
    setNombre(c.nombre);
    setTipoCliente((TIPOS_CLIENTE as readonly string[]).includes(c.tipo_cliente)
      ? (c.tipo_cliente as (typeof TIPOS_CLIENTE)[number])
      : 'DISTRIBUIDOR');
    const tel = c.telefono || '';
    setTelefono(tel);
    setTelefonoValido(tel.length > 0 ? validarTelefono(tel) : null);
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

    // Validar que el RUT sea válido antes de guardar
    if (!rutValido) {
      setMensaje('⚠️ El RUT ingresado no es válido');
      return;
    }

    // Validar que el teléfono sea válido si fue ingresado
    if (telefono.trim().length > 0 && !telefonoValido) {
      setMensaje('⚠️ El teléfono ingresado no es válido. Debe tener 8-9 dígitos.');
      return;
    }

    const datos = {
      rut: limpiarRut(rut), // Guardar el RUT sin formato (solo números y DV)
      nombre: nombre.trim(),
      tipo_cliente: tipoCliente,
      telefono: telefono.trim().length > 0 ? limpiarTelefono(telefono) : null,
      direccion_despacho: direccion.trim() || null,
      comuna: comuna.trim() || null
    };

    const exito = editandoId
      ? await actualizarCliente(editandoId, datos)
      : await crearCliente(datos);

    if (exito) {
      const esNuevo = !editandoId;
      setMensaje(editandoId ? '✓ Cliente actualizado correctamente' : '✓ Cliente guardado correctamente. Redirigiendo a ventas...');
      limpiarFormulario();
      
      // Si es un nuevo cliente, llamar al callback para cambiar a la vista de ventas
      if (esNuevo && onClienteCreado) {
        onClienteCreado();
      }
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
          <div className="relative">
            <input
              type="text"
              value={rut}
              onChange={(e) => handleRutChange(e.target.value)}
              onBlur={handleRutBlur}
              placeholder="Ej: 12.345.678-9"
              className={`w-full border p-2 rounded-lg bg-gray-50 pr-10 transition ${
                rutValido === true 
                  ? 'border-green-500 focus:outline-green-500' 
                  : rutValido === false 
                  ? 'border-red-500 focus:outline-red-500' 
                  : 'focus:outline-blue-500'
              }`}
              required
            />
            {rutValido === true && (
              <span className="absolute right-3 top-2.5 text-green-600 font-bold">✓</span>
            )}
            {rutValido === false && (
              <span className="absolute right-3 top-2.5 text-red-600 font-bold">✗</span>
            )}
          </div>
          {rutValido === false && (
            <p className="text-xs text-red-600 mt-1">RUT inválido. Verifica el formato y dígito verificador.</p>
          )}
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
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={telefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              onBlur={handleTelefonoBlur}
              placeholder="Ej: 9 8765 4321"
              className={`w-full border p-2 rounded-lg bg-gray-50 pr-10 transition ${
                telefonoValido === true 
                  ? 'border-green-500 focus:outline-green-500' 
                  : telefonoValido === false 
                  ? 'border-red-500 focus:outline-red-500' 
                  : 'focus:outline-blue-500'
              }`}
            />
            {telefonoValido === true && (
              <span className="absolute right-3 top-2.5 text-green-600 font-bold">✓</span>
            )}
            {telefonoValido === false && (
              <span className="absolute right-3 top-2.5 text-red-600 font-bold">✗</span>
            )}
          </div>
          {telefonoValido === false && (
            <p className="text-xs text-red-600 mt-1">Teléfono inválido. Debe tener 8-9 dígitos. Móviles comienzan con 9.</p>
          )}
          {telefonoValido === null && telefono.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">Móvil: 9 XXXX XXXX · Fijo: 2 XXXX XXXX</p>
          )}
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
            disabled={loading || rutValido !== true}
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
                    <td className="p-3">
                      {c.telefono ? (
                        <div className="flex items-center gap-2">
                          <span>{c.telefono}</span>
                          <div className="flex gap-1">
                            {/* Botón WhatsApp */}
                            {sanitizarParaWhatsApp(c.telefono) && (
                              <a
                                href={`https://wa.me/${sanitizarParaWhatsApp(c.telefono)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-green-100 hover:bg-green-200 text-green-700 transition"
                                aria-label={`Enviar WhatsApp a ${c.nombre}`}
                                title="Enviar WhatsApp"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </a>
                            )}
                            {/* Botón Llamada */}
                            {c.telefono && (
                              <a
                                href={`tel:${limpiarTelefono(c.telefono)}`}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                                aria-label={`Llamar a ${c.nombre}`}
                                title="Llamar"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
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
