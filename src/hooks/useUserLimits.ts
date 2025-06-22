
import { useQuery } from '@tanstack/react-query';
import { getUserLimits } from '@/services/userLimitsService';

export const useUserLimits = (userType: string = 'free') => {
  return useQuery({
    queryKey: ['userLimits', userType],
    queryFn: () => getUserLimits(userType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
