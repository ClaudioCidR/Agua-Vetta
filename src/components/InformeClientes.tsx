import React, { useEffect, useState } from 'react';
import { useInformeClientes } from '../hooks/useInformeClientes';
import type { FiltrosInforme } from '../types/informes';
import {
  exportarClientesPDF,
  exportarClientesExcel
} from '../lib/exportacionInformes';

interface InformeClientesProps {
  onVolver: () => void;
}

const InformeClientes: React.FC<InformeClientesProps> = ({ onVolver }) => {
  const { clientes, kpis, fetchClientesInfo, calcularKPIs, loading, error } = useInformeClientes();
  
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    tipoCliente: ''
  });

  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      fetchClientesInfo(filtros),
      calcularKPIs(filtros)
    ]);
  };

  const handleAplicarFiltros = () => {
    cargarDatos();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ tipoCliente: '' });
    setTimeout(() => {
      fetchClientesInfo();
      calcularKPIs();
    }, 100);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
    setExportando(true);
    try {
      exportarClientesPDF(clientes, 'INFORME DE CLIENTES');
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
      exportarClientesExcel(clientes, 'INFORME DE CLIENTES');
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      alert('Error al exportar el Excel');
    } finally {
      setExportando(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-800">Informe de Clientes</h1>
            <p className="text-gray-600 mt-1">Análisis detallado de clientes y comportamiento de compra</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportarPDF}
              disabled={exportando || clientes.length === 0}
              className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              📄 Exportar PDF
            </button>
            <button
              onClick={handleExportarExcel}
              disabled={exportando || clientes.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-1">Total Clientes</p>
              <p className="text-2xl font-bold text-blue-800">{kpis.totalClientes}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-semibold mb-1">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-800">{kpis.clientesActivos}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-semibold mb-1">Clientes Nuevos</p>
              <p className="text-2xl font-bold text-purple-800">{kpis.clientesNuevos}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-semibold mb-1">Distribuidores</p>
              <p className="text-2xl font-bold text-orange-800">{kpis.clientesDistribuidores}</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <p className="text-sm text-cyan-600 font-semibold mb-1">Hogar</p>
              <p className="text-2xl font-bold text-cyan-800">{kpis.clientesHogar}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Cliente</label>
            <select
              value={filtros.tipoCliente || ''}
              onChange={(e) => setFiltros({ ...filtros, tipoCliente: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="DISTRIBUIDOR">DISTRIBUIDOR</option>
              <option value="HOGAR">HOGAR</option>
            </select>
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

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600">
            Error al cargar clientes: {error}
          </div>
        ) : clientes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No se encontraron clientes con los filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">RUT</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Comuna</th>
                  <th className="text-center p-4 font-semibold text-gray-700">N° Ventas</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Total Compras</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Última Compra</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => (
                  <tr 
                    key={cliente.id_cliente}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 border-b border-gray-200">{cliente.rut}</td>
                    <td className="p-4 border-b border-gray-200 font-medium">{cliente.nombre}</td>
                    <td className="p-4 border-b border-gray-200">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        cliente.tipo_cliente === 'DISTRIBUIDOR'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {cliente.tipo_cliente}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-200">{cliente.comuna || 'N/A'}</td>
                    <td className="p-4 border-b border-gray-200 text-center font-semibold">
                      {cliente.cantidad_ventas || 0}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-right font-semibold text-green-600">
                      {formatearMoneda(cliente.total_compras || 0)}
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      {cliente.ultima_compra ? formatearFecha(cliente.ultima_compra) : 'Sin compras'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformeClientes;
