
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ProfilePictureCardProps {
  profilePicture: string | null;
  userName: string;
  onUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const ProfilePictureCard = ({
  profilePicture,
  userName,
  onUploadClick,
  onFileChange,
  fileInputRef,
}: ProfilePictureCardProps) => {
  return (
    <Card className="lg:col-span-1 bg-white/90 backdrop-blur-lg shadow-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-brand-navy">Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Avatar className="w-32 h-32 mx-auto text-4xl font-bold shadow-lg">
          <AvatarImage src={profilePicture || undefined} alt={userName} />
          <AvatarFallback className="bg-gradient-to-r from-brand-blue to-brand-yellow text-white">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
        <div>
          <Button variant="outline" size="sm" onClick={onUploadClick} className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white shadow-md">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
        </div>
        <p className="text-xs text-brand-navy/70">
          JPG, PNG or GIF. Max size 2MB.
        </p>
      </CardContent>
    </Card>
  );
};
