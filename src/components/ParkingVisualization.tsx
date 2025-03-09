import React, { useRef, useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SimulationStep } from '../types';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

const ParkingVisualization: React.FC = () => {
  const { 
    parkingLevels, 
    currentLevel, 
    setCurrentLevel, 
    activateDetector, 
    activeDetector,
    simulationActive,
    simulationStep
  } = useSimulation();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [hoveredDetector, setHoveredDetector] = useState<string | null>(null);
  
  // Animation states
  const [smokeParticles, setSmokeParticles] = useState<Array<{x: number, y: number, size: number, opacity: number, speed: number}>>([]);
  const [dataPackets, setDataPackets] = useState<Array<{x: number, y: number, targetX: number, targetY: number, progress: number, step: SimulationStep}>>([]);
  
  const smokeAnimation = useAnimationFrame((_, deltaTime) => {
    if (simulationStep >= SimulationStep.DETECTOR_ACTIVATED && activeDetector) {
      // Add new smoke particles
      if (Math.random() > 0.7) {
        const newParticle = {
          x: activeDetector.coordinates.x + (Math.random() * 20 - 10),
          y: activeDetector.coordinates.y + (Math.random() * 20 - 10),
          size: Math.random() * 15 + 5,
          opacity: Math.random() * 0.5 + 0.2,
          speed: Math.random() * 0.5 + 0.1
        };
        setSmokeParticles(prev => [...prev, newParticle]);
      }
      
      // Update existing particles
      setSmokeParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            y: particle.y - particle.speed * (deltaTime / 16),
            size: particle.size + 0.05 * (deltaTime / 16),
            opacity: particle.opacity - 0.002 * (deltaTime / 16)
          }))
          .filter(particle => particle.opacity > 0)
      );
    }
  });
  
  const dataAnimation = useAnimationFrame((_, deltaTime) => {
    if (simulationStep >= SimulationStep.ESSER_PROCESSING) {
      // Add new data packets based on current step
      if (Math.random() > 0.9) {
        let source = { x: 0, y: 0 };
        let target = { x: 0, y: 0 };
        
        if (activeDetector) {
          source = { ...activeDetector.coordinates };
          
          // Determine target based on current step
          switch (simulationStep) {
            case SimulationStep.ESSER_PROCESSING:
              target = { x: canvasSize.width - 100, y: 50 }; // ESSER position
              break;
            case SimulationStep.MOXA_TRANSMISSION:
              target = { x: canvasSize.width - 100, y: 150 }; // MOXA position
              break;
            case SimulationStep.IVPARK_PROCESSING:
            case SimulationStep.CAMERA_VERIFICATION:
            case SimulationStep.ALARM_CONFIRMED:
              target = { x: canvasSize.width - 100, y: 250 }; // IVPARK position
              break;
            default:
              break;
          }
          
          const newPacket = {
            x: source.x,
            y: source.y,
            targetX: target.x,
            targetY: target.y,
            progress: 0,
            step: simulationStep
          };
          
          setDataPackets(prev => [...prev, newPacket]);
        }
      }
      
      // Update existing packets
      setDataPackets(prev => 
        prev
          .map(packet => {
            const speed = 0.003 * (deltaTime / 16);
            return {
              ...packet,
              progress: Math.min(packet.progress + speed, 1)
            };
          })
          .filter(packet => packet.progress < 1)
      );
    }
  });
  
  // Start animations when simulation is active
  useEffect(() => {
    if (simulationActive) {
      smokeAnimation.start();
      dataAnimation.start();
    } else {
      smokeAnimation.stop();
      dataAnimation.stop();
      setSmokeParticles([]);
      setDataPackets([]);
    }
    
    return () => {
      smokeAnimation.stop();
      dataAnimation.stop();
    };
  }, [simulationActive, simulationStep]);
  
  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setCanvasSize({
          width: container.clientWidth,
          height: Math.min(500, window.innerHeight * 0.5)
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Draw the parking level
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const level = parkingLevels[currentLevel];
    if (!level) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw paths
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    level.paths.forEach(path => {
      ctx.beginPath();
      path.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });
    
    // Draw parking spots
    level.spots.forEach(spot => {
      ctx.save();
      ctx.translate(spot.coordinates.x, spot.coordinates.y);
      ctx.rotate((spot.angle * Math.PI) / 180);
      
      // Draw spot rectangle
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(-25, -12.5, 50, 25);
      
      ctx.restore();
    });
    
    // Draw vehicles
    level.vehicles.forEach(vehicle => {
      const spot = level.spots.find(s => s.id === vehicle.spotId);
      if (!spot) return;
      
      ctx.save();
      ctx.translate(spot.coordinates.x, spot.coordinates.y);
      ctx.rotate((spot.angle * Math.PI) / 180);
      
      // Draw vehicle based on type
      ctx.fillStyle = vehicle.color;
      
      switch (vehicle.type) {
        case 'sedan':
          // Draw sedan shape
          ctx.fillRect(-20, -10, 40, 20);
          ctx.fillStyle = '#94A3B8';
          ctx.fillRect(-15, -8, 10, 16); // Windows
          ctx.fillRect(5, -8, 10, 16);
          break;
        case 'suv':
          // Draw SUV shape
          ctx.fillRect(-22, -11, 44, 22);
          ctx.fillStyle = '#94A3B8';
          ctx.fillRect(-17, -9, 34, 18); // Windows
          break;
        case 'compact':
          // Draw compact shape
          ctx.fillRect(-18, -9, 36, 18);
          ctx.fillStyle = '#94A3B8';
          ctx.fillRect(-13, -7, 8, 14); // Windows
          ctx.fillRect(5, -7, 8, 14);
          break;
      }
      
      ctx.restore();
    });
    
    // Draw structural elements
    level.structuralElements.forEach(element => {
      ctx.save();
      ctx.translate(element.coordinates.x, element.coordinates.y);
      
      switch (element.type) {
        case 'column':
          ctx.fillStyle = '#64748B';
          ctx.fillRect(-10, -10, 20, 20);
          break;
        case 'ramp':
          ctx.fillStyle = '#475569';
          ctx.fillRect(-40, -75, 80, 150);
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-30, -65);
          ctx.lineTo(30, 65);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-30, 65);
          ctx.lineTo(30, -65);
          ctx.stroke();
          break;
        case 'elevator':
          ctx.fillStyle = '#334155';
          ctx.fillRect(-20, -20, 40, 40);
          ctx.strokeStyle = '#94A3B8';
          ctx.strokeRect(-20, -20, 40, 40);
          ctx.strokeRect(-15, -15, 30, 30);
          break;
        case 'stairs':
          ctx.fillStyle = '#334155';
          ctx.fillRect(-20, -40, 40, 80);
          // Draw stairs lines
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1;
          for (let i = -35; i <= 35; i += 10) {
            ctx.beginPath();
            ctx.moveTo(-15, i);
            ctx.lineTo(15, i);
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
    });
    
    // Draw detectors
    level.detectors.forEach(detector => {
      ctx.save();
      ctx.translate(detector.coordinates.x, detector.coordinates.y);
      
      // Determine detector color based on status
      let detectorColor = '#10B981'; // Normal - green
      if (detector.status === 'fault') {
        detectorColor = '#F59E0B'; // Fault - yellow
      } else if (detector.status === 'active' || detector.id === activeDetector?.id) {
        detectorColor = '#EF4444'; // Active - red
      }
      
      // Highlight hovered detector
      if (detector.id === hoveredDetector) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
      }
      
      // Draw detector circle
      ctx.fillStyle = detectorColor;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw detector label
      if (detector.id === hoveredDetector || detector.id === activeDetector?.id) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(detector.id, 0, -12);
        ctx.fillText(`Zone ${detector.zone}`, 0, -24);
      }
      
      ctx.restore();
    });
    
    // Draw cameras
    level.cameras.forEach(camera => {
      ctx.save();
      ctx.translate(camera.coordinates.x, camera.coordinates.y);
      ctx.rotate((camera.angle * Math.PI) / 180);
      
      // Draw camera shape
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-7, -5, 14, 10);
      ctx.fillStyle = '#1E40AF';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw camera field of view
      ctx.strokeStyle = 'rgba(30, 64, 175, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 50, -Math.PI / 4, Math.PI / 4);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(30, 64, 175, 0.1)';
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw smoke particles
    smokeParticles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = simulationStep >= SimulationStep.ALARM_CONFIRMED ? 'rgba(239, 68, 68, 0.7)' : 'rgba(148, 163, 184, 0.7)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw data packets
    dataPackets.forEach(packet => {
      const x = packet.x + (packet.targetX - packet.x) * packet.progress;
      const y = packet.y + (packet.targetY - packet.y) * packet.progress;
      
      ctx.save();
      
      // Different colors for different steps
      let packetColor = '#3B82F6'; // Default blue
      switch (packet.step) {
        case SimulationStep.ESSER_PROCESSING:
          packetColor = '#3B82F6'; // Blue
          break;
        case SimulationStep.MOXA_TRANSMISSION:
          packetColor = '#8B5CF6'; // Purple
          break;
        case SimulationStep.IVPARK_PROCESSING:
        case SimulationStep.CAMERA_VERIFICATION:
        case SimulationStep.ALARM_CONFIRMED:
          packetColor = '#EF4444'; // Red
          break;
      }
      
      ctx.fillStyle = packetColor;
      ctx.shadowColor = packetColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw system components on the right side
    if (simulationActive) {
      // ESSER System
      ctx.fillStyle = simulationStep >= SimulationStep.ESSER_PROCESSING ? '#3B82F6' : '#64748B';
      ctx.fillRect(canvas.width - 120, 30, 100, 40);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ESSER', canvas.width - 70, 55);
      
      // MOXA System
      ctx.fillStyle = simulationStep >= SimulationStep.MOXA_TRANSMISSION ? '#8B5CF6' : '#64748B';
      ctx.fillRect(canvas.width - 120, 130, 100, 40);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MOXA', canvas.width - 70, 155);
      
      // IVPARK System
      ctx.fillStyle = simulationStep >= SimulationStep.IVPARK_PROCESSING ? '#EF4444' : '#64748B';
      ctx.fillRect(canvas.width - 120, 230, 100, 40);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('IVPARK', canvas.width - 70, 255);
    }
    
  }, [parkingLevels, currentLevel, hoveredDetector, activeDetector, smokeParticles, dataPackets, canvasSize, simulationStep]);
  
  // Handle mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const level = parkingLevels[currentLevel];
    if (!level) return;
    
    // Check if mouse is over a detector
    let found = false;
    for (const detector of level.detectors) {
      const dx = detector.coordinates.x - x;
      const dy = detector.coordinates.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 10) {
        setHoveredDetector(detector.id);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    
    if (!found) {
      setHoveredDetector(null);
      canvas.style.cursor = 'default';
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredDetector(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (simulationActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const level = parkingLevels[currentLevel];
    if (!level) return;
    
    // Check if a detector was clicked
    for (const detector of level.detectors) {
      const dx = detector.coordinates.x - x;
      const dy = detector.coordinates.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 10) {
        activateDetector(detector);
        break;
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Visualisation du Parking</h2>
        
        <div className="flex space-x-2">
          {parkingLevels.map((level) => (
            <button
              key={level.id}
              className={`px-4 py-2 rounded-md ${
                currentLevel === level.id - 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setCurrentLevel(level.id - 1)}
              disabled={simulationActive}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="border border-gray-300 rounded-md"
        />
        
        {!simulationActive && (
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Détecteur normal</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Détecteur en défaut</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Détecteur activé</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        {simulationActive ? (
          <p>Simulation en cours - Niveau {parkingLevels[currentLevel]?.name}</p>
        ) : (
          <p>Cliquez sur un détecteur pour simuler un départ de feu</p>
        )}
      </div>
    </div>
  );
};

export default ParkingVisualization;
