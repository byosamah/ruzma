import { useQuery } from '@tanstack/react-query';
import { deepSeekService } from '@/services/ai/DeepSeekService';
import { createAIUsageService } from '@/services/ai/AIUsageService';
import { useAuth } from '@/hooks/core/useAuth';
import type { DatabaseProject } from '@/hooks/projectTypes';

interface ProjectType {
  label: string;
  value: number;
  emoji: string;
}

interface AIProjectTypesData {
  projectTypes: ProjectType[];
  isLoading: boolean;
  error: string | null;
  canUseAI: boolean;
  upgradeRequired: boolean;
  usageInfo?: {
    usageCount: number;
    limit: number;
  };
}

export const useAIProjectTypes = (projects: DatabaseProject[]): AIProjectTypesData => {
  const { user } = useAuth();
  
  // Prepare project data for AI analysis
  const projectsForAnalysis = projects.map(project => ({
    name: project.name || 'Untitled Project',
    brief: project.brief || project.description || ''
  }));

  // Check AI usage permissions
  const usageService = createAIUsageService(user);
  
  const { data: usageCheck } = useQuery({
    queryKey: ['ai-usage-check', user?.id, 'project_types'],
    queryFn: () => usageService.canMakeAICall('project_types'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for AI-powered project type analysis
  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-project-types', projectsForAnalysis],
    queryFn: async () => {
      const result = await deepSeekService.analyzeProjectTypes(projectsForAnalysis);
      // Record usage after successful call
      await usageService.recordAIUsage('project_types');
      return result;
    },
    enabled: projects.length > 0 && usageCheck?.canCall === true,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - cache for full day after one call
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1, // Reduced retries to avoid multiple usage recordings
    onError: (error: any) => {
      console.error('AI project type analysis failed:', error);
    }
  });

  // Create basic fallback project types based on actual projects
  const createFallbackProjectTypes = (): ProjectType[] => {
    if (projects.length === 0) {
      return []; // Return empty array to show "no data" message
    }

    // Extract actual keywords from project names and descriptions
    const keywordCounts = new Map<string, number>();
    
    projects.forEach(project => {
      const name = project.name || '';
      const brief = project.brief || project.description || '';
      
      // Combine and clean text
      const text = `${name} ${brief}`.toLowerCase();
      
      // Extract meaningful keywords (skip common words)
      const words = text
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && // Skip short words
          !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'are', 'was', 'will', 'can', 'project'].includes(word)
        );

      // Count unique meaningful keywords
      const uniqueWords = [...new Set(words)];
      uniqueWords.forEach(word => {
        const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
        keywordCounts.set(capitalizedWord, (keywordCounts.get(capitalizedWord) || 0) + 1);
      });
    });

    // Convert to project types, sorted by frequency
    const sortedKeywords = Array.from(keywordCounts.entries())
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .slice(0, 8) // Limit to top 8 keywords
      .map(([keyword, count]) => ({
        label: keyword,
        value: count,
        emoji: getKeywordEmoji(keyword)
      }));

    // If no meaningful keywords found, show generic categories
    if (sortedKeywords.length === 0) {
      return [
        { label: 'General Projects', value: projects.length, emoji: '📁' }
      ];
    }

    return sortedKeywords;
  };

  const getKeywordEmoji = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();
    
    // Common project keywords and their emojis
    if (lowerKeyword.includes('web') || lowerKeyword.includes('website')) return '🌐';
    if (lowerKeyword.includes('design') || lowerKeyword.includes('ui') || lowerKeyword.includes('ux')) return '🎨';
    if (lowerKeyword.includes('mobile') || lowerKeyword.includes('app')) return '📱';
    if (lowerKeyword.includes('brand') || lowerKeyword.includes('logo')) return '🎯';
    if (lowerKeyword.includes('market') || lowerKeyword.includes('seo')) return '📊';
    if (lowerKeyword.includes('ecommerce') || lowerKeyword.includes('shop') || lowerKeyword.includes('store')) return '🛒';
    if (lowerKeyword.includes('blog') || lowerKeyword.includes('content') || lowerKeyword.includes('writing')) return '✍️';
    if (lowerKeyword.includes('development') || lowerKeyword.includes('code') || lowerKeyword.includes('software')) return '💻';
    if (lowerKeyword.includes('business') || lowerKeyword.includes('corporate')) return '🏢';
    if (lowerKeyword.includes('portfolio') || lowerKeyword.includes('showcase')) return '🖼️';
    if (lowerKeyword.includes('landing') || lowerKeyword.includes('page')) return '📄';
    if (lowerKeyword.includes('restaurant') || lowerKeyword.includes('food')) return '🍽️';
    if (lowerKeyword.includes('travel') || lowerKeyword.includes('booking')) return '✈️';
    if (lowerKeyword.includes('health') || lowerKeyword.includes('medical')) return '🏥';
    if (lowerKeyword.includes('education') || lowerKeyword.includes('learning')) return '🎓';
    if (lowerKeyword.includes('finance') || lowerKeyword.includes('banking')) return '💳';
    if (lowerKeyword.includes('real') && lowerKeyword.includes('estate')) return '🏠';
    if (lowerKeyword.includes('photography') || lowerKeyword.includes('photo')) return '📸';
    if (lowerKeyword.includes('music') || lowerKeyword.includes('audio')) return '🎵';
    if (lowerKeyword.includes('video') || lowerKeyword.includes('media')) return '🎬';
    if (lowerKeyword.includes('game') || lowerKeyword.includes('gaming')) return '🎮';
    if (lowerKeyword.includes('social') || lowerKeyword.includes('community')) return '👥';
    if (lowerKeyword.includes('dashboard') || lowerKeyword.includes('admin')) return '📊';
    if (lowerKeyword.includes('api') || lowerKeyword.includes('backend')) return '🔧';
    if (lowerKeyword.includes('client') || lowerKeyword.includes('customer')) return '👤';
    
    // Default emoji based on first letter
    const firstChar = keyword.charAt(0).toUpperCase();
    const letterEmojis: { [key: string]: string } = {
      'A': '🅰️', 'B': '🅱️', 'C': '🌀', 'D': '💎', 'E': '⚡', 'F': '🔥',
      'G': '🌟', 'H': '🏠', 'I': '💡', 'J': '💎', 'K': '🔑', 'L': '🚀',
      'M': '📱', 'N': '🆕', 'O': '🔘', 'P': '📌', 'Q': '❓', 'R': '🚀',
      'S': '⭐', 'T': '🎯', 'U': '🔄', 'V': '✅', 'W': '🌐', 'X': '❌',
      'Y': '💛', 'Z': '⚡'
    };
    
    return letterEmojis[firstChar] || '🔖';
  };

  // Determine project types to show
  let projectTypesToShow: ProjectType[];
  
  if (usageCheck?.canCall === true && data) {
    // Show AI results
    projectTypesToShow = data;
  } else {
    // Show fallback for free users or when AI is not available
    projectTypesToShow = createFallbackProjectTypes();
  }

  return {
    projectTypes: projectTypesToShow,
    isLoading: isLoading || (!usageCheck && !!user),
    error: error ? String(error) : null,
    canUseAI: usageCheck?.canCall || false,
    upgradeRequired: usageCheck?.upgradeRequired || false,
    usageInfo: usageCheck?.usageCount !== undefined && usageCheck?.limit !== undefined ? {
      usageCount: usageCheck.usageCount,
      limit: usageCheck.limit
    } : undefined
  };
};