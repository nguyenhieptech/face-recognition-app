import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileSidebar } from './mobile-sidebar';

export function Navbar() {
  return (
    <div className="flex items-center p-4 shadow-sm">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <Avatar className="hover:cursor-pointer">
          <AvatarImage
            src="https://avatars.githubusercontent.com/u/48057064?v=4"
            alt="Leo Nguyen"
          />
          <AvatarFallback>HN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
