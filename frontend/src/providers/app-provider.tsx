import { Toaster } from '@/components/ui';
import { TanstackQueryProvider } from './tanstack-query-provider';

export function AppProvider({ children }: React.PropsWithChildren) {
  return (
    <TanstackQueryProvider>
      {children}
      <Toaster />
    </TanstackQueryProvider>
  );
}
