import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CheckCircle, AlertOctagon, PhoneCall, Users, Building } from 'lucide-react';
import { SimulationStep } from '../types';

const ActionPlan: React.FC = () => {
  const { simulationStep, completeActionStep } = useSimulation();
  
  // Only show action plan when alarm is confirmed
  if (simulationStep !== SimulationStep.ALARM_CONFIRMED) {
    return null;
  }
  
  return (
    <div className="bg-red-50 rounded-lg shadow-md p-4 border-2 border-red-500 animate-pulse">
      <h2 className="text-xl font-semibold text-red-800 flex items-center mb-4">
        <AlertOctagon className="h-5 w-5 mr-2" />
        Plan d'Action d'Urgence
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-md border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <PhoneCall className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Étape 1: Contacter les services d'urgence</h3>
              <p className="text-sm mt-1 text-gray-700">
                Appelez immédiatement le 18 ou 112 pour signaler l'incendie et sa localisation précise.
              </p>
              <button
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                onClick={() => completeActionStep(0)}
              >
                Confirmer l'appel
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-md border-l-4 border-amber-500">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Étape 2: Évacuer la zone</h3>
              <p className="text-sm mt-1 text-gray-700">
                Déclencher l'évacuation du niveau concerné et des niveaux adjacents. Utiliser les issues de secours.
              </p>
              <button
                className="mt-2 px-3 py-1 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700"
                onClick={() => completeActionStep(1)}
              >
                Confirmer l'évacuation
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-md border-l-4 border-blue-500">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Building className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Étape 3: Sécuriser les accès</h3>
              <p className="text-sm mt-1 text-gray-700">
                Bloquer les accès au parking et préparer l'arrivée des secours. Fournir les plans d'accès.
              </p>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                onClick={() => completeActionStep(2)}
              >
                Confirmer la sécurisation
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded-md">
        <h3 className="font-medium text-gray-800 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Suivi des actions
        </h3>
        <p className="text-sm mt-2 text-gray-600">
          Complétez toutes les étapes du plan d'action pour terminer la simulation.
        </p>
      </div>
    </div>
  );
};

export default ActionPlan;
