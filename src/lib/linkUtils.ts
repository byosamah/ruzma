
export interface DeliverableLink {
  url: string;
  title: string;
}

export function parseDeliverableLinks(deliverableLink: string | null | undefined): DeliverableLink[] {
  if (!deliverableLink) return [];
  
  try {
    // Try to parse as JSON array (new format)
    const parsed = JSON.parse(deliverableLink);
    if (Array.isArray(parsed)) {
      return parsed.filter(link => link.url && typeof link.url === 'string');
    }
    // If it's a single object, wrap it in an array
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
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
