import React, { useEffect, useState } from 'react';
import { useInformeVentas } from '../hooks/useInformeVentas';
import { useClientes } from '../hooks/useClientes';
import type { FiltrosInforme } from '../types/informes';
import {
  exportarListaVentasPDF,
  exportarListaVentasExcel
} from '../lib/exportacionInformes';

interface InformeVentasProps {
  onVolver: () => void;
  onVerDetalle: (idVenta: string) => void;
}

const InformeVentas: React.FC<InformeVentasProps> = ({ onVolver, onVerDetalle }) => {
  const { ventas, kpis, fetchVentas, calcularKPIs, loading, error } = useInformeVentas();
  const { clientes } = useClientes();

  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fechaInicio: '',
    fechaFin: '',
    idCliente: '',
    tipoDocumento: '',
    formaPago: '',
    estado: ''
  });

  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      fetchVentas(filtros),
      calcularKPIs(filtros)
    ]);
  };

  const handleAplicarFiltros = () => {
    cargarDatos();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      idCliente: '',
      tipoDocumento: '',
      formaPago: '',
      estado: ''
    });
    setTimeout(() => {
      fetchVentas();
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
      exportarListaVentasPDF(ventas, 'INFORME DE VENTAS');
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
      exportarListaVentasExcel(ventas, 'INFORME DE VENTAS');
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
            <h1 className="text-3xl font-bold text-gray-800">Informe de Ventas</h1>
            <p className="text-gray-600 mt-1">Análisis detallado de ventas y transacciones</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportarPDF}
              disabled={exportando || ventas.length === 0}
              className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              📄 Exportar PDF
            </button>
            <button
              onClick={handleExportarExcel}
              disabled={exportando || ventas.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-1">Total Ventas</p>
              <p className="text-2xl font-bold text-blue-800">{formatearMoneda(kpis.totalVentas)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-semibold mb-1">Transacciones</p>
              <p className="text-2xl font-bold text-green-800">{kpis.cantidadTransacciones}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-semibold mb-1">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-800">{formatearMoneda(kpis.ticketPromedio)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-semibold mb-1">Efectivo</p>
              <p className="text-xl font-bold text-orange-800">{formatearMoneda(kpis.ventasEfectivo)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
            <select
              value={filtros.idCliente || ''}
              onChange={(e) => setFiltros({ ...filtros, idCliente: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Documento</label>
            <select
              value={filtros.tipoDocumento || ''}
              onChange={(e) => setFiltros({ ...filtros, tipoDocumento: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="BOLETA">BOLETA</option>
              <option value="FACTURA">FACTURA</option>
              <option value="FACT.PENDIENTE">FACT.PENDIENTE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pago</label>
            <select
              value={filtros.formaPago || ''}
              onChange={(e) => setFiltros({ ...filtros, formaPago: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="TARJETA">TARJETA</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select
              value={filtros.estado || ''}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="PAGADO">PAGADO</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="ANULADO">ANULADO</option>
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

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando ventas...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600">
            Error al cargar ventas: {error}
          </div>
        ) : ventas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No se encontraron ventas con los filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Cliente</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Tipo Doc.</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Forma Pago</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Total</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta, index) => (
                  <tr 
                    key={venta.id_ventas}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 border-b border-gray-200">{formatearFecha(venta.fecha)}</td>
                    <td className="p-4 border-b border-gray-200">{venta.nombre_distribuidor || venta.nombre_cliente || 'N/A'}</td>
                    <td className="p-4 border-b border-gray-200">{venta.tip_documento}</td>
                    <td className="p-4 border-b border-gray-200">{venta.forma_pago}</td>
                    <td className="p-4 border-b border-gray-200 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        venta.estado === 'PAGADO' 
                          ? 'bg-green-100 text-green-800'
                          : venta.estado === 'PENDIENTE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-200 text-right font-semibold">
                      {formatearMoneda(venta.valor_total || 0)}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-center">
                      <button
                        onClick={() => onVerDetalle(venta.id_ventas)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Ver Detalle
                      </button>
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

export default InformeVentas;
