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
  WorkTask,
  WorkNotification,
  AttackSourceWarning,
  VulnerabilityWarning,
  WarningAnnouncement,
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
            publish_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
            creator: '国家网络安全中心',
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
            publish_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前
            creator: '网络安全应急中心',
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
            publish_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
            creator: '省网络安全中心',
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

        // 工作任务模拟数据
        const mockWorkTasks: WorkTask[] = [
          {
            id: '1',
            task_id: 'RW-20250618-005',
            title: '漏洞自查整改统计',
            description: '各单位：现开展漏洞自查整改情况统计，统计周期为 6 月 12 日至 6 月 18 日，请于 6 月 19 日（本周四）上午反馈',
            type: '安全事件',
            publish_time: '2025-06-18 09:55:24',
            deadline_time: '2025-06-19 08:30:00',
            feedback_status: '已反馈',
            feedback_person: '张安全'
          },
          {
            id: '2',
            task_id: 'RW-20250618-004',
            title: '关于报送封禁 IP 数据的通知',
            description: '各单位：请于本周四 09:00 前按表格模板报送上周四 00:00 至本周四 00:00 外网封禁 IP 详情。注意：1、请严…',
            type: '安全事件',
            publish_time: '2025-06-18 09:28:50',
            deadline_time: '2025-06-19 09:00:00',
            feedback_status: '已反馈',
            feedback_person: '李防护'
          },
          {
            id: '3',
            task_id: 'RW-20250617-004',
            title: '关于做好网络安全联合防御的工作任务·第三十期',
            description: '各单位：为做好网络安全联合防御，及时消除风险隐患，请各单位按照附件《威胁情报（共享至安全）》-第 30…',
            type: '安全事件',
            publish_time: '2025-06-17 10:10:58',
            deadline_time: '2025-06-23 09:00:00',
            feedback_status: '未反馈'
          },
          {
            id: '4',
            task_id: 'RW-20250616-003',
            title: '关于中标麒麟安全邮件服务器系统 SQL 注入漏洞的情况排查',
            description: '近日发现，麒麟软件有限公司研发的中标麒麟安全邮件服务器系统存在 SQL 注入漏洞，攻击者可利用漏洞读取数…',
            type: '安全事件',
            publish_time: '2025-06-16 15:44:20',
            deadline_time: '2025-06-17 14:00:00',
            feedback_status: '已反馈',
            feedback_person: '王监控'
          }
        ];

        // 工作通知模拟数据
        const mockWorkNotifications: WorkNotification[] = [
          {
            id: '1',
            notification_id: 'TZ-20250618-001',
            title: '关于外网邮件强制定期修改密码功能启用的通知',
            description: '各单位：根据公司邮件系统安全管控要求，外网邮件计划于 2025-06-30 开启强制定期更换密码功能',
            type: '事件公告',
            publish_time: '2025-06-18 17:53:30'
          },
          {
            id: '2',
            notification_id: 'TZ-20250613-001',
            title: '关于全网边界扶防措施常态化验证情况及防护建议的通知',
            description: '各单位：根据公司数字化工作安排，为提升各单位边界安全设备防护能力，国网信通公司常态化开展全…',
            type: '事件公告',
            publish_time: '2025-06-13 09:44:55'
          },
          {
            id: '3',
            notification_id: 'TZ-20250612-001',
            title: '关于召开 2025 年第二期网络安全实战对抗方案总结会的通知',
            description: '公司各单位：根据国家电网公司 2025 年网络安全实战对抗工作安排，国网信通公司计划组织…',
            type: '事件公告',
            publish_time: '2025-06-12 16:30:24'
          },
          {
            id: '4',
            notification_id: 'TZ-20250609-001',
            title: '关于下发 5 月公司信息系统网络安全月报的通知',
            description: '各单位：为进一步加强公司网络安全工作，国网数字化部网络安全基础能力提升工作情况制作 5 月公…',
            type: '其他',
            publish_time: '2025-06-09 15:29:27'
          },
          {
            id: '5',
            notification_id: 'TZ-20250606-001',
            title: '关于全网边界扶防措施常态化验证情况及防护建议的通知',
            description: '同 20250613 号，但为 6-06 期常态化验证通报',
            type: '事件公告',
            publish_time: '2025-06-06 08:58:52'
          },
          {
            id: '6',
            notification_id: 'TZ-20250530-001',
            title: '关于全网边界扶防措施常态化验证情况及防护建议的通知',
            description: '同上，为 5-30 期',
            type: '事件公告',
            publish_time: '2025-05-30 10:21:04'
          }
        ];

        // 攻击源预警模拟数据
        const mockAttackSourceWarnings: AttackSourceWarning[] = [
          {
            id: '1',
            warning_id: 'TG-20250618-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250618·第 781 期',
            description: '6 月 18 日监控发现 64 个外网攻击源对公司多家单位…',
            publish_time: '2025-06-18 10:34:53',
            hits: 89
          },
          {
            id: '2',
            warning_id: 'TG-20250613-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250613·第 780 期',
            description: '6 月 13 日监控发现 44 个外网攻击源对公司多家单位…',
            publish_time: '2025-06-13 10:32:30',
            hits: 118
          },
          {
            id: '3',
            warning_id: 'TG-20250611-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250611·第 779 期',
            description: '6 月 11 日监控发现 98 个外网攻击源对公司多家单位的多个外网…',
            publish_time: '2025-06-11 11:31:25',
            hits: 111
          },
          {
            id: '4',
            warning_id: 'TG-20250606-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250606·第 778 期',
            description: '6 月 6 日监控发现 34 个外网攻击源…',
            publish_time: '2025-06-06 11:02:31',
            hits: 133
          },
          {
            id: '5',
            warning_id: 'TG-20250604-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250604·第 777 期',
            description: '6 月 4 日监控发现 71 个外网攻击源…',
            publish_time: '2025-06-04 10:52:21',
            hits: 113
          },
          {
            id: '6',
            warning_id: 'TG-20250530-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250530·第 776 期',
            description: '5 月 30 日监控发现 41 个外网攻击源…',
            publish_time: '2025-05-30 11:04:37',
            hits: 141
          },
          {
            id: '7',
            warning_id: 'TG-20250528-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250528·第 775 期',
            description: '5 月 28 日监控发现 52 个外网攻击源…',
            publish_time: '2025-05-28 11:09:14',
            hits: 149
          },
          {
            id: '8',
            warning_id: 'TG-20250523-001',
            title: '关于封禁部分互联网 IP 地址的公告·20250523·第 774 期',
            description: '5 月 23 日监控发现 62 个外网攻击源…',
            publish_time: '2025-05-23 10:47:04',
            hits: 129
          }
        ];

        // 漏洞预警模拟数据
        const mockVulnerabilityWarnings: VulnerabilityWarning[] = [
          {
            id: '1',
            warning_id: 'YJ-WA-20250613-001',
            title: '预警-WA-20250613国网-001',
            subtitle: '方正畅想全媒采编系统密码重置与 SQL 注入漏洞风险预警',
            risk_level: '八级',
            publisher: '网络安全分析监控中心',
            publish_time: '2025-06-13 17:53:36',
            feedback_deadline: '2025-06-17 17:00',
            fix_deadline: '2025-09-13 17:53:36',
            fix_feedback_time: '2025-06-17 15:32:55',
            status: '已完成',
            feedback_person: '刘思思'
          },
          {
            id: '2',
            warning_id: 'YJ-WA-20250529-004',
            title: '预警-WA-20250529国网-004',
            subtitle: '关于防范"视听木马"病毒的风险预警',
            risk_level: '八级',
            publisher: '网络安全分析监控中心',
            publish_time: '2025-05-29 15:58:28',
            feedback_deadline: '2025-06-03 17:00',
            fix_deadline: '2025-08-29 15:58:28',
            fix_feedback_time: '2025-06-03 15:45:35',
            status: '已完成',
            feedback_person: '刘思思'
          },
          {
            id: '3',
            warning_id: 'YJ-WA-20250529-003',
            title: '预警-WA-20250529国网-003',
            subtitle: '使用 BShare 工具的互联网系统存在被劫持风险预警',
            risk_level: '八级',
            publisher: '网络安全分析监控中心',
            publish_time: '2025-05-29 14:30:11',
            feedback_deadline: '2025-06-03 17:00',
            fix_deadline: '2025-08-29 14:30:11',
            fix_feedback_time: '2025-05-30 17:13:24',
            status: '已完成',
            feedback_person: '刘思思'
          },
          {
            id: '4',
            warning_id: 'YJ-WA-20250529-002',
            title: '预警-WA-20250529国网-002',
            subtitle: 'Ollama 未授权访问漏洞风险预警',
            risk_level: '八级',
            publisher: '网络安全分析监控中心',
            publish_time: '2025-05-29 14:30:10',
            feedback_deadline: '2025-06-03 17:00',
            fix_deadline: '2025-08-29 14:30:10',
            fix_feedback_time: '2025-06-03 15:43:32',
            status: '已完成',
            feedback_person: '刘思思'
          },
          {
            id: '5',
            warning_id: 'YJ-WA-20250529-001',
            title: '预警-WA-20250529国网-001',
            subtitle: 'Foxmail 邮件客户端跨站脚本漏洞预警',
            risk_level: '八级',
            publisher: '网络安全分析监控中心',
            publish_time: '2025-05-29 14:30:09',
            feedback_deadline: '2025-06-03 17:00',
            fix_deadline: '2025-08-29 14:30:09',
            fix_feedback_time: '2025-06-03 15:42:50',
            status: '已完成',
            feedback_person: '刘思思'
          },
          {
            id: '6',
            warning_id: 'YJ-WA-20250522-001',
            title: '预警-WA-20250522国网-001',
            subtitle: '中孚保密检查工具漏洞风险预警',
            risk_level: '八级',
            publisher: '网络安全分析监控中心',
            publish_time: '2025-05-22 18:16:06',
            feedback_deadline: '2025-05-23 17:00',
            fix_deadline: '2025-08-22 18:16:06',
            fix_feedback_time: '2025-05-23 15:57:11',
            status: '已完成',
            feedback_person: '刘思思'
          }
        ];

        // 预警通告模拟数据
        const mockWarningAnnouncements: WarningAnnouncement[] = [
          {
            id: '1',
            announcement_id: 'TG-20250612-001',
            title: '通告-WA-20250612国网-001号-微软 2025 年 6 月补丁日多个产品安全漏洞风险通告',
            description: '微软 2025 年 6 月共发布 76 个漏洞补丁，其中高危 57 个、严重 9 个、低危 1 个',
            type: '漏洞公告',
            publish_time: '2025-06-12 11:31:21',
            hits: 386
          },
          {
            id: '2',
            announcement_id: 'TG-20250611-002',
            title: '通告-WA-20250611国网-001号-Apache Kafka Connect 任意文件读取+远程代码执行漏洞通告',
            description: '2025-06-10 Apache 发布安全公告，修复 Apache Kafka Client…',
            type: '漏洞公告',
            publish_time: '2025-06-11 11:43:04',
            hits: 404
          },
          {
            id: '3',
            announcement_id: 'TG-20250528-005',
            title: '关于 AI 绘图工具 ComfyUI 历史漏洞的预警通告',
            description: 'ComfyUI 存在任意文件读取、远程代码执行等漏洞',
            type: '漏洞公告',
            publish_time: '2025-05-28 17:14:33',
            hits: 284
          },
          {
            id: '4',
            announcement_id: 'TG-20250528-004',
            title: '关于防范 63 款非法拦截伪移动应用的预警通告',
            description: '63 款移动应用存在非法拦截收集个人信息情况…',
            type: '安全事件',
            publish_time: '2025-05-28 17:12:35',
            hits: 220
          },
          {
            id: '5',
            announcement_id: 'TG-20250528-003',
            title: '关于防范电话诈骗攻击的预警通告',
            description: '公安情报显示出现以社工手段实施电话诈骗…',
            type: '安全事件',
            publish_time: '2025-05-28 16:26:09',
            hits: 222
          },
          {
            id: '6',
            announcement_id: 'TG-20250528-002',
            title: '关于由于交易平台存在未授权访问漏洞的风险预警通告',
            description: '监控发现电力交易平台存在未授权访问漏洞…',
            type: '漏洞公告',
            publish_time: '2025-05-28 12:45:50',
            hits: 350
          },
          {
            id: '7',
            announcement_id: 'TG-20250527-002',
            title: '关于针对《紧要·WA-20250425国网001号 Google Chrome 浏览器漏洞》风险紧急防护措施说明',
            description: '已要求浏览器升级至 v117.86 并采取…',
            type: '事件公告',
            publish_time: '2025-05-27 18:17:38',
            hits: 1521
          },
          {
            id: '8',
            announcement_id: 'TG-20250527-001',
            title: '关于 APT 组织"零零客"相关恶意 IP 和域名的通告',
            description: '近期 APT 组织"零零客"频繁对国内涉网资产发起攻击…',
            type: '威胁分析',
            publish_time: '2025-05-27 17:07:35',
            hits: 896
          },
          {
            id: '9',
            announcement_id: 'TG-20250521-004',
            title: '关于广州某社交公司遭攻击的预案预防措施',
            description: '——（底部截取，仅见标题栏）',
            type: '事件公告',
            publish_time: '2025-05-21 18:16:33',
            hits: 1422
          }
        ];

        // 将所有数据添加到dashboardData中
        const dataWithAllMockData = {
          ...data,
          provinceWarnings: mockProvinceWarnings,
          workTasks: mockWorkTasks,
          workNotifications: mockWorkNotifications,
          attackSourceWarnings: mockAttackSourceWarnings,
          vulnerabilityWarnings: mockVulnerabilityWarnings,
          warningAnnouncements: mockWarningAnnouncements
        };

        setDashboardData(dataWithAllMockData); // Store raw data with all mock data

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