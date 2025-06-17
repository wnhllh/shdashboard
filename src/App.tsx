import DashboardPage from './pages/DashboardPage';
import DataSourceIndicator from './components/DataSourceIndicator';

function App() {
  return (
    <div className="w-screen h-screen bg-black text-gray-200 flex flex-col items-stretch overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzFiNDg3YiIgc3Ryb2tlLXdpZHRoPSIwLjUiPjxwYXRoIGQ9Ik0wIDYwVjBIMHoiLz48cGF0aCBkPSJNMzAgNjBWMG0zMCAzMEgwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#00a7e1] opacity-5 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#1a46e0] opacity-5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#00d9ff] opacity-5 rounded-full blur-[100px]"></div>

      {/* Data Source Indicator */}
      <DataSourceIndicator />

      {/* Header */}
      <header className="w-full py-4 px-4 text-center shrink-0 bg-[#070e1a]/70 backdrop-blur-md shadow-[0_0_20px_rgba(0,217,255,0.25)] z-10 border-b border-[#1e3a5f]/40">
        <h1 className="text-3xl font-bold tracking-wider text-[#00d9ff] inline-block relative">
          <span className="absolute inset-0 text-[#00d9ff] opacity-30 blur-[3px] animate-pulse">国家电网上海市电力公司网络安全态势</span>
          <span className="relative z-10 bg-gradient-to-r from-[#00f7ff] via-[#00d9ff] to-[#0088ff] text-transparent bg-clip-text flex items-center justify-center">
            国家电网上海市电力公司网络安全态势
          </span>
          <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00d9ff] to-transparent"></div>
        </h1>
      </header>
      
      {/* Main content area now renders the DashboardPage */}
      <DashboardPage />

      {/* Footer can be kept here if it's truly global, or moved to DashboardPage if specific to it */}
      <footer className="w-full h-[0px] shrink-0 p-0 z-10 bg-transparent"></footer>
    </div>
  );
}

export default App;