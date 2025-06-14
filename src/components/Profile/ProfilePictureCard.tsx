
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
    <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Avatar className="w-32 h-32 mx-auto text-4xl font-bold">
          <AvatarImage src={profilePicture || undefined} alt={userName} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
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
          <Button variant="outline" size="sm" onClick={onUploadClick}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          JPG, PNG or GIF. Max size 2MB.
        </p>
      </CardContent>
    </Card>
  );
};
