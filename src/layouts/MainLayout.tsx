import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const wasOpen = useRef(false);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileDrawerRef.current) mobileDrawerRef.current.inert = !mobileSidebarOpen;
    if (!mobileSidebarOpen) {
      if (wasOpen.current) document.getElementById('mobile-menu-trigger')?.focus();
      wasOpen.current = false;
      return;
    }

    wasOpen.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector<HTMLElement>('#mobile-navigation button, #mobile-navigation a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="axelle-sentinel-app min-h-[100dvh] overflow-x-clip bg-base-950 text-base-100">
      <div className="relative flex min-h-[100dvh] w-full overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-30 hidden lg:block ${collapsed ? 'w-16' : 'w-60'}`}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </aside>

        <div
          ref={mobileDrawerRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal={mobileSidebarOpen}
          aria-label="Main navigation"
          aria-hidden={!mobileSidebarOpen}
          className={`fixed inset-y-0 left-0 z-40 w-[min(82vw,300px)] border-r border-base-700 bg-base-900 shadow-2xl transition-transform duration-200 motion-reduce:transition-none lg:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
        </div>

        <div className={`flex min-h-[100dvh] min-w-0 flex-1 flex-col transition-[margin] duration-200 motion-reduce:transition-none ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
          <Header onMenuToggle={() => setMobileSidebarOpen((value) => !value)} />
          <main className="min-w-0 flex-1 overflow-x-clip px-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-3 lg:pb-6 lg:pt-4">
            <Outlet />
          </main>
        </div>

        <div
          aria-hidden={!mobileSidebarOpen}
          className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none lg:hidden ${mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
