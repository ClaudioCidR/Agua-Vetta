import React from 'react';

interface DashboardCardProps {
  titulo: string;
  descripcion: string;
  icono: string;
  kpis?: { label: string; valor: string | number }[];
  onVerInforme: () => void;
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  titulo,
  descripcion,
  icono,
  kpis,
  onVerInforme,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Encabezado con gradiente */}
      <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white p-6`}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{icono}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{titulo}</h3>
            <p className="text-blue-100 mt-1">{descripcion}</p>
          </div>
        </div>
      </div>

      {/* KPIs Resumidos */}
      {kpis && kpis.length > 0 && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            {kpis.map((kpi, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-800">{kpi.valor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón Ver Informe */}
      <div className="p-6">
        <button
          onClick={onVerInforme}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Ver Informe Detallado →
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;
