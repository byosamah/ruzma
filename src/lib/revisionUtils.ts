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

export function parseRevisionData(milestone: any): RevisionData {
  try {
    // Try to parse from deliverable_link if it contains revision data
    if (milestone.deliverable_link) {
      const data = JSON.parse(milestone.deliverable_link);
      if (data.revisionData) {
        return {
          maxRevisions: data.revisionData.maxRevisions ?? null,
          usedRevisions: data.revisionData.usedRevisions ?? 0,
          requests: data.revisionData.requests ?? []
        };
      }
    }
  } catch {
    // If parsing fails, return default
  }
  
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
    let baseData: any = {};
    
    // Try to preserve existing deliverable link data
    if (originalDeliverableLink) {
      try {
        baseData = JSON.parse(originalDeliverableLink);
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
  } catch {
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