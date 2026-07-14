import React, { useEffect, useState } from 'react';
import { useInformeProductos } from '../hooks/useInformeProductos';
import type { FiltrosInforme } from '../types/informes';
import {
  exportarProductosPDF,
  exportarProductosExcel
} from '../lib/exportacionInformes';

interface InformeProductosProps {
  onVolver: () => void;
}

const InformeProductos: React.FC<InformeProductosProps> = ({ onVolver }) => {
  const { productos, fetchProductosInfo, loading, error } = useInformeProductos();
  
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fechaInicio: '',
    fechaFin: ''
  });

  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await fetchProductosInfo(filtros);
  };

  const handleAplicarFiltros = () => {
    cargarDatos();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: ''
    });
    setTimeout(() => {
      fetchProductosInfo();
    }, 100);
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      exportarProductosPDF(productos, 'INFORME DE PRODUCTOS');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('Error al exportar el PDF');
    } finally {
      setExportando(false);
    }
  };

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      exportarProductosExcel(productos, 'INFORME DE PRODUCTOS');
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      alert('Error al exportar el Excel');
    } finally {
      setExportando(false);
    }
  };

  // Calcular totales generales
  const totales = {
    unidadesVendidas: productos.reduce((acc, p) => acc + (p.total_vendido || 0), 0),
    ingresosGenerados: productos.reduce((acc, p) => acc + (p.ingresos_generados || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Barra de navegación */}
      <div className="mb-6">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Volver al centro de informes
        </button>
      </div>

      {/* Título y KPIs */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Informe de Productos</h1>
            <p className="text-gray-600 mt-1">Análisis de productos y rendimiento de ventas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportarPDF}
              disabled={exportando || productos.length === 0}
              className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              📄 Exportar PDF
            </button>
            <button
              onClick={handleExportarExcel}
              disabled={exportando || productos.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>

        {/* KPIs Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold mb-1">Total Productos</p>
            <p className="text-2xl font-bold text-blue-800">{productos.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold mb-1">Unidades Vendidas</p>
            <p className="text-2xl font-bold text-green-800">{totales.unidadesVendidas.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-semibold mb-1">Ingresos Generados</p>
            <p className="text-2xl font-bold text-purple-800">{formatearMoneda(totales.ingresosGenerados)}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fechaInicio || ''}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={filtros.fechaFin || ''}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAplicarFiltros}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleLimpiarFiltros}
            className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600">
            Error al cargar productos: {error}
          </div>
        ) : productos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No se encontraron productos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Producto</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Precio</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Unidades Vendidas</th>
                  <th className="text-center p-4 font-semibold text-gray-700">N° Ventas</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Ingresos Generados</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr 
                    key={producto.id_producto}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 border-b border-gray-200 font-medium">{producto.producto}</td>
                    <td className="p-4 border-b border-gray-200 text-right">{formatearMoneda(producto.precio)}</td>
                    <td className="p-4 border-b border-gray-200 text-center font-semibold text-blue-600">
                      {producto.total_vendido || 0}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-center">
                      {producto.cantidad_ventas || 0}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-right font-semibold text-green-600">
                      {formatearMoneda(producto.ingresos_generados || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan={2} className="p-4 text-right">TOTALES:</td>
                  <td className="p-4 text-center text-blue-700">{totales.unidadesVendidas.toLocaleString('es-CL')}</td>
                  <td className="p-4"></td>
                  <td className="p-4 text-right text-green-700">{formatearMoneda(totales.ingresosGenerados)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformeProductos;
