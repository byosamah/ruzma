
import { Area } from 'react-easy-crop';

export async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageSrc;
  });

  // Use the crop dimensions directly (should be square from the cropper)
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Clear the canvas with transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  // Calculate center crop coordinates
  const centerX = pixelCrop.x + (pixelCrop.width / 2);
  const centerY = pixelCrop.y + (pixelCrop.height / 2);
  const halfSize = size / 2;

  // Draw the image within the circular clip
  ctx.drawImage(
    image,
    centerX - halfSize,
    centerY - halfSize,
    size,
    size,
    0,
    0,
    size,
    size
  );
  
  console.log('Created circular image with dimensions:', size, 'x', size);
  return canvas.toDataURL('image/png');
}
