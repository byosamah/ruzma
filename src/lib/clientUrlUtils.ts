
import { isUUID } from '@/lib/slugUtils';

export interface ParsedClientToken {
  slug?: string;
  token: string;
  isHybrid: boolean;
}

/**
 * Parses client project URL token which can be either:
 * - Legacy format: full UUID token
 * - Hybrid format: slug-shorttoken (e.g., "project-name-2dd002cb")
 */
export const parseClientToken = (urlToken: string): ParsedClientToken => {
  // Check if it's a full UUID (legacy format)
  if (isUUID(urlToken)) {
    return {
      token: urlToken,
      isHybrid: false
    };
  }

  // Try to parse hybrid format: slug-shorttoken
  const lastDashIndex = urlToken.lastIndexOf('-');
  if (lastDashIndex === -1) {
    // No dash found, treat as legacy token
    return {
      token: urlToken,
      isHybrid: false
    };
  }

  const potentialSlug = urlToken.substring(0, lastDashIndex);
  const potentialShortToken = urlToken.substring(lastDashIndex + 1);

  // Validate that the short token looks like a UUID prefix (8 hex chars)
  const shortTokenRegex = /^[0-9a-f]{8}$/i;
  if (shortTokenRegex.test(potentialShortToken)) {
    return {
      slug: potentialSlug,
      token: potentialShortToken,
      isHybrid: true
    };
  }

  // If parsing fails, treat as legacy token
  return {
    token: urlToken,
    isHybrid: false
  };
};

/**
 * Generates a hybrid client URL token from slug and full token
 */
export const generateHybridToken = (slug: string, fullToken: string): string => {
  const shortToken = fullToken.substring(0, 8);
  return `${slug}-${shortToken}`;
};

/**
 * Extracts the full token from a short token by finding matching projects
 * This is handled on the backend for security
 */
export const expandShortToken = (shortToken: string): string => {
  // This function is mainly for documentation
  // The actual expansion happens on the backend
  return shortToken;
};
