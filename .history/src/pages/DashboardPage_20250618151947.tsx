import { useDashboardData } from '@/hooks/useDashboardData';
import LeftSidebar from './DashboardPage/LeftSidebar';
import MainContent from './DashboardPage/MainContent';
import RightSidebar from './DashboardPage/RightSidebar';
import LeftTopBar from './DashboardPage/LeftTopBar';

const LEFT_TOP_BAR_WIDTH = '18%';
const LEFT_SIDEBAR_WIDTH = '18%';
const RIGHT_SIDEBAR_WIDTH = '25%';

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
    <main className="flex-grow w-full flex items-stretch p-3 overflow-hidden z-10 bg-black">
      <LeftTopBar 
        width={LEFT_TOP_BAR_WIDTH}
        sankeyAttackedSystemsData={sankeyAttackedSystemsData}
        attackTypeDistribution={attackTypeDistribution}
      />
      <LeftSidebar 
        width={LEFT_SIDEBAR_WIDTH}
        overallStats={overallStats}
        attackSourceInfo={attackSourceInfo}
      />
      <MainContent 
        isLoading={isLoading}
        globeArcs={globeArcs}
        attackHotspots={attackHotspots}
        attackTrend={attackTrend}
        attackSourceInfo={attackSourceInfo}
      />
      <RightSidebar 
        width={RIGHT_SIDEBAR_WIDTH}
        dashboardData={dashboardData}
        highRiskEvents={highRiskEvents}
      />
    </main>
  );
};

export default DashboardPage; 