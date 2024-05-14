import { httpClient } from '@/api';
import { useQuery } from '@tanstack/react-query';

export function useMediaFilesQuery() {
  return useQuery({
    queryKey: ['images'],
    queryFn: () => httpClient.get('images'),
  });
}
