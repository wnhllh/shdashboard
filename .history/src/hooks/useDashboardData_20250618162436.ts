import { useState, useEffect } from 'react';
import {
  getAllDashboardData,
  extractOverallStats,
  extractAttackSourceInfo,
  extractAttackTypeDistribution,
  getGlobeArcsData,
  getAttackTrendData,
  extractAttackedSystemsData,
  getAttackHotspotsData,
  getHighRiskEvents,
  transformHighRiskEvents,
  getHostSecurityEvents,
  transformHostSecurityEvents,
} from '@/services/dataService';
import type {
  DashboardData,
  OverallStats,
  AttackSourceInfo,
  AttackTypeDistribution,
  RealtimeAttack,
  AttackData,
  AttackHotspot,
  AttackSource,
  SankeyData,
  HistoricalTrend,
  Firewall,
  HighRiskEvent,
  HostSecurityEvent,
  ProvinceWarning,
} from '@/types/data';

// A helper map for location names to coordinates, can be moved to a config file if it grows
const locationCoordinates: { [key: string]: { lat: number; lng: number; country: string; city?: string } } = {
    "上海": { lat: 31.2304, lng: 121.4737, country: "中国", city: "上海" },
    "广东": { lat: 23.1291, lng: 113.2644, country: "中国", city: "广东" },
    "河北": { lat: 38.0428, lng: 114.5149, country: "中国", city: "河北" },
    "江苏": { lat: 32.0603, lng: 118.7969, country: "中国", city: "江苏" },
    "福建": { lat: 26.0745, lng: 119.2965, country: "中国", city: "福建" },
    "浙江": { lat: 29.1595, lng: 120.0790, country: "中国", city: "浙江" },
    "北京": { lat: 39.9042, lng: 116.4074, country: "中国", city: "北京" },
    "四川": { lat: 30.6570, lng: 104.0660, country: "中国", city: "四川" },
    "香港": { lat: 22.3193, lng: 114.1694, country: "中国", city: "香港" },
    "台湾": { lat: 23.6978, lng: 120.9605, country: "中国", city: "台湾" },
    "美国": { lat: 38.9072, lng: -77.0369, country: "美国" },
    "德国": { lat: 52.5200, lng: 13.4050, country: "德国" },
    "加拿大": { lat: 45.4215, lng: -75.6972, country: "加拿大" },
    "英国": { lat: 51.5074, lng: -0.1278, country: "英国" },
    "日本": { lat: 35.6895, lng: 139.6917, country: "日本" },
    "荷兰": { lat: 52.1326, lng: 5.2913, country: "荷兰" },
    "法国": { lat: 46.2276, lng: 2.2137, country: "法国" },
    "澳大利亚": { lat: -25.2744, lng: 133.7751, country: "澳大利亚" },
    "韩国": { lat: 35.9078, lng: 127.7669, country: "韩国" },
};

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<Partial<DashboardData>>({});

  // Derived states
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [attackSourceInfo, setAttackSourceInfo] = useState<AttackSourceInfo | null>(null);
  const [attackTypeDistribution, setAttackTypeDistribution] = useState<AttackTypeDistribution | null>(null);
  const [attackedSystemsData, setAttackedSystemsData] = useState<{name: string, value: number}[]>([]);
  const [attackHotspots, setAttackHotspots] = useState<AttackHotspot[]>([]);
  const [sankeyAttackedSystemsData, setSankeyAttackedSystemsData] = useState<SankeyData | null>(null);
  const [globeArcs, setGlobeArcs] = useState<any[]>([]);
  const [attackTrend, setAttackTrend] = useState<HistoricalTrend[]>([]);
  const [firewalls, setFirewalls] = useState<Firewall[]>([]);
  const [highRiskEvents, setHighRiskEvents] = useState<HighRiskEvent[]>([]);
  const [hostSecurityEvents, setHostSecurityEvents] = useState<HostSecurityEvent[]>([]);


  useEffect(() => {
    const loadData = async () => {
      // Don't reset loading state on interval updates, only on initial load
      // setIsLoading(true); 
      setError(null);
      try {
        const data = await getAllDashboardData();

        // 模拟网省预警数据
        const mockProvinceWarnings: ProvinceWarning[] = [
          {
            id: 1,
            warning_id: 'WS-2024-001',
            title: '高危漏洞CVE-2024-1234紧急预警',
            content: '发现影响Apache服务器的高危漏洞，请立即修复',
            category: '漏洞预警',
            level: '高',
            publish_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前下发
            deadline_time: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 24小时后截止
            creator: '国家网络安全中心',
            feedback_person: '张安全',
            is_closed: false,
            province: '上海',
            city: '浦东新区'
          },
          {
            id: 2,
            warning_id: 'WS-2024-002',
            title: 'APT组织针对金融行业攻击预警',
            content: '监测到APT组织对金融机构发起定向攻击',
            category: '威胁预警',
            level: '高',
            publish_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前下发
            deadline_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 12小时后截止
            creator: '网络安全应急中心',
            feedback_person: '李防护',
            is_closed: false,
            province: '北京',
            city: '朝阳区'
          },
          {
            id: 3,
            warning_id: 'WS-2024-003',
            title: '勒索软件变种传播预警',
            content: '新型勒索软件变种正在快速传播，请加强防护',
            category: '恶意软件',
            level: '中',
            publish_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前下发
            deadline_time: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(), // 48小时后截止
            creator: '省网络安全中心',
            feedback_person: '王监控',
            is_closed: false,
            province: '广东',
            city: '深圳'
          },
          {
            id: 4,
            warning_id: 'WS-2024-004',
            title: 'DDoS攻击预警已处置完成',
            content: '针对政府网站的DDoS攻击已成功阻断',
            category: 'DDoS攻击',
            level: '中',
            publish_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12小时前
            creator: '省网络安全中心',
            is_closed: true,
            closed_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8小时前闭环
            closed_by: '张三',
            response_time: 240, // 4小时响应时间
            province: '江苏',
            city: '南京'
          },
          {
            id: 5,
            warning_id: 'WS-2024-005',
            title: '钓鱼邮件攻击已处置',
            content: '针对企业员工的钓鱼邮件攻击已成功拦截',
            category: '钓鱼攻击',
            level: '低',
            publish_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24小时前
            creator: '市网络安全中心',
            is_closed: true,
            closed_time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20小时前闭环
            closed_by: '李四',
            response_time: 120, // 2小时响应时间
            province: '浙江',
            city: '杭州'
          },
          {
            id: 6,
            warning_id: 'WS-2024-006',
            title: '数据泄露事件已处置',
            content: '某企业数据库泄露事件已完成调查和修复',
            category: '数据安全',
            level: '高',
            publish_time: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36小时前
            creator: '国家网络安全中心',
            is_closed: true,
            closed_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24小时前闭环
            closed_by: '王五',
            response_time: 720, // 12小时响应时间
            province: '四川',
            city: '成都'
          }
        ];

        // 将网省预警数据添加到dashboardData中
        const dataWithProvinceWarnings = {
          ...data,
          provinceWarnings: mockProvinceWarnings
        };

        setDashboardData(dataWithProvinceWarnings); // Store raw data with province warnings

        // MOCK DATA - This logic should ideally be moved to a component or derived from real data
        const mockFirewalls: Firewall[] = [
            { id: 'fw-001', name: 'FW-CORE-01', status: 'red', desc: '断链' },
            { id: 'fw-002', name: 'FW-BJ-EDGE-02', status: 'red', desc: '断链' },
            { id: 'fw-003', name: 'FW-SH-BRANCH-03', status: 'green' },
            { id: 'fw-004', name: 'FW-GZ-DMZ-04', status: 'green' },
            { id: 'fw-005', name: 'FW-CD-BRANCH-05', status: 'green' },
            { id: 'fw-006', name: 'FW-HZ-EDGE-06', status: 'green' },
        ];
        setFirewalls(mockFirewalls);

        // 获取真实的高危事件数据
        try {
          const rawHighRiskEvents = await getHighRiskEvents(10);
          const transformedHighRiskEvents = transformHighRiskEvents(rawHighRiskEvents);
          setHighRiskEvents(transformedHighRiskEvents);

          const rawHostSecurityEvents = await getHostSecurityEvents(10);
          const transformedHostSecurityEvents = transformHostSecurityEvents(rawHostSecurityEvents);
          setHostSecurityEvents(transformedHostSecurityEvents);
        } catch (error) {
          console.error('Failed to load high risk or host security events:', error);
          // 如果API调用失败，使用空数组
          setHighRiskEvents([]);
          setHostSecurityEvents([]);
        }

        // Process and set derived states
        if (data.overallAttackData) {
          setOverallStats(extractOverallStats(data.overallAttackData as AttackData[]));
          setAttackedSystemsData(extractAttackedSystemsData(data.overallAttackData as AttackData[]));
          
          // MOCK SANKEY DATA - This logic should ideally be moved to a component or derived from real data
          const mockSankeyData: SankeyData = {
            nodes: [
              { nodeId: 'SourceA', name: '攻击源A' }, { nodeId: 'SourceB', name: '攻击源B' },
              { nodeId: 'SourceC', name: '攻击源C' }, { nodeId: 'AttackTypeX', name: '攻击类型X' },
              { nodeId: 'AttackTypeY', name: '攻击类型Y' }, { nodeId: '人事管理系统', name: '人事管理系统' },
              { nodeId: '财务结算平台', name: '财务结算平台' }, { nodeId: '供应链系统', name: '供应链系统' },
              { nodeId: '客户关系管理', name: '客户关系管理' },
            ],
            links: [
              { source: 'SourceA', target: 'AttackTypeX', value: Math.floor(Math.random() * 100) + 20 },
              { source: 'SourceB', target: 'AttackTypeX', value: Math.floor(Math.random() * 80) + 10 },
              { source: 'SourceA', target: 'AttackTypeY', value: Math.floor(Math.random() * 120) + 30 },
              { source: 'SourceC', target: 'AttackTypeY', value: Math.floor(Math.random() * 90) + 15 },
              { source: 'AttackTypeX', target: '人事管理系统', value: Math.floor(Math.random() * 70) + 10 },
              { source: 'AttackTypeX', target: '财务结算平台', value: Math.floor(Math.random() * 60) + 5 },
              { source: 'AttackTypeY', target: '财务结算平台', value: Math.floor(Math.random() * 80) + 10 },
              { source: 'AttackTypeY', target: '供应链系统', value: Math.floor(Math.random() * 100) + 20 },
              { source: 'AttackTypeX', target: '客户关系管理', value: Math.floor(Math.random() * 50) + 5 },
              { source: 'AttackTypeY', target: '客户关系管理', value: Math.floor(Math.random() * 70) + 10 },
            ]
          };
          setSankeyAttackedSystemsData(mockSankeyData);
        }
        if (data.historicalTrend) {
          setAttackTrend(getAttackTrendData(data.historicalTrend));
        }
        if (data.attackSources && data.realtimeAttacks) {
          setAttackSourceInfo(extractAttackSourceInfo(data.attackSources, data.realtimeAttacks as RealtimeAttack[]));
        }
        if (data.attackTypes) {
          setAttackTypeDistribution(extractAttackTypeDistribution(data.attackTypes));
        }
        // 始终基于 realtimeAttacks 生成热点，确保与飞线数据一致
        if (data.realtimeAttacks && data.realtimeAttacks.length > 0) {
          const hotspots = getAttackHotspotsData(data.realtimeAttacks);
          console.log('设置 attackHotspots', hotspots);
          setAttackHotspots(hotspots);
        } else if (data.attackSources && data.attackSources.length > 0) {
          // 退而求其次：根据 attackSources 地名映射
          const hotspotsFromSources: AttackHotspot[] = data.attackSources
            .map((source: AttackSource): AttackHotspot | null => {
              const loc = locationCoordinates[source.name];
              if (loc) {
                return { ...loc, value: source.value };
              }
              return null;
            })
            .filter((hotspot): hotspot is AttackHotspot => hotspot !== null);
          setAttackHotspots(hotspotsFromSources);
        }
        if (data.realtimeAttacks) {
          setGlobeArcs(getGlobeArcsData(data.realtimeAttacks as RealtimeAttack[]));
        }

      } catch (e) {
        console.error("Failed to load or process dashboard data:", e);
        setError("数据加载或处理失败。");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 5 * 60 * 1000); // Refresh data every 5 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return {
    isLoading,
    error,
    dashboardData,
    overallStats,
    attackSourceInfo,
    attackTypeDistribution,
    attackedSystemsData,
    sankeyAttackedSystemsData,
    globeArcs,
    attackTrend,
    attackHotspots,
    firewalls,
    highRiskEvents,
    hostSecurityEvents,
  };
}; 