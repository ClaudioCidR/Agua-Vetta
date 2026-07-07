/**
 * Limpia el teléfono removiendo espacios, guiones y paréntesis
 */
export const limpiarTelefono = (telefono: string): string => {
  return telefono.replace(/[\s\-()]/g, '').trim();
};

/**
 * Formatea un número de teléfono chileno
 * Móvil: 9 8765 4321 (9 dígitos)
 * Fijo: 2 2345 6789 (9 dígitos)
 * Fijo corto: 22 345 678 (8 dígitos)
 */
export const formatearTelefono = (telefono: string): string => {
  const telefonoLimpio = limpiarTelefono(telefono);
  
  if (telefonoLimpio.length === 0) return '';
  
  // Si es móvil (comienza con 9) o fijo de 9 dígitos (comienza con 2)
  if (telefonoLimpio.length === 9) {
    // Formato: X XXXX XXXX
    return `${telefonoLimpio[0]} ${telefonoLimpio.slice(1, 5)} ${telefonoLimpio.slice(5)}`;
  }
  
  // Si es fijo de 8 dígitos (algunas regiones)
  if (telefonoLimpio.length === 8) {
    // Formato: XX XXX XXX
    return `${telefonoLimpio.slice(0, 2)} ${telefonoLimpio.slice(2, 5)} ${telefonoLimpio.slice(5)}`;
  }
  
  // Para números en proceso de escritura, no formatear
  return telefonoLimpio;
};

/**
 * Valida si un teléfono chileno es válido
 */
export const validarTelefono = (telefono: string): boolean => {
  const telefonoLimpio = limpiarTelefono(telefono);
  
  // Vacío es válido (campo opcional)
  if (telefonoLimpio.length === 0) return true;
  
  // Debe tener entre 8 y 9 dígitos
  if (telefonoLimpio.length < 8 || telefonoLimpio.length > 9) return false;
  
  // Solo números
  if (!/^\d+$/.test(telefonoLimpio)) return false;
  
  // Si tiene 9 dígitos, debe comenzar con 2 (fijo Santiago/regiones) o 9 (móvil)
  if (telefonoLimpio.length === 9) {
    const primerDigito = telefonoLimpio[0];
    return primerDigito === '2' || primerDigito === '9';
  }
  
  return true;
};
