import {
  AttackData,
  AttackSource,
  AttackType,
  RealtimeAttack,
  SecurityAlert,
  DashboardData,
  OverallStats,
  AttackSourceInfo,
  AttackTypeDistribution,
  HistoricalTrend,
  HighRiskEvent
} from '@/types/data';
import CacheService from './cacheService';

// --- Service Implementation Switch ---
// Define which service to use for each function.
// Options: 'api' or 'mock'. 'default' is the fallback.
const DATA_SOURCES: { [key: string]: 'api' | 'mock' } = {
  default: 'mock', // 全局mock模式
  // getRealtimeAttacks: 'mock', // 全部接口统一走mock，无需特殊case
};

// 缓存服务实例
const cacheService = CacheService.getInstance();

// Helper to dynamically import the correct service
const getService = (functionName: keyof typeof DATA_SOURCES | 'default') => {
  // 热点数据强制走 mock
  if (functionName === 'getRealtimeAttacks') {
    return import('./mockService');
  }
  const source = DATA_SOURCES[functionName] || DATA_SOURCES.default;
  return source === 'mock' ? import('./mockService') : import('./api');
};

// --- 带缓存的数据获取包装函数 ---
async function fetchWithCache<T>(
  fetchFunction: () => Promise<T>,
  fallbackData?: T | null
): Promise<T | null> {
  try {
    // 尝试从API获取数据
    const data = await fetchFunction();
    return data;
  } catch (error) {
    console.warn('API调用失败，尝试使用缓存数据:', error);
    
    // API失败时，返回fallback数据（通常是null）
    return fallbackData || null;
  }
}

// --- Main Data Service Functions ---
// These functions are the single source of truth for UI components.
// They call the appropriate implementation (mock or real) under the hood.

export const getS6000VisualizationData = async (periodType: string = 'realtime'): Promise<AttackData | null> => {
  // The real-time data interface returns a 404 error, so mock data is used for this specific case.
  if (periodType === 'realtime') {
    const service = await import('./mockService');
    return fetchWithCache(() => service.getS6000VisualizationData(periodType));
  }
  // For other period types, use the real API.
  const service = await import('./api');
  return fetchWithCache(() => service.getS6000VisualizationData(periodType));
};

export const getHistoricalTrend = async (days: number = 7): Promise<HistoricalTrend[]> => {
  const service = await getService('getHistoricalTrend');
  const result = await fetchWithCache(() => service.getHistoricalTrend(days), []);
  return result || [];
};

export const getAttackSources = async (limit: number = 5): Promise<AttackSource[]> => {
  const service = await getService('getAttackSources');
  const result = await fetchWithCache(() => service.getAttackSources(limit), []);
  return result || [];
};

export const getAttackTypes = async (): Promise<AttackType[]> => {
  const service = await getService('getAttackTypes');
  const result = await fetchWithCache(() => service.getAttackTypes(), []);
  return result || [];
};

export const getRealtimeAttacks = async (limit: number = 10): Promise<RealtimeAttack[]> => {
  const service = await getService('getRealtimeAttacks');
  const result = await fetchWithCache(() => service.getRealtimeAttacks(limit), []);
  return result || [];
};

export const getSecurityAlerts = async (limit: number = 10): Promise<SecurityAlert[]> => {
  const service = await getService('getSecurityAlerts');
  const result = await fetchWithCache(() => service.getSecurityAlerts(limit), []);
  return result || [];
};

export const getHighRiskEvents = async (limit: number = 10): Promise<any[]> => {
  const service = await getService('getHighRiskEvents');
  const result = await fetchWithCache(() => service.getHighRiskEvents(limit), []);
  return result || [];
};

// 主机安全事件
export const getHostSecurityEvents = async (limit: number = 10): Promise<any[]> => {
  const service = await getService('getHostSecurityEvents');
  const result = await fetchWithCache(() => service.getHostSecurityEvents(limit), []);
  return result || [];
};

/**
 * 获取所有仪表板数据的主函数，集成了缓存逻辑
 * 首先检查服务器状态，如果不可用则使用缓存数据
 */
export async function getAllDashboardData(): Promise<Partial<DashboardData>> {
  // try {
    // 检查服务器是否可用
    // const isServerAvailable = await cacheService.checkServerHealth();
    
    // if (!isServerAvailable) {
    //   console.log('后端服务器不可用，尝试使用缓存数据');
    //   const cachedData = cacheService.getFromCache();
      
    //   if (cachedData && Object.keys(cachedData).length > 0) {
    //     console.log('使用缓存数据显示仪表板');
    //     return cachedData;
    //   } else {
    //     console.log('没有可用的缓存数据，使用空数据');
    //     return {};
    //   }
    // }

    // 服务器可用，直接获取实时数据（不使用fetchWithCache包装）
    console.log('[DEBUG] Bypassing cache to fetch fresh data.');
    
    try {
      const [
        visualizationData,
        attackSources,
        attackTypes,
        realtimeAttacks,
        securityAlerts,
        historicalTrend,
      ] = await Promise.all([
        getS6000VisualizationData('realtime'),
        (await getService('getAttackSources')).getAttackSources(5),
        (await getService('getAttackTypes')).getAttackTypes(),
        (await getService('getRealtimeAttacks')).getRealtimeAttacks(300), // 请求更多数据
        (await getService('getSecurityAlerts')).getSecurityAlerts(10),
        (await getService('getHistoricalTrend')).getHistoricalTrend(7),
      ]);

      const overallAttackData = visualizationData ? [visualizationData] : [];

      const dashboardData: Partial<DashboardData> = {
        overallAttackData,
        attackSources: attackSources || [],
        attackTypes: attackTypes || [],
        realtimeAttacks: realtimeAttacks || [],
        securityAlerts: securityAlerts || [],
        historicalTrend: historicalTrend || [],
      };

      // 数据获取成功，保存到缓存
      // if (Object.values(dashboardData).some(data => Array.isArray(data) ? data.length > 0 : data !== null)) {
      //   cacheService.saveToCache(dashboardData);
      //   console.log('数据已更新到缓存');
      // }

      console.log('成功获取所有仪表板数据:', dashboardData);
      return dashboardData;
    } catch (apiError) {
      console.error('API调用失败，尝试使用缓存数据:', apiError);
      
      // API调用失败时，尝试使用缓存数据
      const cachedData = cacheService.getFromCache();
      if (cachedData && Object.keys(cachedData).length > 0) {
        console.log('使用缓存数据作为备用');
        return cachedData;
      }
      
      throw apiError; // 重新抛出错误
    }
  // } catch (error) {
  //   console.error("获取仪表板数据时发生错误:", error);
    
  //   // 发生错误时，尝试使用缓存数据
  //   const cachedData = cacheService.getFromCache();
  //   if (cachedData && Object.keys(cachedData).length > 0) {
  //     console.log('使用缓存数据作为备用');
  //     return cachedData;
  //   }
    
  //   return {}; // Return empty or partial data if some fetches fail
  // }
}

/**
 * 手动刷新数据并更新缓存
 */
export async function refreshAndCacheData(): Promise<Partial<DashboardData>> {
  console.log('手动刷新数据...');
  
  try {
    const [
      visualizationData,
      attackSources,
      attackTypes,
      realtimeAttacks,
      securityAlerts,
      historicalTrend,
    ] = await Promise.all([
      getS6000VisualizationData('realtime'),
      getAttackSources(5),
      getAttackTypes(),
      getRealtimeAttacks(10),
      getSecurityAlerts(10),
      getHistoricalTrend(7),
    ]);

    const overallAttackData = visualizationData ? [visualizationData] : [];

    // 新增高危攻击事件和主机安全事件
    const highRiskEvents = await getHighRiskEvents(10);
    const hostSecurityEvents = await getHostSecurityEvents(10);

    const dashboardData: Partial<DashboardData> = {
      overallAttackData,
      attackSources,
      attackTypes,
      realtimeAttacks,
      securityAlerts,
      historicalTrend,
      highRiskEvents,
      hostSecurityEvents,
    };

    // 保存到缓存
    if (Object.values(dashboardData).some(data => Array.isArray(data) ? data.length > 0 : data !== null)) {
      cacheService.saveToCache(dashboardData);
      console.log('手动刷新完成，数据已更新到缓存');
    }

    return dashboardData;
  } catch (error) {
    console.error("手动刷新数据失败:", error);
    throw error;
  }
}

/**
 * 获取缓存服务实例（供其他组件使用）
 */
export function getCacheService(): CacheService {
  return cacheService;
}

// --- Data Transformation and Aggregation Functions ---

export function extractOverallStats(attackDataList: AttackData[]): OverallStats | null {
  const relevantData = attackDataList[0];
  if (!relevantData) return null;

  return {
    totalAttacks: relevantData.internet_total + relevantData.intranet_total,
    domesticAttacks: relevantData.internet_domestic,
    foreignAttacks: relevantData.internet_abroad,
    blockedAttacks: relevantData.internet_blocked + relevantData.intranet_blocked,
  };
}

export function extractAttackSourceInfo(sources: AttackSource[], realtimeAttacks: RealtimeAttack[]): AttackSourceInfo {
  const topDomestic = sources
    .filter(s => s.source_type === 'domestic')
    // .sort((a, b) => a.rank - b.rank) // Rank may not exist in all mock/real data, sort by value instead
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(s => ({ name: s.name, value: s.value }));

  const topForeign = sources
    .filter(s => s.source_type === 'foreign')
    // .sort((a, b) => a.rank - b.rank)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(s => ({ name: s.name, value: s.value }));

  const ipCounts: { [ip: string]: number } = {};
  realtimeAttacks.forEach(attack => {
    ipCounts[attack.source_ip] = (ipCounts[attack.source_ip] || 0) + 1;
  });
  const topSourceIPs = Object.entries(ipCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([ip, count]) => ({ ip, count }));

  return {
    topDomesticSources: topDomestic,
    topForeignSources: topForeign,
    topSourceIPs: topSourceIPs,
  };
}

export function extractAttackTypeDistribution(types: AttackType[]): AttackTypeDistribution {
  // 确保 types 是数组，如果不是则返回空数组
  if (!Array.isArray(types)) {
    console.warn('extractAttackTypeDistribution: Expected array but received:', typeof types, types);
    return { types: [] };
  }
  
  const sortedTypes = types
    // .sort((a, b) => a.rank - b.rank)
    .sort((a, b) => b.value - a.value)
    .map(t => ({ name: t.name, value: t.value }));
  return { types: sortedTypes };
}

// Placeholder for attacked systems - data source is unclear from SQL
// export function extractAttackedSystemsInfo(realtimeAttacks: RealtimeAttack[]): AttackedSystemsInfo {
//   // Logic to derive this info from realtimeAttacks or other sources
//   return {
//     passwordCracks: 122, // example
//     endpointAttacks: 16, // example
//   };
// }

export function extractAttackedSystemsData(attackDataList: AttackData[]): { name: string; value: number }[] {
  const relevantData = attackDataList[0];
  if (!relevantData) return [];

  const attackedSystems: { name: string; value: number }[] = [];

  if (relevantData.attack_target_host_crack !== undefined) {
    attackedSystems.push({ name: '主机口令破解', value: relevantData.attack_target_host_crack });
  }
  if (relevantData.attack_target_terminal_attack !== undefined) {
    attackedSystems.push({ name: '终端攻击', value: relevantData.attack_target_terminal_attack });
  }
  if (relevantData.attack_target_unknown_info !== undefined) {
    attackedSystems.push({ name: '未知信息窃取', value: relevantData.attack_target_unknown_info });
  }
  if (relevantData.attack_target_sensitive_leak !== undefined) {
    attackedSystems.push({ name: '敏感信息泄露', value: relevantData.attack_target_sensitive_leak });
  }

  return attackedSystems.sort((a, b) => b.value - a.value);
}

// Data for Globe Visualization
export function getGlobeArcsData(realtimeAttacks: RealtimeAttack[]): any[] {
  if (!Array.isArray(realtimeAttacks) || realtimeAttacks.length === 0) return [];

  // 按攻击时间降序，取最近的前 5 条
  const sorted = [...realtimeAttacks].sort((a, b) => {
    const ta = new Date(a.attack_time).getTime();
    const tb = new Date(b.attack_time).getTime();
    return tb - ta;
  });

  return sorted.slice(0, 5)
    .map(attack => ({
      startLat: (attack.source_location as any)?.lat,
      startLng: (attack.source_location as any)?.lng,
      endLat: (attack.dest_location as any)?.lat,
      endLng: (attack.dest_location as any)?.lng,
      color: attack.status === 'blocked' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(255, 165, 0, 0.7)',
      label: `${(attack.source_location as any)?.city} -> ${(attack.dest_location as any)?.city}`,
    }))
    .filter(arc => arc.startLat && arc.endLat);
}

export function getAttackTrendData(trendData: HistoricalTrend[]): { date: string, value: number }[] {
    if (!trendData) return [];
    return trendData.map(d => ({
        date: new Date(d.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        value: d.value
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export interface AttackHotspot {
  lat: number;
  lng: number;
  country: string;
  city?: string;
  value: number;
}

export function getAttackHotspotsData(realtimeAttacks: RealtimeAttack[]): AttackHotspot[] {
  if (!realtimeAttacks || realtimeAttacks.length === 0) {
    return [];
  }
  const hotspotCounts: { [key: string]: AttackHotspot } = {};
  realtimeAttacks.forEach(attack => {
    const location = attack.source_location as any;
    if (!location || location.lat === undefined || location.lng === undefined || !location.country) {
        return;
    }
    const key = `${location.lat},${location.lng}`;
    if (!hotspotCounts[key]) {
      hotspotCounts[key] = {
        lat: location.lat,
        lng: location.lng,
        country: location.country,
        city: location.city,
        value: 0,
      };
    }
    hotspotCounts[key].value += 1;
  });
  return Object.values(hotspotCounts);
}

// Data transformation function for high risk events
export function transformHighRiskEvents(apiData: any[]): HighRiskEvent[] {
  if (!Array.isArray(apiData)) {
    console.warn('transformHighRiskEvents: Expected array but received:', typeof apiData, apiData);
    return [];
  }
  
  return apiData.map(item => ({
    src_ip: item.src_ip || '',
    dst_ip: item.dst_ip || '',
    alert_type: item.alert_type || '',
    alert_level: item.alert_level || '低',
    attack_status: item.attack_status || '未知'
  }));
} 