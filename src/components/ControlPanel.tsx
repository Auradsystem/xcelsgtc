import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Flame, RotateCcw, AlertTriangle } from 'lucide-react';
import { SimulationStep } from '../types';

const ControlPanel: React.FC = () => {
  const { 
    simulationActive, 
    startSimulation, 
    resetSimulation, 
    activeDetector,
    simulationStep
  } = useSimulation();
  
  const getStepProgress = (): number => {
    switch (simulationStep) {
      case SimulationStep.IDLE:
        return 0;
      case SimulationStep.DETECTOR_ACTIVATED:
        return 20;
      case SimulationStep.ESSER_PROCESSING:
        return 40;
      case SimulationStep.MOXA_TRANSMISSION:
        return 60;
      case SimulationStep.IVPARK_PROCESSING:
        return 80;
      case SimulationStep.CAMERA_VERIFICATION:
        return 90;
      case SimulationStep.ALARM_CONFIRMED:
        return 100;
      default:
        return 0;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Panneau de Contrôle</h2>
      
      <div className="space-y-4">
        <button
          className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
            simulationActive
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          onClick={startSimulation}
          disabled={simulationActive}
        >
          <Flame className="h-5 w-5" />
          <span>Simuler un départ de feu</span>
        </button>
        
        <button
          className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
            !simulationActive
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={resetSimulation}
          disabled={!simulationActive}
        >
          <RotateCcw className="h-5 w-5" />
          <span>Réinitialiser la simulation</span>
        </button>
        
        {simulationActive && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{getStepProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <h3 className="font-medium text-gray-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                État actuel
              </h3>
              <p className="text-sm mt-2">
                {simulationStep === SimulationStep.IDLE && 'En attente de simulation'}
                {simulationStep === SimulationStep.DETECTOR_ACTIVATED && 'Détecteur activé'}
                {simulationStep === SimulationStep.ESSER_PROCESSING && 'Traitement par système ESSER'}
                {simulationStep === SimulationStep.MOXA_TRANSMISSION && 'Transmission via MOXA'}
                {simulationStep === SimulationStep.IVPARK_PROCESSING && 'Traitement par IVPARK'}
                {simulationStep === SimulationStep.CAMERA_VERIFICATION && 'Vérification par caméra'}
                {simulationStep === SimulationStep.ALARM_CONFIRMED && 'ALARME CONFIRMÉE'}
              </p>
              
              {activeDetector && (
                <div className="mt-3 text-sm">
                  <p><span className="font-medium">Détecteur:</span> {activeDetector.id}</p>
                  <p><span className="font-medium">Zone:</span> {activeDetector.zone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
