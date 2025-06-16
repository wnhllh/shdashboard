import React from 'react';
import CacheManager from '@/components/CacheManager';

const SettingsPage: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">系统设置</h1>
            <p className="text-gray-400">管理数据缓存和系统配置</p>
          </div>
          
          <CacheManager />
          
          {/* 其他设置选项可以在这里添加 */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">其他设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">自动刷新</div>
                  <div className="text-sm text-gray-400">自动更新仪表板数据</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">刷新间隔</div>
                  <div className="text-sm text-gray-400">数据刷新的时间间隔</div>
                </div>
                <select className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1">
                  <option value="30">30秒</option>
                  <option value="60" selected>1分钟</option>
                  <option value="300">5分钟</option>
                  <option value="600">10分钟</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">暗色主题</div>
                  <div className="text-sm text-gray-400">使用暗色界面主题</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 