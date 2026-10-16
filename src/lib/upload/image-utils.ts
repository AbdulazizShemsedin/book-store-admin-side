/**
 * Utility to process, resize, and convert images client-side before uploading.
 * Ensures strict compliance with backend OpenAPI constraints:
 * - Content-Type MUST be 'image/png' or 'image/jpeg'
 * - Optimizes resolution (max 1200x1200) so payload size stays well below server limits
 */
export async function prepareAvatarFile(file: File): Promise<File> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  const type = file.type.toLowerCase();
  const isPng = type === 'image/png';
  const isJpeg = type === 'image/jpeg' || type === 'image/jpg';

  // Read image dimensions
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      const MAX_DIM = 1200;
      let targetWidth = naturalWidth;
      let targetHeight = naturalHeight;

      if (naturalWidth > MAX_DIM || naturalHeight > MAX_DIM) {
        if (naturalWidth > naturalHeight) {
          targetWidth = MAX_DIM;
          targetHeight = Math.round((naturalHeight * MAX_DIM) / naturalWidth);
        } else {
          targetHeight = MAX_DIM;
          targetWidth = Math.round((naturalWidth * MAX_DIM) / naturalHeight);
        }
      }

      // If it's already JPEG or PNG, within dimensions, and under 2MB, keep original
      if ((isPng || isJpeg) && targetWidth === naturalWidth && targetHeight === naturalHeight && file.size <= 2 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      // Preserve PNG transparency if original is PNG, otherwise use JPEG with white background
      if (isPng) {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.png';
            resolve(new File([blob], cleanName, { type: 'image/png', lastModified: Date.now() }));
          },
          'image/png'
        );
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            resolve(new File([blob], cleanName, { type: 'image/jpeg', lastModified: Date.now() }));
          },
          'image/jpeg',
          0.9
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
