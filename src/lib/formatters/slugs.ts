export const generateSlug = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateUniqueSlug = (name: string, existingSlugs: string[]): string => {
  const baseSlug = generateSlug(name);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
};

export const validateSlug = (slug: string): boolean => {
  if (!slug) return false;
  
  // Check if slug contains only valid characters
  const slugRegex = /^[a-z0-9-]+$/;
  
  return slugRegex.test(slug) && 
         slug.length >= 2 && 
         slug.length <= 100 &&
         !slug.startsWith('-') && 
         !slug.endsWith('-') &&
         !slug.includes('--');
};

export const slugToTitle = (slug: string): string => {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};