
import { Area } from 'react-easy-crop';

export async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageSrc;
  });

  // Force square dimensions - use the smaller dimension to ensure perfect square
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate center crop coordinates to ensure we get a perfect square
  const centerX = pixelCrop.x + (pixelCrop.width / 2);
  const centerY = pixelCrop.y + (pixelCrop.height / 2);
  const halfSize = size / 2;

  // Draw the image centered and square
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
  
  console.log('Cropped image dimensions:', size, 'x', size);
  return canvas.toDataURL('image/png');
}
