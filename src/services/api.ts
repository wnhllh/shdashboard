declare global {
  interface Window {
    allApiResponses: Record<string, any>;
  }
}

import { 
  AttackData,
  AttackSource,
  AttackType,
  RealtimeAttack,
  SecurityAlert,
  HistoricalTrend,
} from '@/types/data';

const API_BASE_URL = 'http://127.0.0.1:8000/dashboard'; // Backend API base URL

interface ApiFetchOptions {
  isDataEnveloped?: boolean;
}

/**
 * A generic fetch function to interact with the backend API.
 * It handles URL construction, error handling, and data enveloping.
 * @param endpoint The API endpoint (e.g., '/sources/').
 * @param params Query parameters for the request.
 * @param options Options to control fetch behavior.
 * @returns A promise that resolves with the fetched data.
 */
async function apiFetch<T>(endpoint: string, params: Record<string, any> = {}, options: ApiFetchOptions = {}): Promise<T> {
  const { isDataEnveloped = true } = options;
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  console.log(`开始API调用: ${url.toString()}`);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      // Create a detailed error message
      const errorBody = await response.text();
      console.error(`API调用失败: ${response.status} ${response.statusText}`, {
        url: url.toString(),
        body: errorBody,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`API调用成功: ${endpoint}`, { 
      url: url.toString(), 
      dataEnveloped: isDataEnveloped,
      resultKeys: Object.keys(result),
      dataLength: Array.isArray(result) ? result.length : (result.data && Array.isArray(result.data) ? result.data.length : 'N/A')
    });

    // === 自动收集所有API真实返回数据 ===
    if (typeof window !== 'undefined') {
      window.allApiResponses = window.allApiResponses || {};
      window.allApiResponses[url.toString()] = result;
    }
    // === END ===
    // Some backend endpoints wrap list data in a 'data' property.
    return isDataEnveloped ? result.data : result;
  } catch (error) {
    console.error(`API调用失败 ${endpoint}:`, {
      url: url.toString(),
      error: error instanceof Error ? error.message : error
    });
    // Re-throw the error to be caught by the calling function or a global error handler
    throw error;
  }
}

// --- API Service Functions ---
// Each function corresponds to a backend endpoint.

/**
 * 获取主机安全事件
 * @param limit 事件数量限制
 * @returns 主机安全事件列表
 */
export async function getHostSecurityEvents(limit: number = 10): Promise<any[]> {
  return apiFetch<any[]>('/host-security-events/', { limit });
}


export const getS6000VisualizationData = (periodType: string = 'realtime'): Promise<AttackData | null> => 
  apiFetch<AttackData | null>(`/data/`, { period_type: periodType }, { isDataEnveloped: false });

export const getHistoricalTrend = (days: number = 7): Promise<HistoricalTrend[]> => 
  apiFetch<HistoricalTrend[]>(`/trend/`, { days });

export const getAttackSources = (limit: number = 5): Promise<AttackSource[]> => 
  apiFetch<AttackSource[]>(`/sources/`, { limit });

export const getAttackTypes = (): Promise<AttackType[]> => 
  apiFetch<AttackType[]>(`/s6000/attack_types/`, {}, { isDataEnveloped: true });

export const getRealtimeAttacks = (limit: number = 10): Promise<RealtimeAttack[]> => 
  apiFetch<RealtimeAttack[]>(`/realtime/`, { limit });

export const getSecurityAlerts = (limit: number = 10): Promise<SecurityAlert[]> => 
  apiFetch<SecurityAlert[]>(`/s6000/security_alerts/`, { limit }, { isDataEnveloped: true });

export const getHighRiskEvents = (limit: number = 10): Promise<any[]> => 
  apiFetch<any[]>(`/yjpt/high_risk/`, { limit }, { isDataEnveloped: true }); 