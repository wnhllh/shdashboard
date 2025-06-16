import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DemoDataItem {
  id: string;
  name: string;
  category: string;
  value: number;
  timestamp: string;
}

const mockCategories = ["Malware Detected", "Login Attempt", "Firewall Block", "Data Exfiltration", "System Scan"];

const generateMockData = (count: number, existingIds: Set<string>): DemoDataItem[] => {
  const newData: DemoDataItem[] = [];
  for (let i = 0; i < count; i++) {
    let newId;
    do {
      newId = `id-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    } while (existingIds.has(newId));
    existingIds.add(newId);

    newData.push({
      id: newId,
      name: `Event ${existingIds.size}`,
      category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
      value: Math.floor(Math.random() * 1000),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
    });
  }
  return newData;
};

const InfiniteScrollList: React.FC = () => {
  const [items, setItems] = useState<DemoDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true); 
  const [existingItemIds, setExistingItemIds] = useState<Set<string>>(new Set());

  const scrollableContainerRef = useRef<HTMLDivElement>(null); 
  const prevIsLoadingRef = useRef<boolean>(false); 

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newItems = generateMockData(20, existingItemIds); 
    setExistingItemIds(new Set(existingItemIds)); 

    if (newItems.length === 0) {
      setHasMore(false);
    } else {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
    if (items.length + newItems.length >= 100) {
        setHasMore(false);
    }

    setIsLoading(false);
  }, [isLoading, hasMore, existingItemIds, items.length]);

  useEffect(() => {
    loadMoreItems();
  }, []); 

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && scrollableContainerRef.current) {
      const container = scrollableContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
    prevIsLoadingRef.current = isLoading;
  }, [items, isLoading]); 

  const observer = React.useRef<IntersectionObserver>();
  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMoreItems]
  );

  return (
    <div 
      className="h-72 flex flex-col text-xs text-slate-300"
    >
      <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-slate-800/70 border-b border-slate-700 font-semibold sticky top-0 z-10">
        <div className="col-span-2 text-sky-400">ID</div>
        <div className="col-span-3 text-sky-400">事件名称</div>
        <div className="col-span-3 text-sky-400">类别</div>
        <div className="col-span-2 text-sky-400 text-right">数值</div>
        <div className="col-span-2 text-sky-400 text-right">时间</div>
      </div>

      <div 
        ref={scrollableContainerRef} 
        className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-1"
      >
        {items.length === 0 && !isLoading && (
           <p className="text-center text-sm text-slate-500 py-10">
            暂无事件数据
          </p>
        )}
        {items.length > 0 && (
          <ul className="space-y-0.5 pt-1"> 
            {items.map((item, index) => {
              const isLastItem = items.length === index + 1;
              return (
                <li 
                  ref={isLastItem ? lastItemRef : null} 
                  key={item.id} 
                  className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-slate-800/40 hover:bg-slate-700/60 rounded transition-colors duration-150 hover:border-l-2 hover:border-transparent hover:border-l-[#00d9ff]/70"
                >
                  <div className="col-span-2 truncate" title={item.id}>{item.id.substring(3, 10)}...</div>
                  <div className="col-span-3 truncate text-sky-300" title={item.name}>{item.name}</div>
                  <div className="col-span-3 truncate text-amber-300" title={item.category}>{item.category}</div>
                  <div className="col-span-2 text-right font-medium text-teal-300">{item.value}</div>
                  <div className="col-span-2 text-right text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isLoading && (
        <p className="text-center text-sm text-slate-400 py-2 border-t border-slate-700/50">
          <span className="animate-pulse">加载更多数据中...</span>
        </p>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-sm text-slate-500 py-2 border-t border-slate-700/50">
          已加载全部数据
        </p>
      )}
    </div>
  );
};

export default InfiniteScrollList;
