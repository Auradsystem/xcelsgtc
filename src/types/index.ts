export enum SimulationStep {
  IDLE = 'idle',
  DETECTOR_ACTIVATED = 'detector_activated',
  ESSER_PROCESSING = 'esser_processing',
  MOXA_TRANSMISSION = 'moxa_transmission',
  IVPARK_PROCESSING = 'ivpark_processing',
  CAMERA_VERIFICATION = 'camera_verification',
  ALARM_CONFIRMED = 'alarm_confirmed',
}

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  COMPACT = 'compact',
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface ParkingSpot {
  id: string;
  coordinates: Coordinates;
  occupied: boolean;
  angle: number;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  spotId: string;
  color: string;
}

export interface Detector {
  id: string;
  coordinates: Coordinates;
  zone: string;
  status: 'normal' | 'active' | 'fault';
}

export interface Camera {
  id: string;
  coordinates: Coordinates;
  zone: string;
  angle: number;
  imageUrl: string;
}

export interface StructuralElement {
  id: string;
  type: 'column' | 'ramp' | 'elevator' | 'stairs';
  coordinates: Coordinates;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ParkingLevel {
  id: number;
  name: string;
  spots: ParkingSpot[];
  vehicles: Vehicle[];
  detectors: Detector[];
  cameras: Camera[];
  structuralElements: StructuralElement[];
  paths: {
    id: string;
    points: Coordinates[];
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  level: 'info' | 'warning' | 'error' | 'success';
}
