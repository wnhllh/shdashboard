import { useDashboardData } from '@/hooks/useDashboardData';
import LeftSidebar from './DashboardPage/LeftSidebar';
import MainContent from './DashboardPage/MainContent';
import RightSidebar from './DashboardPage/RightSidebar';

const DashboardPage = () => {
  const { 
    isLoading, 
    error, 
    dashboardData,
    overallStats,
    attackSourceInfo,
    attackTypeDistribution,
    sankeyAttackedSystemsData,
    globeArcs,
    attackTrend,
    attackHotspots,
    firewalls,
    highRiskEvents,
  } = useDashboardData();

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center text-2xl text-slate-400">加载中...</div>;
  }

  if (error) {
    return <div className="w-full h-full flex items-center justify-center text-2xl text-red-500">{error}</div>;
  }

  return (
    <main className="flex-grow w-full flex items-stretch p-3 gap-3 overflow-hidden z-10">
      <LeftSidebar 
        overallStats={overallStats}
        attackSourceInfo={attackSourceInfo}
        firewalls={firewalls}
      />
      <MainContent 
        isLoading={isLoading}
        globeArcs={globeArcs}
        attackHotspots={attackHotspots}
        attackTrend={attackTrend}
        attackSourceInfo={attackSourceInfo}
      />
      <RightSidebar 
        sankeyAttackedSystemsData={sankeyAttackedSystemsData}
        attackTypeDistribution={attackTypeDistribution}
        dashboardData={dashboardData}
        highRiskEvents={highRiskEvents}
      />
    </main>
  );
};

export default DashboardPage; 