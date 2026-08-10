import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface CardExportResult {
  success: boolean;
  message: string;
}

/**
 * Downloads or saves a card image canvas.
 * Works seamlessly in both Web Browser / Web Preview and Android Capacitor APK.
 */
export async function downloadCardCanvas(
  canvas: HTMLCanvasElement | null,
  fileName: string = `tasbeeh-card-${Date.now()}.png`
): Promise<CardExportResult> {
  if (!canvas) {
    return { success: false, message: 'تعذر الحصول على صورة البطاقة' };
  }

  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      // 1. Get base64 representation of PNG image
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

      // 2. Save file using Capacitor Filesystem into Directory.Cache
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // 3. Trigger native share/save dialog for the saved image file
      if (fileResult && fileResult.uri) {
        await Share.share({
          title: 'بطاقة دعوية - تطبيق تسبيح',
          text: 'بطاقة دعوية إسلامية من تطبيق تسبيح',
          url: fileResult.uri,
          dialogTitle: 'حفظ أو مشاركة البطاقة'
        });
        return { success: true, message: 'تم فتح نافذة حفظ ومشاركة البطاقة بنجاح' };
      }
    } catch (err) {
      console.error('Native card export failed, trying share fallback:', err);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        await Share.share({
          title: 'بطاقة دعوية - تطبيق تسبيح',
          url: dataUrl,
          dialogTitle: 'حفظ أو مشاركة البطاقة'
        });
        return { success: true, message: 'تم فتح نافذة الحفظ' };
      } catch (fallbackErr) {
        console.error('Native fallback share failed:', fallbackErr);
      }
    }
  }

  // Web Browser / Web Preview Download
  try {
    const dataUrl = canvas.toDataURL('image/png');
    
    // Convert to Blob for safer browser downloading
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return { success: true, message: 'تم تنزيل البطاقة بنجاح' };
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'تم تنزيل البطاقة بنجاح' };
    }
  } catch (err) {
    console.error('Web download failed:', err);
    return { success: false, message: 'حدث خطأ أثناء تنزيل البطاقة' };
  }
}

/**
 * Native share helper for card canvas.
 */
export async function shareCardCanvas(
  canvas: HTMLCanvasElement | null,
  cardText: string,
  cardSource: string
): Promise<CardExportResult> {
  if (!canvas) {
    return { success: false, message: 'تعذر إنشاء البطاقة' };
  }

  const isNative = Capacitor.isNativePlatform();
  const shareMessage = `${cardText}\n— ${cardSource}\nتمت المشاركة عبر تطبيق تسبيح`;

  if (isNative) {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const fileName = `tasbeeh-card-${Date.now()}.png`;

      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'بطاقة دعوية - تطبيق تسبيح',
        text: shareMessage,
        url: fileResult.uri,
        dialogTitle: 'مشاركة البطاقة'
      });
      return { success: true, message: 'تمت المشاركة بنجاح' };
    } catch (err) {
      console.error('Native share failed:', err);
    }
  }

  // Web Share API fallback
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob && navigator.canShare) {
      const file = new File([blob], `tasbeeh-card-${Date.now()}.png`, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'بطاقة دعوية - تطبيق تسبيح',
          text: shareMessage,
          files: [file]
        });
        return { success: true, message: 'تمت المشاركة بنجاح' };
      }
    }

    if (navigator.share) {
      await navigator.share({
        title: 'بطاقة دعوية - تطبيق تسبيح',
        text: shareMessage
      });
      return { success: true, message: 'تمت المشاركة بنجاح' };
    }
  } catch (err) {
    console.log('Web share cancelled or unsupported', err);
  }

  return { success: false, message: 'المشاركة غير مدعومة في هذا المتصفح' };
}
