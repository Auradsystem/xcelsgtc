import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Maximize2, Minimize2, Camera } from 'lucide-react';
import { SimulationStep } from '../types';

const CameraView: React.FC = () => {
  const { 
    activeCamera, 
    showCameraFullscreen, 
    setShowCameraFullscreen,
    simulationStep,
    simulationActive
  } = useSimulation();
  
  const [smokeEffect, setSmokeEffect] = useState(0);
  const [flameEffect, setFlameEffect] = useState(0);
  
  // Increase smoke and flame effects as simulation progresses
  useEffect(() => {
    if (simulationActive && simulationStep >= SimulationStep.CAMERA_VERIFICATION) {
      const smokeInterval = setInterval(() => {
        setSmokeEffect(prev => Math.min(prev + 0.05, 0.7));
      }, 500);
      
      const flameInterval = setInterval(() => {
        setFlameEffect(prev => Math.min(prev + 0.1, 1));
      }, 1000);
      
      return () => {
        clearInterval(smokeInterval);
        clearInterval(flameInterval);
      };
    } else {
      setSmokeEffect(0);
      setFlameEffect(0);
    }
  }, [simulationActive, simulationStep]);
  
  if (!activeCamera && !simulationActive) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Vue Caméra</h2>
        <div className="bg-gray-100 rounded-md h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Aucune caméra sélectionnée</p>
            <p className="text-sm mt-1">Activez un détecteur pour voir la vue caméra</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${showCameraFullscreen ? 'fixed inset-0 z-50 bg-black p-4' : 'bg-white rounded-lg shadow-md p-4 flex-1'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${showCameraFullscreen ? 'text-white' : 'text-gray-800'}`}>
          Vue Caméra {activeCamera?.id}
        </h2>
        
        <button
          className={`p-2 rounded-full ${showCameraFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setShowCameraFullscreen(!showCameraFullscreen)}
        >
          {showCameraFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="relative rounded-md overflow-hidden">
        {/* Camera feed */}
        <img
          src={activeCamera?.imageUrl || "https://source.unsplash.com/800x600/?parking,garage"}
          alt="Camera feed"
          className={`w-full ${showCameraFullscreen ? 'h-[calc(100vh-120px)]' : 'h-64'} object-cover`}
        />
        
        {/* Smoke effect overlay */}
        {smokeEffect > 0 && (
          <div 
            className="absolute inset-0 bg-gray-500 mix-blend-multiply pointer-events-none"
            style={{ opacity: smokeEffect }}
          ></div>
        )}
        
        {/* Flame effect overlay */}
        {flameEffect > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-48 bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 rounded-t-full opacity-70 animate-pulse"
              style={{ opacity: flameEffect * 0.7 }}
            ></div>
          </div>
        )}
        
        {/* Camera info overlay */}
        <div className="absolute top-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs">
          <div className="flex justify-between">
            <span>{activeCamera?.id} - Zone {activeCamera?.zone}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        {/* Alert overlay when alarm confirmed */}
        {simulationStep === SimulationStep.ALARM_CONFIRMED && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 bg-opacity-80 text-white px-6 py-3 rounded-md animate-pulse">
              <h3 className="text-xl font-bold">ALARME INCENDIE</h3>
              <p>Zone {activeCamera?.zone}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Camera controls and info */}
      <div className={`mt-3 text-sm ${showCameraFullscreen ? 'text-white' : 'text-gray-600'}`}>
        <div className="flex justify-between">
          <span>Zone {activeCamera?.zone}</span>
          <span>Angle: {activeCamera?.angle}°</span>
        </div>
        
        {simulationStep >= SimulationStep.CAMERA_VERIFICATION && (
          <div className="mt-2 text-red-500 font-medium animate-pulse">
            Détection de fumée en cours
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;
