import type { UserPhoto } from '../types/state';
import {
  savePhotoBlob,
  deletePhotoBlob,
  loadPhotoIndex,
  savePhotoIndex,
  notifyPhotoChange,
} from './photoStorage';

async function pickFileWeb(): Promise<{ blob: Blob; mimeType: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
      } else {
        resolve(null);
      }
    };
    // Handle cancel — the input won't fire change if cancelled,
    // but we add a focus listener as a fallback
    window.addEventListener('focus', function onFocus() {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!input.files?.length) resolve(null);
      }, 500);
    });
    input.click();
  });
}

async function captureWithCapacitor(): Promise<{ blob: Blob; mimeType: string } | null> {
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
    });
    if (!photo.webPath) return null;
    const resp = await fetch(photo.webPath);
    const blob = await resp.blob();
    return { blob, mimeType: photo.format ? `image/${photo.format}` : 'image/jpeg' };
  } catch {
    return null;
  }
}

async function pickPhoto(): Promise<{ blob: Blob; mimeType: string } | null> {
  // Try Capacitor first, fall back to web file picker
  try {
    const cap = await import('@capacitor/core');
    if (cap.Capacitor.isNativePlatform()) {
      return captureWithCapacitor();
    }
  } catch {
    // Capacitor not available — use web fallback
  }
  return pickFileWeb();
}

export async function capturePhoto(animalId: string, parkId: string): Promise<UserPhoto | null> {
  const result = await pickPhoto();
  if (!result) return null;

  const photo: UserPhoto = {
    id: crypto.randomUUID(),
    animalId,
    parkId,
    timestamp: new Date().toISOString(),
    mimeType: result.mimeType,
  };

  await savePhotoBlob(photo.id, result.blob);

  const index = loadPhotoIndex();
  if (!index[animalId]) index[animalId] = [];
  index[animalId].push(photo);
  savePhotoIndex(index);
  notifyPhotoChange();

  return photo;
}

export async function deletePhoto(animalId: string, photoId: string): Promise<void> {
  await deletePhotoBlob(photoId);

  const index = loadPhotoIndex();
  const list = index[animalId];
  if (list) {
    index[animalId] = list.filter((p) => p.id !== photoId);
    if (index[animalId].length === 0) delete index[animalId];
  }
  savePhotoIndex(index);
  notifyPhotoChange();
}
