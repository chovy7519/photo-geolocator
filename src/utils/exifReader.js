import exifr from 'exifr';

/**
 *将 GPS 度分秒转换为十进制度数
 */
function dmsToDecimal({ degrees, minutes, seconds }) {
  const d = degrees ?? 0;
  const m = minutes ?? 0;
  const s = seconds ?? 0;
  return d + m / 60 + s / 3600;
}

/**
 * 安全解析 GPS 坐标
 */
function parseGpsValue(raw) {
  if (typeof raw === 'number') return raw;
  if (Array.isArray(raw)) {
    return dmsToDecimal({ degrees: raw[0], minutes: raw[1], seconds: raw[2] });
  }
  return null;
}

/**
 * 从单张照片文件中提取 EXIF 信息
 * @param {File} file - 图片文件对象
 * @returns {Promise<Object>} 照片元数据
 */
export async function extractPhotoMeta(file) {
  const result = {
    文件名: file.name,
    文件大小: file.size,
    最后修改: file.lastModified,
    file,
  };

  try {
    const exif = await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
    });

    if (!exif) {
      result.有GPS = false;
      return result;
    }

    // GPS 坐标
    const lat = parseGpsValue(exif.latitude);
    const lng = parseGpsValue(exif.longitude);
    const latRef = exif.GPSLatitudeRef || (lat >= 0 ? 'N' : 'S');
    const lngRef = exif.GPSLongitudeRef || (lng >= 0 ? 'E' : 'W');

    if (lat != null && lng != null) {
      result.纬度 = latRef === 'S' ? -Math.abs(lat) : Math.abs(lat);
      result.经度 = lngRef === 'W' ? -Math.abs(lng) : Math.abs(lng);
      result.有GPS = true;
    } else {
      result.有GPS = false;
    }

    // 海拔
    if (exif.GPSAltitude != null) {
      result.海拔 = Number(exif.GPSAltitude.toFixed(1));
    }

    // 拍摄时间
    if (exif.DateTimeOriginal) {
      result.拍摄时间 = exif.DateTimeOriginal;
    } else if (exif.CreateDate) {
      result.拍摄时间 = exif.CreateDate;
    } else if (exif.ModifyDate) {
      result.拍摄时间 = exif.ModifyDate;
    }

    // 方向
    if (exif.GPSImgDirection != null) {
      result.方向 = Number(exif.GPSImgDirection.toFixed(1));
    }

    // 设备信息
    if (exif.Make) result.设备厂商 = exif.Make;
    if (exif.Model) result.设备型号 = exif.Model;

    // 图片尺寸
    if (exif.ImageWidth) result.宽度 = exif.ImageWidth;
    if (exif.ImageHeight) result.高度 = exif.ImageHeight;

  } catch (err) {
    console.warn(`读取 ${file.name} EXIF 失败:`, err.message);
    result.有GPS = false;
    result.读取错误 = err.message;
  }

  return result;
}

/**
 * 批量提取文件夹中所有照片的元数据
 * @param {File[]} files - 文件对象数组
 * @param {Function} [onProgress] - 进度回调 (current, total)
 * @returns {Promise<Object[]>} 照片元数据数组
 */
export async function batchExtractMeta(files, onProgress) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/heic', 'image/heif'];
  const filtered = files.filter((f) => supportedTypes.includes(f.type));

  const results = [];
  for (let i = 0; i < filtered.length; i++) {
    const meta = await extractPhotoMeta(filtered[i]);
    results.push(meta);
    onProgress?.(i + 1, filtered.length);
    // 让出主线程，避免阻塞 UI
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return results;
}
