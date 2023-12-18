import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="relative h-full">
      <div className="z-80 hidden h-full md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <Sidebar />
      </div>
      <main className="pb-10 md:pl-72">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
