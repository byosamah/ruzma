import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';
import { User, Mail, Save, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { ImageCropperDialog } from '@/components/ImageCropperDialog';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setProfilePicture(parsedUser.profilePicture || null);
    
    // Initialize form with user data
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      company: parsedUser.company || '',
      website: parsedUser.website || '',
      bio: parsedUser.bio || ''
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate save
    setTimeout(() => {
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsLoading(false);
      setIsSaved(true);
      
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File is too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = async () => {
    if (croppedAreaPixels && imageToCrop) {
        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
            setProfilePicture(croppedImage);

            const updatedUser = { ...user, profilePicture: croppedImage };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error(error);
            toast.error("There was an error cropping the image.");
        } finally {
            setImageToCrop(null);
            if(fileInputRef.current) {
              fileInputRef.current.value = '';
            }
        }
    }
  };

  const onCropCancel = () => {
    setImageToCrop(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
        </div>

        <ImageCropperDialog
          image={imageToCrop}
          onCropComplete={setCroppedAreaPixels}
          onSave={onCropSave}
          onClose={onCropCancel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="w-32 h-32 mx-auto text-4xl font-bold">
                <AvatarImage src={profilePicture || undefined} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <div>
                <Button variant="outline" size="sm" onClick={handleUploadClick}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Your company name"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell clients about yourself and your expertise..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <Separator />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      'Saving...'
                    ) : isSaved ? (
                      'Saved!'
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="font-medium text-slate-800">Change Password</h3>
                <p className="text-sm text-slate-600">Update your account password</p>
              </div>
              <Button variant="outline">Update Password</Button>
            </div>

            <Separator />

            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="font-medium text-slate-800">Email Notifications</h3>
                <p className="text-sm text-slate-600">Manage your notification preferences</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>

            <Separator />

            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="font-medium text-red-600">Delete Account</h3>
                <p className="text-sm text-slate-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
