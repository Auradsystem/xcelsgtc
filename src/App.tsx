import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';
import ParkingVisualization from './components/ParkingVisualization';
import ControlPanel from './components/ControlPanel';
import CameraView from './components/CameraView';
import NotificationPanel from './components/NotificationPanel';
import StatisticsPanel from './components/StatisticsPanel';
import ActionPlan from './components/ActionPlan';

const App: React.FC = () => {
  return (
    <SimulationProvider>
      <Layout>
        <div className="flex flex-col lg:flex-row w-full h-full gap-4">
          <div className="flex flex-col w-full lg:w-3/4 gap-4">
            <ParkingVisualization />
            <div className="flex flex-col md:flex-row gap-4">
              <CameraView />
              <StatisticsPanel />
            </div>
          </div>
          <div className="flex flex-col w-full lg:w-1/4 gap-4">
            <ControlPanel />
            <NotificationPanel />
            <ActionPlan />
          </div>
        </div>
      </Layout>
    </SimulationProvider>
  );
};

export default App;
