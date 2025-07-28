
/**
 * Image Service for handling base64 images
 */

// Maximum file size for base64 encoding (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Convert a file to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`Размер файла не должен превышать ${MAX_FILE_SIZE / (1024 * 1024)}МБ`));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Check if a string is a valid base64 image
 */
export const isBase64Image = (str: string): boolean => {
  if (!str) return false;
  const regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  return regex.test(str);
};

/**
 * Get file extension from a base64 string
 */
export const getBase64Extension = (base64: string): string | null => {
  const match = base64.match(/^data:image\/(\w+);base64,/);
  return match ? match[1] : null;
};

/**
 * Resize a base64 image
 */
export const resizeBase64Image = (
  base64: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the extension from the original base64
      const extension = getBase64Extension(base64) || 'jpeg';
      resolve(canvas.toDataURL(`image/${extension}`));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  });
};

/**
 * Convert a base64 string to a Blob
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};
