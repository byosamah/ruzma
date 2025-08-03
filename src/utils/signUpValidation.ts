
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
  country?: string;
}

export const validateSignUpForm = (formData: FormData): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email';
  }
  
  if (!formData.password) {
    newErrors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  // Validate country is required
  if (!formData.country) {
    newErrors.country = 'Country is required';
  }
  
  return newErrors;
};
