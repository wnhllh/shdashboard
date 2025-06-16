import { DashboardData } from '@/types/data';

export interface CacheData {
  data: Partial<DashboardData>;
  timestamp: number;
  version: string;
}

class CacheService {
  private static instance: CacheService;
  private readonly CACHE_KEY = 'cybersecurity_dashboard_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存有效期
  private readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 最大7天，超过后清除缓存

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 保存数据到本地缓存
   */
  public saveToCache(data: Partial<DashboardData>): void {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log('数据已保存到本地缓存');
    } catch (error) {
      console.error('保存数据到缓存失败:', error);
    }
  }

  /**
   * 从本地缓存读取数据
   */
  public getFromCache(): Partial<DashboardData> | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        console.log('缓存中没有数据');
        return null;
      }

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      // 检查缓存是否过期
      if (now - cacheData.timestamp > this.MAX_CACHE_AGE) {
        console.log('缓存数据过期，清除缓存');
        this.clearCache();
        return null;
      }

      console.log('从缓存读取数据，数据年龄:', Math.floor((now - cacheData.timestamp) / (60 * 1000)), '分钟');
      return cacheData.data;
    } catch (error) {
      console.error('从缓存读取数据失败:', error);
      return null;
    }
  }

  /**
   * 检查缓存是否新鲜（在有效期内）
   */
  public isCacheFresh(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      return (now - cacheData.timestamp) <= this.CACHE_DURATION;
    } catch (error) {
      console.error('检查缓存新鲜度失败:', error);
      return false;
    }
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('缓存已清除');
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  /**
   * 检测后端服务器是否可用
   */
  public async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      // 使用一个轻量级的现有端点来检查服务器状态
      // 尝试获取attack_types数据，这是一个相对轻量的端点
      const response = await fetch('http://127.0.0.1:8000/dashboard/s6000/attack_types/', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('后端服务器可用');
        return true;
      } else {
        console.log('后端服务器响应异常:', response.status);
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('后端服务器连接超时');
      } else {
        console.log('后端服务器不可用:', error);
      }
      return false;
    }
  }

  /**
   * 导出缓存数据到JSON文件
   */
  public exportCacheToJSON(): void {
    try {
      const cachedData = this.getFromCache();
      if (!cachedData) {
        console.log('没有可导出的缓存数据');
        return;
      }

      const dataStr = JSON.stringify(cachedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cybersecurity_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('缓存数据已导出到JSON文件');
    } catch (error) {
      console.error('导出缓存数据失败:', error);
    }
  }

  /**
   * 从JSON文件导入数据到缓存
   */
  public importCacheFromJSON(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          this.saveToCache(data);
          console.log('数据已从JSON文件导入到缓存');
          resolve();
        } catch (error) {
          console.error('导入数据失败:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('读取文件失败');
        reject(new Error('读取文件失败'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 获取缓存信息
   */
  public getCacheInfo(): { hasCache: boolean; cacheAge: number; isFresh: boolean; size: string } | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return { hasCache: false, cacheAge: 0, isFresh: false, size: '0 KB' };
      }

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - cacheData.timestamp;
      const isFresh = cacheAge <= this.CACHE_DURATION;
      const size = `${Math.round(cached.length / 1024)} KB`;

      return {
        hasCache: true,
        cacheAge,
        isFresh,
        size
      };
    } catch (error) {
      console.error('获取缓存信息失败:', error);
      return null;
    }
  }
}

export default CacheService; 