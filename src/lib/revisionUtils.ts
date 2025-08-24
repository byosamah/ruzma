import { MilestoneData } from '@/types/common';

export interface RevisionRequest {
  id: string;
  feedback: string;
  images: string[];
  requestedAt: string;
  status: 'pending' | 'addressed';
}

export interface RevisionData {
  maxRevisions: number | null; // null means unlimited
  usedRevisions: number;
  requests: RevisionRequest[];
}

interface RevisionRequestRaw {
  id: string;
  feedback: string;
  images: string[];
  requestedAt?: string;
  timestamp?: string; // Backward compatibility
  status: 'pending' | 'addressed';
}

interface DeliverableLinkData {
  links?: Array<{ url: string; title: string }>;
  revisionData?: RevisionData;
  [key: string]: unknown;
}

export function parseRevisionData(milestone: unknown): RevisionData {
  const milestoneData = milestone as { deliverable_link?: string | null };
  if (!milestoneData.deliverable_link) return defaultRevisionData();
  
  try {
    const parsed = JSON.parse(milestoneData.deliverable_link);
    
    // Handle array format (old format) - no revision data
    if (Array.isArray(parsed)) {
      return defaultRevisionData();
    }
    
    // Handle object format with revision data
    if (parsed.revisionData) {
      
      // Normalize the requests to ensure consistent field names
      const normalizedRequests = parsed.revisionData.requests?.map((request: RevisionRequestRaw) => ({
        ...request,
        // Use requestedAt field, falling back to timestamp for backward compatibility
        requestedAt: request.requestedAt || request.timestamp || new Date().toISOString()
      })) || [];
      
      return {
        maxRevisions: parsed.revisionData.maxRevisions ?? null,
        usedRevisions: parsed.revisionData.usedRevisions ?? 0,
        requests: normalizedRequests
      };
    }
    
    return defaultRevisionData();
  } catch (error) {
    return defaultRevisionData();
  }
}

function defaultRevisionData(): RevisionData {
  return {
    maxRevisions: null,
    usedRevisions: 0,
    requests: []
  };
}

export function stringifyRevisionData(
  originalDeliverableLink: string | null | undefined,
  revisionData: RevisionData
): string {
  try {
    let baseData: DeliverableLinkData = {};
    
    // Try to preserve existing deliverable link data
    if (originalDeliverableLink) {
      try {
        const parsed = JSON.parse(originalDeliverableLink);
        
        // Handle array format (current link format)
        if (Array.isArray(parsed)) {
          baseData = { links: parsed };
        }
        // Handle object format
        else if (typeof parsed === 'object') {
          baseData = parsed;
        }
        // Handle simple string
        else {
          baseData = { links: [{ url: originalDeliverableLink, title: 'Shared Link' }] };
        }
      } catch {
        // If it's not JSON, treat as simple string link
        if (originalDeliverableLink.trim()) {
          baseData = { links: [{ url: originalDeliverableLink, title: 'Shared Link' }] };
        }
      }
    }
    
    // Add revision data
    baseData.revisionData = revisionData;
    
    return JSON.stringify(baseData);
  } catch (error) {
    return JSON.stringify({ revisionData });
  }
}

export function canRequestRevision(revisionData: RevisionData): boolean {
  if (revisionData.maxRevisions === null) return true; // Unlimited
  return revisionData.usedRevisions < revisionData.maxRevisions;
}

export function getRemainingRevisions(revisionData: RevisionData): number | null {
  if (revisionData.maxRevisions === null) return null; // Unlimited
  return Math.max(0, revisionData.maxRevisions - revisionData.usedRevisions);
}

export function addRevisionRequest(
  revisionData: RevisionData,
  feedback: string,
  images: string[]
): RevisionData {
  const newRequest: RevisionRequest = {
    id: crypto.randomUUID(),
    feedback,
    images,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  return {
    ...revisionData,
    usedRevisions: revisionData.usedRevisions + 1,
    requests: [...revisionData.requests, newRequest]
  };
}

export function markRevisionAddressed(
  revisionData: RevisionData,
  requestId: string
): RevisionData {
  return {
    ...revisionData,
    requests: revisionData.requests.map(req =>
      req.id === requestId ? { ...req, status: 'addressed' } : req
    )
  };
}

export function updateMaxRevisions(
  revisionData: RevisionData,
  maxRevisions: number | null
): RevisionData {
  return {
    ...revisionData,
    maxRevisions
  };
}