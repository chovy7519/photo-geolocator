import React, { useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HeightIcon from '@mui/icons-material/Height';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';

export default function PhotoPopupCard({ photo, photoIndex, photoUrl, onClose, onZoom, onDragStart }) {
  if (!photo) return null;

  const handleDragStart = useCallback((e) => {
    if (onDragStart) {
      onDragStart(e, photo);
    } else {
      // fallback: 设置 DownloadURL
      try {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('DownloadURL', `image/jpeg:${photo.文件名}:${photoUrl}`);
        e.dataTransfer.setData('text/uri-list', photoUrl);
      } catch (err) {
        console.warn('拖拽初始化失败:', err);
      }
    }
  }, [photo, photoUrl, onDragStart]);

  const lat = photo.纬度?.toFixed(6) ?? '—';
  const lng = photo.经度?.toFixed(6) ?? '—';
  const time = photo.拍摄时间
    ? new Date(photo.拍摄时间).toLocaleString('zh-CN')
    : '—';
  const alt = photo.海拔 != null ? `${photo.海拔} m` : '—';

  return (
    <div className="photo-popup-card">
      {/* 关闭按钮 */}
      <button className="photo-popup-close" onClick={onClose} title="关闭">
        <CloseIcon fontSize="small" />
      </button>

      {/* 照片区 */}
      <div className="photo-popup-image-wrap">
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt={photo.文件名}
              className="photo-popup-image"
              draggable="true"
              onDragStart={handleDragStart}
              loading="lazy"
            />
            <div className="photo-popup-image-overlay">
              <button
                className="photo-popup-btn photo-popup-btn-zoom"
                onClick={() => onZoom(photoIndex)}
                title="点击放大预览"
              >
                <ZoomInIcon fontSize="small" />
                <span>放大</span>
              </button>
              <div
                className="photo-popup-btn photo-popup-btn-drag"
                draggable="true"
                onDragStart={handleDragStart}
                title="拖拽到文件夹保存"
              >
                <DownloadIcon fontSize="small" />
                <span>保存</span>
              </div>
            </div>
          </>
        ) : (
          <div className="photo-popup-image-empty">
            <span>图片过大或格式不支持预览</span>
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="photo-popup-info">
        <div className="photo-popup-filename" title={photo.文件名}>
          {photo.文件名}
          {photo.手动定位 && (
            <span className="photo-popup-manual-badge">
              <EditLocationAltIcon fontSize="inherit" />
              手动
            </span>
          )}
        </div>

        <div className="photo-popup-meta">
          <div className="photo-popup-meta-item">
            <LocationOnIcon fontSize="inherit" />
            <span>{lat}, {lng}</span>
          </div>
          <div className="photo-popup-meta-item">
            <AccessTimeIcon fontSize="inherit" />
            <span>{time}</span>
          </div>
          {photo.海拔 != null && (
            <div className="photo-popup-meta-item">
              <HeightIcon fontSize="inherit" />
              <span>{alt}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
