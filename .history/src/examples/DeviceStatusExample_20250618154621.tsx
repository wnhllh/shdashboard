import React from 'react';
import DeviceStatusPanel from '../components/DeviceStatusPanel';

const DeviceStatusExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          设备状态监控面板示例
        </h1>
        
        <DeviceStatusPanel />
      </div>
    </div>
  );
};

export default DeviceStatusExample;
