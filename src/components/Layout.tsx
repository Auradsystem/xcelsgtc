import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlertTriangle, Bell, Volume2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { simulationActive, simulationStep, volume, setVolume } = useSimulation();
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-xl font-bold">Q-PARK Simulation de Détection Incendie</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {simulationActive && (
              <div className="flex items-center bg-red-600 px-3 py-1 rounded-full animate-pulse">
                <Bell className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Simulation en cours</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Q-PARK - Système de Simulation de Détection Incendie</p>
          <p className="text-xs mt-1">Version 2.0.0</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
