import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { VentaCompleta, VentaCabecera, ClienteInfo, ProductoInfo } from '../types/informes';

// =============== UTILIDADES GENERALES ===============

const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatearFechaConHora = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(monto);
};

// =============== EXPORTACIÓN DE INFORME DE VENTAS COMPLETO ===============

export const exportarVentaPDF = (venta: VentaCompleta) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE VENTA', 105, 20, { align: 'center' });
  
  // Encabezado de la venta
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos de la Venta', 14, 35);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 45;
  
  doc.text(`Fecha: ${formatearFecha(venta.fecha)}`, 14, yPos);
  yPos += 7;
  doc.text(`Distribuidor: ${venta.nombre_distribuidor || 'N/A'}`, 14, yPos);
  yPos += 7;
  doc.text(`Tipo de Documento: ${venta.tip_documento}`, 14, yPos);
  yPos += 7;
  doc.text(`N° Documento: ${venta.n_documento || 'S/N'}`, 14, yPos);
  yPos += 7;
  doc.text(`Forma de Pago: ${venta.forma_pago}`, 14, yPos);
  yPos += 7;
  doc.text(`Fecha de Pago: ${venta.fecha_pago ? formatearFecha(venta.fecha_pago) : 'Pendiente'}`, 14, yPos);
  yPos += 7;
  doc.text(`Estado de Pago: ${venta.estado}`, 14, yPos);
  yPos += 7;
  doc.text(`Valor Total: ${formatearMoneda(venta.valor_total || 0)}`, 14, yPos);
  
  // Detalle de la venta
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de la Venta', 14, yPos);
  
  // Tabla de detalle
  const detalleTabla = venta.detalle.map(d => [
    d.nombre_producto,
    formatearFechaConHora(d.fecha_venta),
    d.cantidad.toString(),
    formatearMoneda(d.precio_unitario),
    formatearMoneda(d.total)
  ]);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Producto', 'Fecha de Venta', 'Cantidad', 'Precio Unitario', 'Total']],
    body: detalleTabla,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  // Guardar PDF
  const nombreArchivo = `venta_${venta.id_ventas}_${new Date().getTime()}.pdf`;
  doc.save(nombreArchivo);
};

export const exportarVentaExcel = (venta: VentaCompleta) => {
  // Hoja de encabezado
  const encabezadoData = [
    ['INFORME DE VENTA'],
    [],
    ['Fecha', formatearFecha(venta.fecha)],
    ['Distribuidor', venta.nombre_distribuidor || 'N/A'],
    ['Tipo de Documento', venta.tip_documento],
    ['N° Documento', venta.n_documento || 'S/N'],
    ['Forma de Pago', venta.forma_pago],
    ['Fecha de Pago', venta.fecha_pago ? formatearFecha(venta.fecha_pago) : 'Pendiente'],
    ['Estado de Pago', venta.estado],
    ['Valor Total', formatearMoneda(venta.valor_total || 0)],
    [],
    ['DETALLE DE LA VENTA'],
    ['Producto', 'Fecha de Venta', 'Cantidad', 'Precio Unitario', 'Total']
  ];
  
  // Agregar detalle
  venta.detalle.forEach(d => {
    encabezadoData.push([
      d.nombre_producto,
      formatearFechaConHora(d.fecha_venta),
      d.cantidad,
      d.precio_unitario,
      d.total
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(encabezadoData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Venta');
  
  const nombreArchivo = `venta_${venta.id_ventas}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

// =============== EXPORTACIÓN DE LISTA DE VENTAS ===============

export const exportarListaVentasPDF = (ventas: VentaCabecera[], titulo: string = 'INFORME DE VENTAS') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 20, { align: 'center' });
  
  const ventasTabla = ventas.map(v => [
    formatearFecha(v.fecha),
    v.nombre_distribuidor || v.nombre_cliente || 'N/A',
    v.tip_documento,
    v.forma_pago,
    v.estado,
    formatearMoneda(v.valor_total || 0)
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Fecha', 'Cliente', 'Tipo Doc.', 'Forma de Pago', 'Estado', 'Total']],
    body: ventasTabla,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  // Total general
  const totalGeneral = ventas.reduce((acc, v) => acc + (v.valor_total || 0), 0);
  const finalY = (doc as any).lastAutoTable.finalY || 30;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total General: ${formatearMoneda(totalGeneral)}`, 14, finalY + 10);
  
  const nombreArchivo = `informe_ventas_${new Date().getTime()}.pdf`;
  doc.save(nombreArchivo);
};

export const exportarListaVentasExcel = (ventas: VentaCabecera[], titulo: string = 'INFORME DE VENTAS') => {
  const data: any[][] = [
    [titulo],
    [],
    ['Fecha', 'Cliente', 'Tipo Documento', 'N° Documento', 'Forma de Pago', 'Estado', 'Total']
  ];
  
  ventas.forEach(v => {
    data.push([
      formatearFecha(v.fecha),
      v.nombre_distribuidor || v.nombre_cliente || 'N/A',
      v.tip_documento,
      v.n_documento?.toString() || 'S/N',
      v.forma_pago,
      v.estado,
      v.valor_total || 0
    ]);
  });
  
  // Total
  const totalGeneral = ventas.reduce((acc, v) => acc + (v.valor_total || 0), 0);
  data.push([]);
  data.push(['', '', '', '', '', 'TOTAL:', totalGeneral]);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
  
  const nombreArchivo = `informe_ventas_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

// =============== EXPORTACIÓN DE CLIENTES ===============

export const exportarClientesPDF = (clientes: ClienteInfo[], titulo: string = 'INFORME DE CLIENTES') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 20, { align: 'center' });
  
  const clientesTabla = clientes.map(c => [
    c.rut,
    c.nombre,
    c.tipo_cliente,
    c.cantidad_ventas?.toString() || '0',
    formatearMoneda(c.total_compras || 0),
    c.ultima_compra ? formatearFecha(c.ultima_compra) : 'Sin compras'
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['RUT', 'Nombre', 'Tipo', 'N° Ventas', 'Total Compras', 'Última Compra']],
    body: clientesTabla,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  const nombreArchivo = `informe_clientes_${new Date().getTime()}.pdf`;
  doc.save(nombreArchivo);
};

export const exportarClientesExcel = (clientes: ClienteInfo[], titulo: string = 'INFORME DE CLIENTES') => {
  const data: any[][] = [
    [titulo],
    [],
    ['RUT', 'Nombre', 'Tipo Cliente', 'Teléfono', 'Comuna', 'N° Ventas', 'Total Compras', 'Última Compra']
  ];
  
  clientes.forEach(c => {
    data.push([
      c.rut,
      c.nombre,
      c.tipo_cliente,
      c.telefono || 'N/A',
      c.comuna || 'N/A',
      c.cantidad_ventas || 0,
      c.total_compras || 0,
      c.ultima_compra ? formatearFecha(c.ultima_compra) : 'Sin compras'
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  
  const nombreArchivo = `informe_clientes_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

// =============== EXPORTACIÓN DE PRODUCTOS ===============

export const exportarProductosPDF = (productos: ProductoInfo[], titulo: string = 'INFORME DE PRODUCTOS') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 20, { align: 'center' });
  
  const productosTabla = productos.map(p => [
    p.producto,
    formatearMoneda(p.precio),
    p.total_vendido?.toString() || '0',
    p.cantidad_ventas?.toString() || '0',
    formatearMoneda(p.ingresos_generados || 0)
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Producto', 'Precio', 'Unidades Vendidas', 'N° Ventas', 'Ingresos Generados']],
    body: productosTabla,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  const nombreArchivo = `informe_productos_${new Date().getTime()}.pdf`;
  doc.save(nombreArchivo);
};

export const exportarProductosExcel = (productos: ProductoInfo[], titulo: string = 'INFORME DE PRODUCTOS') => {
  const data: any[][] = [
    [titulo],
    [],
    ['Producto', 'Precio', 'Unidades Vendidas', 'N° Ventas', 'Ingresos Generados']
  ];
  
  productos.forEach(p => {
    data.push([
      p.producto,
      p.precio,
      p.total_vendido || 0,
      p.cantidad_ventas || 0,
      p.ingresos_generados || 0
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');
  
  const nombreArchivo = `informe_productos_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};
