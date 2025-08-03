
export interface DeliverableLink {
  url: string;
  title: string;
}

export function parseDeliverableLinks(deliverableLink: string | null | undefined): DeliverableLink[] {
  if (!deliverableLink) return [];
  
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(deliverableLink);
    
    // New format: object with links and revisionData
    if (parsed && typeof parsed === 'object' && parsed.links && Array.isArray(parsed.links)) {
      return parsed.links.filter(link => link.url && typeof link.url === 'string');
    }
    
    // Legacy format: direct array of links
    if (Array.isArray(parsed)) {
      return parsed.filter(link => link.url && typeof link.url === 'string');
    }
    
    // Legacy format: single link object
    if (parsed.url && typeof parsed.url === 'string') {
      return [parsed];
    }
  } catch {
    // If JSON parsing fails, treat as old format (single string)
    if (typeof deliverableLink === 'string' && deliverableLink.trim()) {
      return [{
        url: deliverableLink.trim(),
        title: 'Shared Link'
      }];
    }
  }
  
  return [];
}

export function stringifyDeliverableLinks(links: DeliverableLink[]): string {
  if (links.length === 0) return '';
  if (links.length === 1 && links[0].title === 'Shared Link') {
    // For backward compatibility, store single links as plain strings if they have default title
    return links[0].url;
  }
  return JSON.stringify(links);
}

export function validateDeliverableLink(url: string): boolean {
  try {
    // If URL doesn't start with protocol, prepend https://
    const urlToValidate = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    new URL(urlToValidate);
    return true;
  } catch {
    return false;
  }
}

export function normalizeDeliverableLink(url: string): string {
  // Add https:// if no protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
