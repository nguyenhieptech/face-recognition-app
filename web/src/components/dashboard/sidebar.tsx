import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/",
    color: "text-emerald-500",
  },
];

export function Sidebar() {
  return (
    <div className="flex h-full flex-col space-y-4 bg-slate-900 py-4 text-white">
      <div className="flex-1 px-3 py-2">
        <div className="mb-14 flex items-center pl-3">
          <div className="relative mr-4 h-8 w-8">
            <img alt="Logo" src="/logo.png" className="fil" />
          </div>
          <h1 className="text-xl font-bold">Face Recognition</h1>
        </div>
        <div className="space-y-1">
          {routes.map((route) => (
            <a
              key={route.label}
              href={route.href}
              className={cn(
                "group flex w-full cursor-pointer justify-start rounded-lg p-3 text-sm font-medium transition hover:bg-white/10 hover:text-white"
                // pathname === route.href ? 'bg-white/10 text-white' : 'text-slate-400'
              )}
            >
              <div className="flex flex-1 items-center">
                <route.icon className={cn("mr-3 h-5 w-5", route.color)} />
                {route.label}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
