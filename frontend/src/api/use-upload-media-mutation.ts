import { httpClient } from '@/api';
import { useToast } from '@/components/ui';
import { ApiResponseError } from '@/types';
import { formatDate } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUploadMediaMutation(file: FormData) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => {
      return httpClient.post('images/', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      const currentDate = new Date();
      toast({
        title: 'Upload media file successfully',
        description: formatDate(currentDate.toString()),
      });

      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Upload media file failed',
        description: String((error as ApiResponseError).response.data.detail),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}
