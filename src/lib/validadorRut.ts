/**
 * Limpia el RUT removiendo puntos y guiones
 */
export const limpiarRut = (rut: string): string => {
  return rut.replace(/[.-]/g, '').trim();
};

/**
 * Formatea el RUT con puntos y guión (12.345.678-9)
 */
export const formatearRut = (rut: string): string => {
  const rutLimpio = limpiarRut(rut);
  if (rutLimpio.length < 2) return rutLimpio;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Agregar puntos cada 3 dígitos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${cuerpoFormateado}-${dv}`;
};

/**
 * Calcula el dígito verificador de un RUT
 */
const calcularDV = (rutSinDV: string): string => {
  let suma = 0;
  let multiplicador = 2;

  for (let i = rutSinDV.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinDV[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
};

/**
 * Valida si un RUT chileno es válido
 */
export const validarRut = (rut: string): boolean => {
  const rutLimpio = limpiarRut(rut);

  // Debe tener al menos 2 caracteres (número + DV)
  if (rutLimpio.length < 2) return false;

  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  // El cuerpo debe ser numérico
  if (!/^\d+$/.test(cuerpo)) return false;

  // Validar que el cuerpo tenga entre 7 y 8 dígitos (RUT válidos en Chile)
  if (cuerpo.length < 7 || cuerpo.length > 8) return false;

  // Calcular y comparar el DV
  const dvCalculado = calcularDV(cuerpo);

  return dv === dvCalculado;
};
