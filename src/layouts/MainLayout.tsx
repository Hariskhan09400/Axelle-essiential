import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="axelle-sentinel-app min-h-[100dvh] bg-base-950 grid-bg text-base-100">
      <div className="relative flex min-h-[100dvh] w-full overflow-hidden">
        <aside className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </aside>

        <div
          className={`fixed inset-y-0 left-0 z-40 w-[82vw] max-w-[300px] border-r border-base-700 bg-base-900 shadow-2xl transition-transform duration-200 lg:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
        </div>

        <div className="flex min-h-[100dvh] w-full flex-1 flex-col">
          <Header onMenuToggle={() => setMobileSidebarOpen((value) => !value)} />
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-3 lg:pb-6 lg:pt-4">
            <Outlet />
          </main>
        </div>

        <div
          aria-hidden={!mobileSidebarOpen}
          className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden ${mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
