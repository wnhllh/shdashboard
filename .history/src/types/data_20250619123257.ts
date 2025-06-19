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

// 工作任务
export interface WorkTask {
  id: string;
  task_id: string;
  title: string;
  description: string; // 说明/摘要
  type: string;
  publish_time: string;
  deadline_time: string;
  feedback_status: '已反馈' | '未反馈';
  feedback_person?: string;
}

// 工作通知
export interface WorkNotification {
  id: string;
  notification_id: string;
  title: string;
  description: string;
  type: string;
  publish_time: string;
}

// 攻击源预警
export interface AttackSourceWarning {
  id: string;
  warning_id: string;
  title: string;
  description: string;
  publish_time: string;
  hits: number;
}

// 漏洞预警
export interface VulnerabilityWarning {
  id: string;
  warning_id: string;
  title: string;
  risk_level: string;
  publisher: string;
  publish_time: string;
  feedback_deadline: string;
  fix_deadline: string;
  fix_feedback_time?: string;
  status: '已完成' | '进行中' | '未开始';
  feedback_person?: string;
}

// 预警通告
export interface WarningAnnouncement {
  id: string;
  announcement_id: string;
  title: string;
  description: string;
  type: string;
  publish_time: string;
  hits: number;
}

export interface ProvinceWarning {
  id: number;
  warning_id: string;
  title: string;
  content: string;
  category: string;
  level: '高' | '中' | '低';
  publish_time: string; // 下发时间
  creator: string;
  deadline_time: string; // 截止时间
  feedback_person?: string; // 反馈人
  is_closed: boolean; // 是否已闭环
  closed_time?: string; // 闭环时间
  closed_by?: string; // 闭环人员
  response_time?: number; // 响应时间（分钟）
  province: string; // 省份
  city?: string; // 城市
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
    id?: number;
    request_id?: string;
    alert_time?: string;
    src_ip: string;
    dst_ip: string;
    alert_type: string;
    alert_level: '高' | '中' | '低';
    attack_status: '成功' | '阻断' | '失败' | string;
}

export interface HostSecurityEvent {
    id: number;
    alert_time: string;
    dst_ip: string;
    alert_type: string;
    alert_level: '高' | '中' | '低';
    attack_status: string;
    log_content?: string;
}

// Combined data structure for convenience if needed
export interface DashboardData {
  overallAttackData: AttackData[]; // Could be multiple for trend, or one for 'realtime'
  attackSources: AttackSource[];
  attackTypes: AttackType[];
  realtimeAttacks: RealtimeAttack[];
  securityAlerts: SecurityAlert[];
  provinceWarnings?: ProvinceWarning[]; // 网省预警数据
  workTasks?: WorkTask[]; // 工作任务
  workNotifications?: WorkNotification[]; // 工作通知
  attackSourceWarnings?: AttackSourceWarning[]; // 攻击源预警
  vulnerabilityWarnings?: VulnerabilityWarning[]; // 漏洞预警
  warningAnnouncements?: WarningAnnouncement[]; // 预警通告
  historicalTrend?: HistoricalTrend[];
  highRiskEvents?: HighRiskEvent[];
  hostSecurityEvents?: HostSecurityEvent[];
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

// 工作进度相关类型定义
export interface WorkTask {
  name: string;
  progress: number;
}

export interface WorkProgressItem {
  id: string;
  title: string;
  progress: number;
  tasks: WorkTask[];
}

export interface WorkProgressData {
  items: WorkProgressItem[];
}
 