
export const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getStorageLimit = (userType: 'free' | 'plus'): number => {
  return userType === 'free' ? 524288000 : 10737418240; // 500MB vs 10GB in bytes
};

export const getProjectLimit = (userType: 'free' | 'plus'): number => {
  return userType === 'free' ? 2 : Infinity;
};
