import { z } from 'zod';

// Custom URL validator that accepts URLs with or without protocol
const flexibleUrl = () => z.string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    // Handle empty, undefined, or whitespace
    if (!val || val.trim() === '') return undefined;

    const trimmedVal = val.trim();

    // If it already has a protocol, return as is
    if (trimmedVal.match(/^https?:\/\//i)) {
      return trimmedVal;
    }

    // If it starts with www, add https://
    if (trimmedVal.match(/^www\./i)) {
      return `https://${trimmedVal}`;
    }

    // Otherwise, add https:// to the domain
    return `https://${trimmedVal}`;
  })
  .refine((val) => {
    // Allow empty/undefined values
    if (!val) return true;

    // Validate it's a proper URL after transformation
    try {
      const url = new URL(val);
      // Check that it has a valid hostname
      return url.hostname.includes('.');
    } catch {
      return false;
    }
  }, {
    message: 'Please enter a valid website URL (e.g., example.com or https://example.com)'
  });

export const personalInformationSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  phone: z.string()
    .max(20, 'Phone number is too long')
    .trim()
    .optional(),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .trim()
    .optional(),
  title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .trim()
    .optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .trim()
    .optional(),
});

export const brandingSchema = z.object({
  primary_color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional(),
  logo_url: z.string()
    .url('Please enter a valid URL')
    .optional(),
  company_name: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .trim()
    .optional(),
  website_url: flexibleUrl(),
  social_links: z.object({
    linkedin: flexibleUrl(),
    twitter: flexibleUrl(),
    instagram: flexibleUrl(),
    behance: flexibleUrl(),
    dribbble: flexibleUrl(),
  }).optional(),
});

export type PersonalInformationFormData = z.infer<typeof personalInformationSchema>;
export type BrandingFormData = z.infer<typeof brandingSchema>;