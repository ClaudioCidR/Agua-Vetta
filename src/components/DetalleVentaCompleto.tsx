import React, { useEffect, useState } from 'react';
import { useInformeVentas } from '../hooks/useInformeVentas';
import {
  exportarVentaPDF,
  exportarVentaExcel
} from '../lib/exportacionInformes';

interface DetalleVentaProps {
  idVenta: string;
  onVolver: () => void;
}

const DetalleVentaCompleto: React.FC<DetalleVentaProps> = ({ idVenta, onVolver }) => {
  const { ventaDetalle, fetchVentaDetalle, loading, error } = useInformeVentas();
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    fetchVentaDetalle(idVenta);
  }, [idVenta, fetchVentaDetalle]);

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaConHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const handleExportarPDF = async () => {
    if (!ventaDetalle) return;
    setExportando(true);
    try {
      exportarVentaPDF(ventaDetalle);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('Error al exportar el PDF');
    } finally {
      setExportando(false);
    }
  };

  const handleExportarExcel = async () => {
    if (!ventaDetalle) return;
    setExportando(true);
    try {
      exportarVentaExcel(ventaDetalle);
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      alert('Error al exportar el Excel');
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalle de venta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar la venta</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={onVolver}
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!ventaDetalle) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">No se encontró la venta</p>
          <button
            onClick={onVolver}
            className="mt-4 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Barra de navegación y acciones */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Volver al listado
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleExportarPDF}
            disabled={exportando}
            className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📄 Exportar PDF
          </button>
          <button
            onClick={handleExportarExcel}
            disabled={exportando}
            className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* Card del informe */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Título del informe */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-3xl font-bold">INFORME DE VENTA</h1>
          <p className="text-blue-100 mt-1">ID: {ventaDetalle.id_ventas}</p>
        </div>

        {/* Encabezado - Datos de la venta */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Datos de la Venta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha</label>
              <p className="text-lg text-gray-900">{formatearFecha(ventaDetalle.fecha)}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Distribuidor</label>
              <p className="text-lg text-gray-900">{ventaDetalle.nombre_distribuidor || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Tipo de Documento</label>
              <p className="text-lg text-gray-900">{ventaDetalle.tip_documento}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">N° Documento</label>
              <p className="text-lg text-gray-900">{ventaDetalle.n_documento || 'Sin número'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Forma de Pago</label>
              <p className="text-lg text-gray-900">{ventaDetalle.forma_pago}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Pago</label>
              <p className="text-lg text-gray-900">
                {ventaDetalle.fecha_pago ? formatearFecha(ventaDetalle.fecha_pago) : 'Pendiente'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Estado de Pago</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                ventaDetalle.estado === 'PAGADO' 
                  ? 'bg-green-100 text-green-800'
                  : ventaDetalle.estado === 'PENDIENTE'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {ventaDetalle.estado}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Valor Total</label>
              <p className="text-2xl font-bold text-blue-600">
                {formatearMoneda(ventaDetalle.valor_total || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Detalle de la venta */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalle de la Venta</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-300">
                    Producto
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-300">
                    Fecha de la Venta
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-b-2 border-gray-300">
                    Cantidad
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-700 border-b-2 border-gray-300">
                    Precio Unitario
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-700 border-b-2 border-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventaDetalle.detalle.map((item, index) => (
                  <tr 
                    key={item.id_venta_det} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 border-b border-gray-200">
                      <span className="font-medium text-gray-900">{item.nombre_producto}</span>
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-700">
                      {formatearFechaConHora(item.fecha_venta)}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-center font-semibold text-gray-900">
                      {item.cantidad}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-right text-gray-700">
                      {formatearMoneda(item.precio_unitario)}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-right font-semibold text-gray-900">
                      {formatearMoneda(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50">
                  <td colSpan={4} className="p-4 text-right font-bold text-gray-900">
                    TOTAL:
                  </td>
                  <td className="p-4 text-right font-bold text-blue-600 text-xl">
                    {formatearMoneda(ventaDetalle.valor_total || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notas adicionales si existen */}
        {ventaDetalle.notas && (
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Notas</h3>
            <p className="text-gray-700">{ventaDetalle.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleVentaCompleto;
