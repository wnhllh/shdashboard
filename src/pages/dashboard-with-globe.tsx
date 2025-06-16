import React from 'react';
import CyberGlobe from '@/components/CyberGlobe';
import type { AttackHotspot } from '@/types/data';

interface AttackData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  value: number;
  type: string;
}

const DashboardWithGlobe = () => {
  const [attackData, setAttackData] = useState<AttackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    // 加载攻击数据
    fetch('/data/attack-data.json')
      .then(res => res.json())
      .then(data => {
        setAttackData(data.attacks || []);
        setMetadata(data.metadata || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load attack data:', err);
        setLoading(false);
      });
  }, []);

  // 将攻击数据转换为飞线数据
  const arcsData = attackData.map(attack => ({
    startLat: attack.lat,
    startLng: attack.lng,
    endLat: 31.2304, // 上海
    endLng: 121.4737, // 上海
    color: attack.value > 80 ? '#ff0000' : attack.value > 60 ? '#ff6666' : '#ff9999',
    label: `${attack.city} -> Shanghai`
  }));

  // 将攻击数据转换为热点数据
  const pointsData: AttackHotspot[] = attackData.map(attack => ({
    lat: attack.lat,
    lng: attack.lng,
    country: attack.country,
    city: attack.city,
    value: attack.value
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className="w-full h-screen bg-black flex">
      {/* 左侧：地球仪 */}
      <div className="flex-1 relative">
        <CyberGlobe 
          arcsData={arcsData}
          pointsData={pointsData}
          width={window.innerWidth * 0.7}
          height={window.innerHeight}
        />
      </div>

      {/* 右侧：统计信息 */}
      <div className="w-80 bg-gray-900 text-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">攻击统计</h2>
        
        {metadata && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-sm text-gray-400">总攻击次数</h3>
              <p className="text-2xl font-bold text-red-500">{metadata.totalAttacks}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-sm text-gray-400">国内攻击</h3>
              <p className="text-xl font-bold text-yellow-500">{metadata.domesticAttacks}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-sm text-gray-400">国外攻击</h3>
              <p className="text-xl font-bold text-orange-500">{metadata.foreignAttacks}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-sm text-gray-400">时间范围</h3>
              <p className="text-sm">{metadata.timeRange}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-sm text-gray-400">主要攻击类型</h3>
              <p className="text-sm">{metadata.topAttackType}</p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold mt-6 mb-3">攻击来源 TOP 10</h3>
        <div className="space-y-2">
          {attackData.slice(0, 10).sort((a, b) => b.value - a.value).map((attack, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded">
              <span className="text-sm">{attack.city}, {attack.country}</span>
              <span className="text-sm font-bold text-red-400">{attack.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardWithGlobe; 