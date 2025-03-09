import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { BarChart, Clock, Camera, Map } from 'lucide-react';

const StatisticsPanel: React.FC = () => {
  const { statistics, simulationActive, simulationStep } = useSimulation();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex-1">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
        <BarChart className="h-5 w-5 mr-2" />
        Statistiques Système
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-center text-blue-700 mb-1">
            <Map className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Détecteurs</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{statistics.totalDetectors}</p>
          <p className="text-xs text-blue-600 mt-1">Répartis sur 3 niveaux</p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-md">
          <div className="flex items-center text-purple-700 mb-1">
            <Map className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Zones</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{statistics.totalZones}</p>
          <p className="text-xs text-purple-600 mt-1">Zones de sécurité</p>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-md">
          <div className="flex items-center text-amber-700 mb-1">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Temps de réponse</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            {simulationActive ? statistics.averageResponseTime.toFixed(1) : '--'} s
          </p>
          <p className="text-xs text-amber-600 mt-1">Moyenne de détection</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex items-center text-green-700 mb-1">
            <Camera className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Caméras</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{statistics.activeCameras}</p>
          <p className="text-xs text-green-600 mt-1">Actives actuellement</p>
        </div>
      </div>
      
      {simulationActive && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h3 className="font-medium text-gray-800">Progression de la simulation</h3>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${simulationStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-full ${simulationStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${simulationStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-full ${simulationStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${simulationStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-full ${simulationStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${simulationStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-full ${simulationStep >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${simulationStep >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-full ${simulationStep >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${simulationStep >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Détection</span>
              <span>ESSER</span>
              <span>MOXA</span>
              <span>IVPARK</span>
              <span>Caméra</span>
              <span>Alarme</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
