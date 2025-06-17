import React, { useState, useEffect } from 'react';
import type { WorkProgressData } from '@/types/data';

interface WorkProgressChartProps {
  data: WorkProgressData;
  height?: number;
}

const WorkProgressChart: React.FC<WorkProgressChartProps> = ({ data, height = 250 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 根据进度获取颜色
  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return '#00ff88'; // 绿色 - 优秀
    if (progress >= 80) return '#00d9ff'; // 蓝色 - 良好
    if (progress >= 60) return '#ffa500'; // 橙色 - 一般
    return '#ff4757'; // 红色 - 需要关注
  };

  // 获取进度状态文字
  const getProgressStatus = (progress: number): string => {
    if (progress >= 90) return '优秀';
    if (progress >= 80) return '良好';
    if (progress >= 60) return '一般';
    return '待提升';
  };

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === data.items.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // 每4秒切换一次

    return () => clearInterval(interval);
  }, [data.items.length]);

  // 手动切换到下一个/上一个
  const goToNext = () => {
    setCurrentIndex(currentIndex === data.items.length - 1 ? 0 : currentIndex + 1);
  };

  const goToPrev = () => {
    setCurrentIndex(currentIndex === 0 ? data.items.length - 1 : currentIndex - 1);
  };

  // 直接跳转到指定项目
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!data.items.length) return null;

  const currentItem = data.items[currentIndex];

  return (
    <div 
      className="w-full relative"
      style={{ height: `${height}px` }}
    >
      {/* 主内容区域 */}
      <div className="h-full flex flex-col">
        {/* 轮播内容 */}
        <div className="flex-1 overflow-hidden">
          <div 
            className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 h-full flex flex-col transition-all duration-300 hover:border-blue-500/50"
          >
            {/* 主标题和总进度 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">#{currentItem.id}</span>
                <h3 className="text-sm font-medium text-white">{currentItem.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ 
                    color: getProgressColor(currentItem.progress),
                    backgroundColor: `${getProgressColor(currentItem.progress)}20`,
                    border: `1px solid ${getProgressColor(currentItem.progress)}40`
                  }}
                >
                  {getProgressStatus(currentItem.progress)}
                </span>
                <span 
                  className="text-base font-bold"
                  style={{ color: getProgressColor(currentItem.progress) }}
                >
                  {currentItem.progress}%
                </span>
              </div>
            </div>

            {/* 总进度条 */}
            <div className="mb-3">
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${currentItem.progress}%`,
                    backgroundColor: getProgressColor(currentItem.progress),
                    boxShadow: `0 0 8px ${getProgressColor(currentItem.progress)}60`
                  }}
                />
              </div>
            </div>

            {/* 子任务列表 */}
            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-blue-600">
              {currentItem.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 flex-1 pr-2 truncate">{task.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${task.progress}%`,
                          backgroundColor: getProgressColor(task.progress)
                        }}
                      />
                    </div>
                    <span 
                      className="text-xs font-medium w-8 text-right"
                      style={{ color: getProgressColor(task.progress) }}
                    >
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 控制区域 */}
        <div className="flex items-center justify-between mt-2 px-1">
          {/* 左侧箭头 */}
          <button
            onClick={goToPrev}
            className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-blue-400"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 指示器 */}
          <div className="flex items-center gap-1">
            {data.items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-400 w-4' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* 右侧箭头 */}
          <button
            onClick={goToNext}
            className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-blue-400"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 项目计数 */}
        <div className="text-center mt-1">
          <span className="text-xs text-gray-500">
            {currentIndex + 1} / {data.items.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkProgressChart; 