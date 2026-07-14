import React from 'react';

interface InformePlaceholderProps {
  titulo: string;
  descripcion: string;
  icono: string;
  onVolver: () => void;
}

const InformePlaceholder: React.FC<InformePlaceholderProps> = ({
  titulo,
  descripcion,
  icono,
  onVolver
}) => {
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

      {/* Contenido */}
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="text-8xl mb-6">{icono}</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{titulo}</h1>
        <p className="text-xl text-gray-600 mb-8">{descripcion}</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-blue-800 font-semibold mb-2">
            Este informe está en desarrollo
          </p>
          <p className="text-blue-600">
            La estructura del módulo de informes está lista. Este informe específico puede ser implementado cuando se requiera, siguiendo el mismo patrón de los informes ya creados (Ventas, Clientes, Productos).
          </p>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p className="mb-2">Para implementar este informe necesitarás:</p>
          <ul className="list-disc list-inside space-y-1 max-w-lg mx-auto">
            <li>Crear las tablas correspondientes en Supabase (si no existen)</li>
            <li>Definir los tipos e interfaces en types/informes.ts</li>
            <li>Crear un hook personalizado para consultas</li>
            <li>Implementar el componente de visualización</li>
            <li>Agregar funciones de exportación en lib/exportacionInformes.ts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InformePlaceholder;
