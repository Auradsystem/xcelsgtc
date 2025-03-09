import { ParkingLevel, ParkingSpot, Detector, Camera, StructuralElement, Vehicle, VehicleType, Coordinates } from '../types';

// Helper to generate random integer in range
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random color for vehicles
const getRandomColor = (): string => {
  const colors = ['#1E293B', '#334155', '#475569', '#94A3B8', '#CBD5E1', '#F1F5F9', '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A', '#0891B2', '#2563EB', '#7C3AED', '#C026D3'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate parking spots in a grid pattern
const generateParkingSpots = (levelId: number): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const rows = 8;
  const spotsPerRow = 12;
  const spotWidth = 60;
  const spotHeight = 30;
  const aisleWidth = 80;
  
  // Generate spots in a grid with aisles
  for (let row = 0; row < rows; row++) {
    const isTopSection = row < rows / 2;
    const angle = isTopSection ? 0 : 180;
    
    for (let col = 0; col < spotsPerRow; col++) {
      // Skip some spots to create aisles
      if (col === 3 || col === 9) continue;
      
      const x = col * spotWidth + 50;
      const y = isTopSection 
        ? row * spotHeight + 50 
        : row * spotHeight + 50 + aisleWidth;
      
      spots.push({
        id: `P${levelId}-R${row}-S${col}`,
        coordinates: { x, y },
        occupied: false,
        angle,
      });
    }
  }
  
  return spots;
};

// Generate detectors throughout the parking level
const generateDetectors = (levelId: number, spots: ParkingSpot[]): Detector[] => {
  const detectors: Detector[] = [];
  const zones = ['A', 'B', 'C', 'D'];
  
  // Place detectors in a grid pattern
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * 120 + 100;
      const y = row * 120 + 100;
      const zone = zones[Math.floor((row * 6 + col) / 6)];
      
      detectors.push({
        id: `D${levelId}-${zone}${row * 6 + col + 1}`,
        coordinates: { x, y },
        zone: `P${levelId}-${zone}`,
        status: 'normal',
      });
    }
  }
  
  return detectors;
};

// Generate cameras for each zone
const generateCameras = (levelId: number, detectors: Detector[]): Camera[] => {
  const cameras: Camera[] = [];
  const zones = new Set(detectors.map(d => d.zone));
  
  zones.forEach(zone => {
    // Find center point of all detectors in this zone
    const zoneDetectors = detectors.filter(d => d.zone === zone);
    const centerX = zoneDetectors.reduce((sum, d) => sum + d.coordinates.x, 0) / zoneDetectors.length;
    const centerY = zoneDetectors.reduce((sum, d) => sum + d.coordinates.y, 0) / zoneDetectors.length;
    
    // Add some randomness to camera position
    const x = centerX + randomInt(-50, 50);
    const y = centerY + randomInt(-50, 50);
    
    cameras.push({
      id: `CAM-${zone}`,
      coordinates: { x, y },
      zone,
      angle: randomInt(0, 359),
      imageUrl: `https://source.unsplash.com/800x600/?parking,garage,${levelId}`,
    });
  });
  
  return cameras;
};

// Generate structural elements like columns, ramps, etc.
const generateStructuralElements = (levelId: number): StructuralElement[] => {
  const elements: StructuralElement[] = [];
  
  // Add columns in a grid pattern
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      elements.push({
        id: `COL-${levelId}-${row}-${col}`,
        type: 'column',
        coordinates: { x: col * 120 + 60, y: row * 120 + 60 },
        dimensions: { width: 20, height: 20 },
      });
    }
  }
  
  // Add ramps, elevators, and stairs
  elements.push({
    id: `RAMP-${levelId}-1`,
    type: 'ramp',
    coordinates: { x: 700, y: 250 },
    dimensions: { width: 80, height: 150 },
  });
  
  elements.push({
    id: `ELEVATOR-${levelId}-1`,
    type: 'elevator',
    coordinates: { x: 50, y: 50 },
    dimensions: { width: 40, height: 40 },
  });
  
  elements.push({
    id: `STAIRS-${levelId}-1`,
    type: 'stairs',
    coordinates: { x: 700, y: 50 },
    dimensions: { width: 40, height: 80 },
  });
  
  return elements;
};

// Generate paths for driving lanes
const generatePaths = (levelId: number): { id: string; points: Coordinates[] }[] => {
  const paths = [];
  
  // Main horizontal path
  paths.push({
    id: `PATH-${levelId}-H1`,
    points: [
      { x: 0, y: 200 },
      { x: 800, y: 200 },
    ],
  });
  
  // Main vertical paths
  paths.push({
    id: `PATH-${levelId}-V1`,
    points: [
      { x: 200, y: 0 },
      { x: 200, y: 400 },
    ],
  });
  
  paths.push({
    id: `PATH-${levelId}-V2`,
    points: [
      { x: 600, y: 0 },
      { x: 600, y: 400 },
    ],
  });
  
  return paths;
};

// Generate random vehicles for occupied spots
export const getRandomVehicles = (spotCount: number, occupancyRate: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const occupiedSpots = new Set<number>();
  const vehicleCount = Math.floor(spotCount * occupancyRate);
  
  // Randomly select spots to be occupied
  while (occupiedSpots.size < vehicleCount) {
    const spotIndex = randomInt(0, spotCount - 1);
    occupiedSpots.add(spotIndex);
  }
  
  // Create vehicles for occupied spots
  Array.from(occupiedSpots).forEach(spotIndex => {
    const vehicleTypes = [VehicleType.SEDAN, VehicleType.SUV, VehicleType.COMPACT];
    vehicles.push({
      id: `V-${spotIndex}`,
      type: vehicleTypes[randomInt(0, vehicleTypes.length - 1)],
      spotId: `P-${spotIndex}`,
      color: getRandomColor(),
    });
  });
  
  return vehicles;
};

// Generate a complete parking level
export const generateParkingLevel = (levelId: number): ParkingLevel => {
  const spots = generateParkingSpots(levelId);
  const detectors = generateDetectors(levelId, spots);
  const cameras = generateCameras(levelId, detectors);
  const structuralElements = generateStructuralElements(levelId);
  const paths = generatePaths(levelId);
  const vehicles = getRandomVehicles(spots.length, 0.7); // 70% occupancy
  
  return {
    id: levelId,
    name: `P${levelId}`,
    spots,
    vehicles,
    detectors,
    cameras,
    structuralElements,
    paths,
  };
};
