import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParkingLevel, Detector, Vehicle, Camera, Notification, SimulationStep } from '../types';
import { generateParkingLevel, getRandomVehicles } from '../utils/parkingGenerator';

interface SimulationContextType {
  parkingLevels: ParkingLevel[];
  currentLevel: number;
  activeDetector: Detector | null;
  simulationActive: boolean;
  simulationStep: SimulationStep;
  notifications: Notification[];
  statistics: {
    totalDetectors: number;
    totalZones: number;
    averageResponseTime: number;
    activeCameras: number;
  };
  activeCamera: Camera | null;
  showCameraFullscreen: boolean;
  volume: number;
  setCurrentLevel: (level: number) => void;
  activateDetector: (detector: Detector) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  setShowCameraFullscreen: (show: boolean) => void;
  setVolume: (volume: number) => void;
  acknowledgeNotification: (id: string) => void;
  completeActionStep: (step: number) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parkingLevels, setParkingLevels] = useState<ParkingLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [activeDetector, setActiveDetector] = useState<Detector | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState<SimulationStep>(SimulationStep.IDLE);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [statistics, setStatistics] = useState({
    totalDetectors: 0,
    totalZones: 0,
    averageResponseTime: 0,
    activeCameras: 0,
  });
  const [activeCamera, setActiveCamera] = useState<Camera | null>(null);
  const [showCameraFullscreen, setShowCameraFullscreen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [actionStepsCompleted, setActionStepsCompleted] = useState<boolean[]>([false, false, false]);

  // Initialize parking levels
  useEffect(() => {
    const levels: ParkingLevel[] = [];
    
    for (let i = 0; i < 3; i++) {
      const level = generateParkingLevel(i + 1);
      levels.push(level);
    }
    
    setParkingLevels(levels);
    
    // Calculate statistics
    const totalDetectors = levels.reduce((sum, level) => sum + level.detectors.length, 0);
    const totalZones = levels.reduce((sum, level) => {
      const zones = new Set(level.detectors.map(d => d.zone));
      return sum + zones.size;
    }, 0);
    
    setStatistics(prev => ({
      ...prev,
      totalDetectors,
      totalZones,
    }));
  }, []);

  // Periodically update vehicles
  useEffect(() => {
    const interval = setInterval(() => {
      if (!simulationActive) {
        setParkingLevels(prev => 
          prev.map(level => ({
            ...level,
            vehicles: getRandomVehicles(level.spots.length, 0.7)
          }))
        );
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [simulationActive]);

  const activateDetector = useCallback((detector: Detector) => {
    if (simulationActive) return;
    
    setActiveDetector(detector);
    
    // Find the camera associated with this detector
    const camera = parkingLevels[currentLevel].cameras.find(
      c => c.zone === detector.zone
    ) || null;
    
    setActiveCamera(camera);
    
    startSimulation();
  }, [simulationActive, parkingLevels, currentLevel]);

  const startSimulation = useCallback(() => {
    if (simulationActive || !activeDetector) return;
    
    setSimulationActive(true);
    setSimulationStep(SimulationStep.DETECTOR_ACTIVATED);
    
    // Add initial notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Détecteur activé',
      message: `Le détecteur ${activeDetector.id} dans la zone ${activeDetector.zone} a été activé.`,
      timestamp: new Date(),
      read: false,
      level: 'warning',
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Start simulation sequence
    const sequence = [
      { step: SimulationStep.DETECTOR_ACTIVATED, delay: 0 },
      { step: SimulationStep.ESSER_PROCESSING, delay: 2000 },
      { step: SimulationStep.MOXA_TRANSMISSION, delay: 4000 },
      { step: SimulationStep.IVPARK_PROCESSING, delay: 6000 },
      { step: SimulationStep.CAMERA_VERIFICATION, delay: 8000 },
      { step: SimulationStep.ALARM_CONFIRMED, delay: 10000 },
    ];
    
    sequence.forEach(({ step, delay }) => {
      setTimeout(() => {
        setSimulationStep(step);
        
        // Add notification for each step
        const stepNotification: Notification = {
          id: Date.now().toString() + step,
          title: getStepTitle(step),
          message: getStepMessage(step, activeDetector),
          timestamp: new Date(),
          read: false,
          level: step === SimulationStep.ALARM_CONFIRMED ? 'error' : 'warning',
        };
        
        setNotifications(prev => [stepNotification, ...prev]);
        
        // Update statistics when simulation completes
        if (step === SimulationStep.ALARM_CONFIRMED) {
          setStatistics(prev => ({
            ...prev,
            averageResponseTime: 10.5, // Simulated response time in seconds
            activeCameras: prev.activeCameras + 1,
          }));
        }
      }, delay);
    });
    
    // Reset action steps
    setActionStepsCompleted([false, false, false]);
  }, [simulationActive, activeDetector]);

  const resetSimulation = useCallback(() => {
    setSimulationActive(false);
    setSimulationStep(SimulationStep.IDLE);
    setActiveDetector(null);
    setActiveCamera(null);
    setShowCameraFullscreen(false);
    setActionStepsCompleted([false, false, false]);
  }, []);

  const acknowledgeNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const completeActionStep = useCallback((step: number) => {
    setActionStepsCompleted(prev => {
      const updated = [...prev];
      updated[step] = true;
      return updated;
    });
    
    // Add notification for completed step
    const stepNotification: Notification = {
      id: Date.now().toString() + 'action' + step,
      title: `Action ${step + 1} complétée`,
      message: `L'étape ${step + 1} du plan d'action a été complétée avec succès.`,
      timestamp: new Date(),
      read: false,
      level: 'success',
    };
    
    setNotifications(prev => [stepNotification, ...prev]);
    
    // If all steps are completed, reset simulation after delay
    if (step === 2) {
      setTimeout(() => {
        resetSimulation();
      }, 5000);
    }
  }, [resetSimulation]);

  const getStepTitle = (step: SimulationStep): string => {
    switch (step) {
      case SimulationStep.DETECTOR_ACTIVATED: return 'Détecteur activé';
      case SimulationStep.ESSER_PROCESSING: return 'Traitement ESSER';
      case SimulationStep.MOXA_TRANSMISSION: return 'Transmission MOXA';
      case SimulationStep.IVPARK_PROCESSING: return 'Traitement IVPARK';
      case SimulationStep.CAMERA_VERIFICATION: return 'Vérification caméra';
      case SimulationStep.ALARM_CONFIRMED: return 'ALARME CONFIRMÉE';
      default: return 'État inconnu';
    }
  };

  const getStepMessage = (step: SimulationStep, detector: Detector | null): string => {
    if (!detector) return '';
    
    switch (step) {
      case SimulationStep.DETECTOR_ACTIVATED:
        return `Le détecteur ${detector.id} dans la zone ${detector.zone} a été activé.`;
      case SimulationStep.ESSER_PROCESSING:
        return `Le système ESSER traite le signal du détecteur ${detector.id}.`;
      case SimulationStep.MOXA_TRANSMISSION:
        return `Transmission des données via MOXA en cours.`;
      case SimulationStep.IVPARK_PROCESSING:
        return `Le système IVPARK analyse les données reçues.`;
      case SimulationStep.CAMERA_VERIFICATION:
        return `Vérification visuelle par caméra en cours.`;
      case SimulationStep.ALARM_CONFIRMED:
        return `ALARME INCENDIE CONFIRMÉE dans la zone ${detector.zone}. Intervention requise immédiatement.`;
      default:
        return '';
    }
  };

  const value = {
    parkingLevels,
    currentLevel,
    activeDetector,
    simulationActive,
    simulationStep,
    notifications,
    statistics,
    activeCamera,
    showCameraFullscreen,
    volume,
    setCurrentLevel,
    activateDetector,
    startSimulation,
    resetSimulation,
    setShowCameraFullscreen,
    setVolume,
    acknowledgeNotification,
    completeActionStep,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
