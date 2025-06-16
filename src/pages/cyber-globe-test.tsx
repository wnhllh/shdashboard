import React, { useState, useEffect } from 'react';
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

const CyberGlobeTest = () => {
  // 使用硬编码的测试数据，不依赖外部文件
  const testAttackData: AttackData[] = [
    { city: "纽约", country: "美国", lat: 40.7128, lng: -74.0060, value: 85, type: "DDoS" },
    { city: "伦敦", country: "英国", lat: 51.5074, lng: -0.1278, value: 72, type: "Malware" },
    { city: "东京", country: "日本", lat: 35.6762, lng: 139.6503, value: 90, type: "APT" },
    { city: "悉尼", country: "澳大利亚", lat: -33.8688, lng: 151.2093, value: 65, type: "Phishing" },
    { city: "巴黎", country: "法国", lat: 48.8566, lng: 2.3522, value: 78, type: "Ransomware" }
  ];

  console.log('[CyberGlobeTest] Test data prepared:', testAttackData);
  console.log('[CyberGlobeTest] Test data length:', testAttackData.length);

  // 将攻击数据转换为飞线数据
  const arcsData = testAttackData.map(attack => ({
    startLat: attack.lat,
    startLng: attack.lng,
    endLat: 31.2304, // 上海
    endLng: 121.4737, // 上海
    color: attack.value > 80 ? '#ff0000' : attack.value > 60 ? '#ff6666' : '#ff9999',
    label: `${attack.city} -> Shanghai`
  }));

  // 将攻击数据转换为热点数据
  const pointsData: AttackHotspot[] = testAttackData.map(attack => ({
    lat: attack.lat,
    lng: attack.lng,
    country: attack.country,
    city: attack.city,
    value: attack.value
  }));

  console.log('[CyberGlobeTest] Arcs data prepared:', arcsData);
  console.log('[CyberGlobeTest] Arcs data length:', arcsData.length);
  console.log('[CyberGlobeTest] Points data prepared:', pointsData);
  console.log('[CyberGlobeTest] Points data length:', pointsData.length);

  // 检查每个 arc 的内容
  arcsData.forEach((arc, index) => {
    console.log(`[CyberGlobeTest] Arc ${index}:`, arc);
  });

  console.log('[CyberGlobeTest] About to render CyberGlobe with:');
  console.log('[CyberGlobeTest] - arcsData:', arcsData);
  console.log('[CyberGlobeTest] - pointsData:', pointsData);

  return (
    <div className="w-full h-screen bg-black">
      <div className="absolute top-4 left-4 z-10 text-white bg-black bg-opacity-50 p-4 rounded">
        <h2>飞线测试</h2>
        <p>飞线数量: {arcsData.length}</p>
        <p>热点数量: {pointsData.length}</p>
        <p>请查看浏览器控制台以获取详细调试信息</p>
        <div className="mt-2 text-xs">
          <p>arcsData 示例:</p>
          <pre>{JSON.stringify(arcsData[0], null, 2)}</pre>
        </div>
      </div>
      <CyberGlobe 
        arcsData={arcsData}
        pointsData={pointsData}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default CyberGlobeTest; 