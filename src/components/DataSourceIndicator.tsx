import React, { useState, useEffect } from 'react';
import { getCacheService } from '@/services/dataService';

const DataSourceIndicator: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  const cacheService = getCacheService();

  const checkStatus = async () => {
    setServerStatus('checking');
    const isOnline = await cacheService.checkServerHealth();
    setServerStatus(isOnline ? 'online' : 'offline');
    
    const info = cacheService.getCacheInfo();
    setCacheInfo(info);
  };

  useEffect(() => {
    checkStatus();
    // 每30秒检查一次服务器状态
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (serverStatus === 'online') return 'bg-green-500';
    if (serverStatus === 'offline' && cacheInfo?.hasCache) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (serverStatus === 'online') return '实时数据';
    if (serverStatus === 'offline' && cacheInfo?.hasCache) return '缓存数据';
    if (serverStatus === 'offline') return '无数据';
    return '检查中...';
  };

  const getDetailText = () => {
    if (serverStatus === 'online') return '连接到后端服务器';
    if (serverStatus === 'offline' && cacheInfo?.hasCache) {
      const minutes = Math.floor(cacheInfo.cacheAge / (60 * 1000));
      const hours = Math.floor(minutes / 60);
      const ageText = hours > 0 ? `${hours}小时前` : `${minutes}分钟前`;
      return `使用本地缓存 (${ageText})`;
    }
    if (serverStatus === 'offline') return '服务器离线，无可用数据';
    return '正在检查连接状态...';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-white font-medium text-sm">{getStatusText()}</span>
          </div>
          
          <div className="text-xs text-gray-400">
            {getDetailText()}
          </div>
        </div>
        
        {serverStatus === 'offline' && cacheInfo?.hasCache && !cacheInfo?.isFresh && (
          <div className="mt-2 text-xs text-yellow-400">
            ⚠️ 缓存数据已过期
          </div>
        )}
        
        {serverStatus === 'offline' && !cacheInfo?.hasCache && (
          <div className="mt-2 text-xs text-red-400">
            ❌ 无可用数据源
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSourceIndicator; 