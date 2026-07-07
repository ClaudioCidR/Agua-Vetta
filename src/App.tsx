import React, { useState, useRef } from 'react';
import { usePlantaVentas, type LineaDetalle } from './hooks/usePlantaVentas';
import { useProductos } from './hooks/useProductos';
import { useClientes } from './hooks/useClientes';
import ClientesMaintainer from './components/ClientesMaintainer';
import ProductosMaintainer from './components/ProductosMaintainer';

export default function App() {
  const { productos, fetchProductos } = useProductos();
  const { clientes, fetchClientes } = useClientes();
  const {
    cliente,
    setCliente,
    guardarVentaPlanta,
    loading,
    error,
    setError
  } = usePlantaVentas();

  // Vista activa: ventas de planta, mantenedor de clientes o mantenedor de productos
  const [vista, setVista] = useState<'ventas' | 'clientes' | 'productos'>('ventas');

  // Callback cuando se crea un cliente exitosamente
  const handleClienteCreado = async () => {
    // Refrescar la lista de clientes
    await fetchClientes();
    // Esperar un momento para que el usuario vea el mensaje de éxito
    setTimeout(() => {
      setVista('ventas');
    }, 1500);
  };

  // Callback cuando se crea un producto exitosamente
  const handleProductoCreado = async () => {
    // Refrescar la lista de productos
    await fetchProductos();
  };

  // Estados del Formulario
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const inputClienteRef = useRef<HTMLInputElement>(null);

  const sugerenciasFiltradas = busquedaCliente.trim().length > 0
    ? clientes.filter(c =>
        c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.rut.toLowerCase().includes(busquedaCliente.toLowerCase())
      ).slice(0, 8)
    : clientes.slice(0, 8);
  const [tipoDoc, setTipoDoc] = useState<'BOLETA' | 'FACTURA' | 'FACT.PENDIENTE' | null>(null);
  const [nDoc, setNDoc] = useState<string>('');
  const [formaPago, setFormaPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | null>(null);
  const [notas, setNotas] = useState('');
  
  // Estado del Carrito / Detalle de venta
  const [carrito, setCarrito] = useState<LineaDetalle[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [cantidadInput, setCantidadInput] = useState<string>('1');

  // Agregar producto al detalle
  const agregarAlCarrito = () => {
    const prod = productos.find(p => p.id_producto === productoSeleccionado);
    if (!prod) return;

    const cantidad = parseInt(cantidadInput) || 1;
    const existe = carrito.find(item => item.producto.id_producto === prod.id_producto);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.producto.id_producto === prod.id_producto 
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, { producto: prod, cantidad }]);
    }
    setProductoSeleccionado('');
    setCantidadInput('1');
  };

  // Eliminar producto del detalle
  const eliminarDelCarrito = (idProducto: string) => {
    setCarrito(carrito.filter(item => item.producto.id_producto !== idProducto));
  };

  // Actualizar cantidad de un producto en el detalle
  const actualizarCantidad = (idProducto: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    setCarrito(carrito.map(item => 
      item.producto.id_producto === idProducto 
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  // Calcular el total Neto/Bruto estimado de la orden en tiempo real
  const calcularTotal = () => {
    const total = carrito.reduce((acc, item) => acc + (item.producto.precio || 0) * item.cantidad, 0);
    return total.toLocaleString('es-CL');
  };

  // Enviar formulario a Supabase
  const handleFinalizarVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;
    if (carrito.length === 0) {
      setError('Debes agregar al menos un producto al detalle');
      return;
    }
    if (!tipoDoc) {
      setError('Debes seleccionar un tipo de documento');
      return;
    }
    if (!formaPago) {
      setError('Debes seleccionar una forma de pago');
      return;
    }

    const exito = await guardarVentaPlanta(
      cliente.id_cliente,
      tipoDoc,
      nDoc ? parseInt(nDoc) : null,
      formaPago,
      carrito,
      notas
    );

    if (exito) {
      alert('¡Venta registrada con éxito en Planta!');
      // Limpiar Formulario
      setCliente(null);
      setBusquedaCliente('');
      setTipoDoc(null);
      setNDoc('');
      setFormaPago(null);
      setCarrito([]);
      setNotas('');
      setCantidadInput('1');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <header className="mb-6 bg-blue-600 text-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold">Agua Vetta 2.0 - Módulo Planta</h1>
        <p className="text-sm opacity-90">Registro rápido de ventas para Distribuidores</p>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setVista('ventas')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              vista === 'ventas' ? 'bg-white text-blue-700' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Ventas Planta
          </button>
          <button
            type="button"
            onClick={() => setVista('clientes')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              vista === 'clientes' ? 'bg-white text-blue-700' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Mantenedor Clientes
          </button>
          <button
            type="button"
            onClick={() => setVista('productos')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              vista === 'productos' ? 'bg-white text-blue-700' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            Mantenedor Productos
          </button>
        </div>
      </header>

      {vista === 'clientes' ? (
        <ClientesMaintainer onClienteCreado={handleClienteCreado} />
      ) : vista === 'productos' ? (
        <ProductosMaintainer onProductoCreado={handleProductoCreado} />
      ) : (
        <>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm font-semibold">
          ⚠️ Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: CLIENTE Y DOCUMENTO */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6 lg:col-span-1">
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">1. Identificar Distribuidor</h2>
            <div className="relative">
              <input
                ref={inputClienteRef}
                type="text"
                placeholder="Buscar por nombre o RUT..."
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setCliente(null);
                  setMostrarSugerencias(true);
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-blue-500"
                autoComplete="off"
              />
              {mostrarSugerencias && sugerenciasFiltradas.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {sugerenciasFiltradas.map((c) => (
                    <li
                      key={c.id_cliente}
                      onMouseDown={() => {
                        setCliente(c);
                        setBusquedaCliente(c.nombre);
                        setMostrarSugerencias(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                    >
                      <span className="font-semibold">{c.nombre}</span>
                      <span className="ml-2 text-gray-400 text-xs">{c.rut}</span>
                      <span className="ml-2 text-xs text-blue-500">{c.tipo_cliente}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cliente && (
              <div className="mt-3 p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
                <p className="font-bold">✓ {cliente.nombre}</p>
                <p className="text-xs opacity-80">RUT: {cliente.rut} · {cliente.tipo_cliente}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-bold text-gray-700 mb-3">2. Datos de Facturación</h2>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo Documento</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['BOLETA', 'FACTURA', 'FACT.PENDIENTE'] as const).map((td) => (
                <button
                  key={td}
                  type="button"
                  onClick={() => setTipoDoc(td)}
                  className={`p-2 text-xs font-bold rounded-lg border text-center transition ${
                    tipoDoc === td ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {td}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-600 mb-1">N° Documento (Físico)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej: 45210"
              value={nDoc}
              onChange={(e) => {
                // Solo permitir números
                const valor = e.target.value.replace(/[^0-9]/g, '');
                setNDoc(valor);
              }}
              className="w-full border p-2 rounded-lg bg-gray-50 mb-3"
            />

            <label className="block text-sm font-medium text-gray-600 mb-1">Forma de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] as const).map((fp) => (
                <button
                  key={fp}
                  type="button"
                  onClick={() => setFormaPago(fp)}
                  className={`p-2 text-xs font-bold rounded-lg border text-center transition ${
                    formaPago === fp ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {fp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: CARRITO Y DETALLE (MAESTRO-DETALLE) */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">3. Detalle de Carga (Productos)</h2>
            <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Producto</label>
                <select
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  className="w-full border-2 p-3 rounded-lg bg-white text-base font-medium focus:outline-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Elegir Producto --</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.producto} - ${p.precio?.toLocaleString('es-CL') || 0}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <div className="flex gap-2 items-center">
                  {/* Botón decrementar */}
                  <button
                    type="button"
                    onClick={() => {
                      const actual = parseInt(cantidadInput) || 1;
                      setCantidadInput(String(Math.max(1, actual - 1)));
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-12 h-12 rounded-lg text-2xl transition flex items-center justify-center"
                  >
                    −
                  </button>
                  
                  {/* Input cantidad */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={cantidadInput}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/[^0-9]/g, '');
                      setCantidadInput(valor);
                    }}
                    onBlur={() => {
                      // Si está vacío o es 0, establecer a 1
                      if (!cantidadInput || parseInt(cantidadInput) === 0) {
                        setCantidadInput('1');
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-24 border-2 p-3 rounded-lg bg-white text-center text-2xl font-bold focus:outline-blue-500 focus:border-blue-500"
                  />
                  
                  {/* Botón incrementar */}
                  <button
                    type="button"
                    onClick={() => {
                      const actual = parseInt(cantidadInput) || 1;
                      setCantidadInput(String(actual + 1));
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-12 h-12 rounded-lg text-2xl transition flex items-center justify-center"
                  >
                    +
                  </button>
                  
                  {/* Botones de cantidades rápidas */}
                  <div className="flex gap-1 ml-2 flex-wrap">
                    {[5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCantidadInput(String(num))}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm transition"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón agregar al carrito */}
              <button
                type="button"
                onClick={agregarAlCarrito}
                disabled={!productoSeleccionado}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-md transition text-lg"
              >
                ✓ Agregar al Detalle
              </button>
            </div>

            {/* TABLA DE DETALLES */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                    <th className="p-3">Producto</th>
                    <th className="p-3 text-center">Cantidad</th>
                    <th className="p-3 text-right">P. Unitario</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                        No hay productos en el detalle de esta venta.
                      </td>
                    </tr>
                  ) : (
                    carrito.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 text-gray-800">
                        <td className="p-3 font-medium">{item.producto.producto}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(item.producto.id_producto, item.cantidad - 1)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-7 h-7 rounded text-lg transition"
                            >
                              −
                            </button>
                            <span className="font-bold text-lg w-12 text-center">{item.cantidad}</span>
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(item.producto.id_producto, item.cantidad + 1)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-7 h-7 rounded text-lg transition"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">${item.producto.precio?.toLocaleString('es-CL') || 0}</td>
                        <td className="p-3 text-right font-semibold">${((item.producto.precio || 0) * item.cantidad).toLocaleString('es-CL')}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarDelCarrito(item.producto.id_producto)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1 rounded-lg text-xs transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL Y CONFIRMACIÓN */}
          <div className="border-t pt-4 mt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Notas Internas</label>
              <textarea
                placeholder="Observaciones de la carga o el pago..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full border p-2 rounded-lg bg-gray-50 text-sm h-16 resize-none"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="text-center md:text-left">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total a Cobrar</p>
                <p className="text-3xl font-extrabold text-gray-900">${calcularTotal()}</p>
              </div>
              <button
                type="button"
                onClick={handleFinalizarVenta}
                disabled={loading || !cliente || carrito.length === 0}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition"
              >
                {loading ? 'Procesando Venta...' : '✓ Finalizar y Despachar'}
              </button>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}