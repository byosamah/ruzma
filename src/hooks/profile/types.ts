
export interface ProfileFormData {
  name: string;
  email: string;
  company: string;
  website: string;
  bio: string;
  currency: string;
  professionalTitle?: string;
  shortBio?: string;
}

export interface ProfileState {
  isLoading: boolean;
  isSaved: boolean;
  imageToCrop: string | null;
  croppedAreaPixels: any | null;
}
