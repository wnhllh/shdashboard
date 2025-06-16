import React, { useState, useEffect } from 'react';
import { getCacheService, refreshAndCacheData } from '@/services/dataService';

interface CacheInfo {
  hasCache: boolean;
  cacheAge: number;
  isFresh: boolean;
  size: string;
}

const CacheManager: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const cacheService = getCacheService();

  // 更新缓存信息
  const updateCacheInfo = () => {
    const info = cacheService.getCacheInfo();
    setCacheInfo(info);
  };

  // 检查服务器状态
  const checkServerStatus = async () => {
    setServerStatus('checking');
    try {
      const isOnline = await cacheService.checkServerHealth();
      setServerStatus(isOnline ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  // 手动刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAndCacheData();
      updateCacheInfo();
      await checkServerStatus();
      console.log('数据刷新成功');
    } catch (error) {
      console.error('数据刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 导出缓存数据
  const handleExport = () => {
    cacheService.exportCacheToJSON();
  };

  // 导入缓存数据
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      cacheService.importCacheFromJSON(file)
        .then(() => {
          updateCacheInfo();
          console.log('数据导入成功');
        })
        .catch((error) => {
          console.error('数据导入失败:', error);
        });
    }
  };

  // 清除缓存
  const handleClearCache = () => {
    if (confirm('确定要清除缓存数据吗？这将删除所有本地备份数据。')) {
      cacheService.clearCache();
      updateCacheInfo();
    }
  };

  // 格式化缓存年龄
  const formatCacheAge = (ageMs: number): string => {
    const minutes = Math.floor(ageMs / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  // 页面加载时更新信息
  useEffect(() => {
    updateCacheInfo();
    checkServerStatus();
  }, []);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">数据缓存管理</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            serverStatus === 'online' ? 'bg-green-500' : 
            serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm text-gray-300">
            {serverStatus === 'online' ? '服务器在线' : 
             serverStatus === 'offline' ? '服务器离线' : '检查中...'}
          </span>
        </div>
      </div>

      {/* 缓存状态信息 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">缓存状态</div>
          <div className={`text-lg font-semibold ${
            cacheInfo?.hasCache && cacheInfo?.isFresh ? 'text-green-400' : 
            cacheInfo?.hasCache ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {cacheInfo?.hasCache ? 
              (cacheInfo?.isFresh ? '有效' : '过期') : 
              '无缓存'
            }
          </div>
        </div>
        
        <div className="bg-gray-900 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">缓存大小</div>
          <div className="text-lg font-semibold text-white">
            {cacheInfo?.size || '0 KB'}
          </div>
        </div>

        <div className="bg-gray-900 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">最后更新</div>
          <div className="text-lg font-semibold text-white">
            {cacheInfo?.hasCache ? formatCacheAge(cacheInfo.cacheAge) : '从未'}
          </div>
        </div>

        <div className="bg-gray-900 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">数据源</div>
          <div className="text-lg font-semibold text-white">
            {serverStatus === 'online' ? '实时数据' : '缓存数据'}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm"
        >
          {isRefreshing ? '刷新中...' : '手动刷新'}
        </button>

        <button
          onClick={handleExport}
          disabled={!cacheInfo?.hasCache}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm"
        >
          导出数据
        </button>

        <label className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm cursor-pointer">
          导入数据
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={handleClearCache}
          disabled={!cacheInfo?.hasCache}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm"
        >
          清除缓存
        </button>

        <button
          onClick={checkServerStatus}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
        >
          检查服务器
        </button>
      </div>

      {/* 说明信息 */}
      <div className="mt-4 text-sm text-gray-400">
        <div className="mb-2">
          <strong>说明：</strong>
        </div>
        <ul className="list-disc list-inside space-y-1">
          <li>当后端服务器不可用时，系统会自动切换到缓存数据</li>
          <li>缓存数据每24小时过期，超过7天会被自动清除</li>
          <li>可以导出缓存数据作为备份，也可以导入之前的备份数据</li>
          <li>绿色状态表示服务器在线且缓存新鲜，黄色表示缓存过期，红色表示无缓存</li>
        </ul>
      </div>
    </div>
  );
};

export default CacheManager; 