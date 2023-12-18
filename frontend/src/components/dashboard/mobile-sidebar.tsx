import { Sheet, SheetContent, SheetTrigger } from '@/components/ui';
import { Menu } from 'lucide-react';
import { Sidebar } from './sidebar';

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="md:hidden" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
