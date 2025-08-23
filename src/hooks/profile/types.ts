
export interface ProfileFormData {
  name: string;
  email: string;
  company: string;
  website: string;
  bio: string;
  currency: string;
  country?: string;
  professionalTitle?: string;
  shortBio?: string;
  primaryColor?: string;
  logoUrl?: string;
}

export interface ProfileState {
  isLoading: boolean;
  isSaved: boolean;
  imageToCrop: string | null;
  croppedAreaPixels: { x: number; y: number; width: number; height: number } | null;
}
