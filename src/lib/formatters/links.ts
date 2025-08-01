export const createClientProjectLink = (baseUrl: string, token: string): string => {
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/client/${token}`;
};

export const createContractApprovalLink = (baseUrl: string, token: string): string => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/contract-approval/${token}`;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(normalizeUrl(url));
    return urlObj.hostname;
  } catch {
    return '';
  }
};

export const isValidDeliverableLink = (link: string): boolean => {
  if (!link) return false;
  
  // Check if it's a valid URL
  if (isValidUrl(link)) return true;
  
  // Check if it's a file path or identifier
  if (link.length > 3 && !link.includes(' ')) return true;
  
  return false;
};

export const formatDeliverableLink = (link: string): string => {
  if (!link) return '';
  
  // If it's already a valid URL, return as is
  if (isValidUrl(link)) return link;
  
  // If it looks like a partial URL, add protocol
  if (link.includes('.') && !link.includes(' ')) {
    return normalizeUrl(link);
  }
  
  return link;
};