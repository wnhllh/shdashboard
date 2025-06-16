export interface AttackData {
  id: number;
  timestamp: string; // datetime(6)
  request_id: string;
  period_type: 'realtime' | 'day' | 'week' | 'month' | 'quarter' | string; // Allow other strings for flexibility
  internet_total: number;
  internet_blocked: number;
  internet_arrived: number;
  internet_domestic: number;
  internet_abroad: number;
  intranet_total: number;
  intranet_blocked: number;
  intranet_arrived: number;
  threat_level: number;
  is_complete: boolean; // tinyint(1)
  start_time: string; // datetime(6)
  end_time: string; // datetime(6)
  raw_data?: any; // json
  visualization_data?: any; // json

  // Fields for attacked systems data
  attack_target_host_crack?: number;
  attack_target_terminal_attack?: number;
  attack_target_unknown_info?: number;
  attack_target_sensitive_leak?: number;
}

export interface AttackSource {
  id: number;
  source_type: 'domestic' | 'foreign' | string;
  name: string; // e.g., '上海', '美国'
  value: number; // count
  rank: number;
  attack_data_id: number; // FK
}

export interface AttackType {
  id: number;
  name: string; // e.g., 'HTTP_爬虫攻击'
  value: number; // count
  rank: number;
  attack_data_id: number; // FK
}

export interface RealtimeAttack {
  id: number;
  attack_time: string; // datetime(6)
  source_ip: string;
  source_location: string | { city: string; country?: string; lat: number; lng: number }; // For globe visualization
  dest_ip: string;
  dest_location?: { city: string; country?: string; lat: number; lng: number }; // Shanghai
  attack_type: string;
  status: string; // e.g., 'blocked', 'detected'
  attack_data_id: number; // FK
}

export interface SecurityAlert {
  id: number;
  news_id: string;
  title: string;
  content: string; // HTML content
  category: string;
  publish_time: string; // datetime(6)
  creator: string;
  hits: number;
  attack_data_id?: number | null; // FK, nullable
}

export type HistoricalTrend = {
  date: string;
  value: number;
};

export interface Firewall {
  id: string;
  name: string;
  status: 'green' | 'red' | 'yellow';
  desc?: string;
}

export interface HighRiskEvent {
    src_ip: string;
    dst_ip: string;
    alert_type: string;
    alert_level: '高' | '中' | '低';
    attack_status: '成功' | '阻断';
}

// Combined data structure for convenience if needed
export interface DashboardData {
  overallAttackData: AttackData[]; // Could be multiple for trend, or one for 'realtime'
  attackSources: AttackSource[];
  attackTypes: AttackType[];
  realtimeAttacks: RealtimeAttack[];
  securityAlerts: SecurityAlert[];
  historicalTrend?: HistoricalTrend[];
}

// Specific data points from user request
export interface OverallStats {
  totalAttacks: number;
  domesticAttacks: number;
  foreignAttacks: number;
  blockedAttacks: number;
}

export interface AttackSourceInfo {
  topSourceIPs: { ip: string; count: number }[];
  topDomesticSources: { name: string; value: number }[];
  topForeignSources: { name: string; value: number }[];
}

export interface AttackTypeDistribution {
  types: { name: string; value: number }[];
}

export interface AttackedSystemsInfo {
  // Define based on how this data will be derived or structured
  // Example:
  // passwordCracks: number;
  // endpointAttacks: number;
}

export interface AttackHotspot {
  lat: number;
  lng: number;
  country: string;
  city?: string; 
  value: number; 
}

// Types for D3SankeyAttackedSystemsChart
export interface SankeyNode {
  nodeId: string; // Unique identifier for the node
  name: string;   // Display name for the node
  // category?: string; // Optional: for coloring or grouping nodes
}

export interface SankeyLink {
  source: string; // nodeId of the source node
  target: string; // nodeId of the target node
  value: number;  // The value of the flow between source and target
  // You can add other properties like custom styling for specific links
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}
 