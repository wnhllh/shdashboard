import {
  AttackData,
  AttackSource,
  AttackType,
  RealtimeAttack,
  SecurityAlert,
  HistoricalTrend,
} from '@/types/data';

const DATA_BASE_PATH = '/data'; // Path to mock data in the public folder

/**
 * A generic fetcher for local JSON mock data.
 * @param fileName The name of the JSON file to fetch.
 * @returns A promise that resolves with the parsed JSON data.
 */
async function fetchMockData<T>(fileName: string): Promise<T> {
  try {
    // We add a cache-busting query parameter to ensure fresh data in development
    const response = await fetch(`${DATA_BASE_PATH}/${fileName}?_=${new Date().getTime()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch mock data ${fileName}:`, error);
    // Return an empty array as a fallback to prevent crashes
    return [] as T;
  }
}

// --- Mock Service Functions ---
// These functions mimic the real API, but return mock data from local JSON files.

export const getAttackData = (): Promise<AttackData[]> =>
  fetchMockData<AttackData[]>('s6000_attack_data.json');

// This specific function mimics the single-object return of the real getS6000VisualizationData API
export const getS6000VisualizationData = async (periodType: string = 'realtime'): Promise<AttackData | null> => {
    const allData = await getAttackData();
    return allData.find(d => d.period_type === periodType) || null;
}

export const getAttackSources = (): Promise<AttackSource[]> =>
  fetchMockData<AttackSource[]>('s6000_attack_source.json');

export const getAttackTypes = (): Promise<AttackType[]> =>
  fetchMockData<AttackType[]>('s6000_attack_type.json');

export const getSecurityAlerts = (): Promise<SecurityAlert[]> =>
  fetchMockData<SecurityAlert[]>('s6000_security_alert.json');

export const getHighRiskEvents = (limit: number = 10): Promise<any[]> => 
  Promise.resolve([]);

// Mock implementation for historical trend
export const getHistoricalTrend = async (days: number = 7): Promise<HistoricalTrend[]> => {
    const attackDataList = await fetchMockData<AttackData[]>('s6000_attack_data.json');
    // Simple mock logic: create a trend from the 'day', 'week', 'month' data points
    const trend = attackDataList
        .filter(d => ['day', 'week', 'month'].includes(d.period_type))
        .map(d => ({
            date: new Date(d.start_time).toISOString().split('T')[0], // Use YYYY-MM-DD format
            value: d.internet_total + d.intranet_total
        }))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Return a slice based on the 'days' param to simulate the real API
    return trend.slice(-days);
}

function generateMockRealtimeAttacks(total: number = 300): RealtimeAttack[] {
  console.log('生成模拟攻击数据', total);
  const attacks: RealtimeAttack[] = [];
  // 目标坐标——始终指向上海
  const shanghaiLocation = { city: '上海', lat: 31.2304, lng: 121.4737 } as const;

  // 定义几个攻击源聚集区域
  const clusters = [
    {
      // 北美（主要集中区）
      name: 'NorthAmerica',
      count: Math.floor(total * 0.65),
      latRange: [30, 50],
      lngRange: [-125, -65],
    },
    {
      // 欧洲（次级集中区）
      name: 'Europe',
      count: Math.floor(total * 0.25),
      latRange: [43, 55],
      lngRange: [-10, 30],
    },
  ];

  const remaining = total - clusters.reduce((sum, c) => sum + c.count, 0);

  // 生成各聚集区数据
  let idCounter = 1;
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
  const randomIp = () =>
    `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256
    )}.${Math.floor(Math.random() * 256)}`;

  clusters.forEach(cluster => {
    for (let i = 0; i < cluster.count; i++) {
      const lat = randomInRange(cluster.latRange[0], cluster.latRange[1]);
      const lng = randomInRange(cluster.lngRange[0], cluster.lngRange[1]);
      attacks.push({
        id: idCounter++,
        attack_time: new Date(Date.now() - Math.random() * 60 * 1000).toISOString(), // 最近一分钟内
        source_ip: randomIp(),
        source_location: { city: cluster.name, country: cluster.name, lat, lng },
        dest_ip: '101.101.101.101',
        dest_location: { city: '上海', lat: shanghaiLocation.lat, lng: shanghaiLocation.lng },
        attack_type: '自动模拟攻击',
        status: Math.random() > 0.4 ? 'blocked' : 'detected',
        attack_data_id: 0,
      });
    }
  });

  // 生成剩余的随机分布攻击（全球稀疏）
  for (let i = 0; i < remaining; i++) {
    // 球面均匀分布
    const u = Math.random();
    const v = Math.random();
    const lat = Math.asin(2 * v - 1) * (180 / Math.PI); // -90 ~ 90
    const lng = 360 * u - 180; // -180 ~ 180

    attacks.push({
      id: idCounter++,
      attack_time: new Date(Date.now() - Math.random() * 60 * 1000).toISOString(),
      source_ip: randomIp(),
      source_location: { city: 'Global', country: 'Global', lat, lng },
      dest_ip: '101.101.101.101',
      dest_location: { city: '上海', lat: shanghaiLocation.lat, lng: shanghaiLocation.lng },
      attack_type: '自动模拟攻击',
      status: Math.random() > 0.6 ? 'blocked' : 'detected',
      attack_data_id: 0,
    });
  }

  return attacks;
}

export const getRealtimeAttacks = async (limit: number = 300): Promise<RealtimeAttack[]> => {
  const total = Math.max(limit, 300);
  return Promise.resolve(generateMockRealtimeAttacks(total));
}; 