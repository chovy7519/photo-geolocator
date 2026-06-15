import React, { useState, useRef, useCallback, useEffect } from 'react';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HeightIcon from '@mui/icons-material/Height';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';

export default function PhotoPreview({ photo, photoUrl, onOpenLightbox }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // 重置缩放和位置当照片变化时
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photo?.文件名]);

  // 滚轮缩放
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((prev) => {
      const newScale = Math.max(0.5, Math.min(8, prev + delta));
      return newScale;
    });
  }, []);

  // 拖拽开始
  const handleMouseDown = useCallback((e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  // 拖拽中
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  // 拖拽结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  if (!photo) {
    return (
      <div className="photo-preview-empty">
        <div className="photo-preview-empty-icon">🖼️</div>
        <div className="photo-preview-empty-text">点击照片查看预览</div>
      </div>
    );
  }

  const lat = photo.纬度?.toFixed(6) ?? '—';
  const lng = photo.经度?.toFixed(6) ?? '—';
  const time = photo.拍摄时间
    ? new Date(photo.拍摄时间).toLocaleString('zh-CN')
    : '—';
  const alt = photo.海拔 != null ? `${photo.海拔} m` : '—';

  return (
    <div className="photo-preview">
      {/* 工具栏 */}
      <div className="photo-preview-toolbar">
        <div className="photo-preview-title">
          <span>🖼️ 图像预览</span>
          {photo.手动定位 && (
            <span className="photo-preview-manual-badge">
              <EditLocationAltIcon fontSize="inherit" />
              手动定位
            </span>
          )}
        </div>
        <div className="photo-preview-actions">
          <button
            className="photo-preview-btn"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.3))}
            title="缩小"
          >
            <ZoomOutIcon fontSize="small" />
          </button>
          <span className="photo-preview-zoom-text">{Math.round(scale * 100)}%</span>
          <button
            className="photo-preview-btn"
            onClick={() => setScale((s) => Math.min(8, s + 0.3))}
            title="放大"
          >
            <ZoomInIcon fontSize="small" />
          </button>
          <button
            className="photo-preview-btn"
            onClick={handleDoubleClick}
            title="重置"
          >
            <RestartAltIcon fontSize="small" />
          </button>
          <button
            className="photo-preview-btn photo-preview-btn-primary"
            onClick={onOpenLightbox}
            title="全屏查看"
          >
            <OpenInFullIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* 图像区域 */}
      <div
        ref={containerRef}
        className="photo-preview-image-container"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photo.文件名}
            className="photo-preview-image"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease',
            }}
            draggable={false}
          />
        ) : (
          <div className="photo-preview-no-image">
            <span>图片过大或格式不支持预览</span>
          </div>
        )}

        {/* 缩放提示 */}
        <div className="photo-preview-hint">
          滚轮缩放 · 拖拽平移 · 双击重置
        </div>
      </div>

      {/* 信息栏 */}
      <div className="photo-preview-info">
        <div className="photo-preview-info-item" title={photo.文件名}>
          <CameraAltIcon fontSize="inherit" />
          <span className="photo-preview-filename">{photo.文件名}</span>
        </div>
        <div className="photo-preview-info-row">
          <div className="photo-preview-info-item">
            <LocationOnIcon fontSize="inherit" />
            <span>{lat}, {lng}</span>
          </div>
          <div className="photo-preview-info-item">
            <AccessTimeIcon fontSize="inherit" />
            <span>{time}</span>
          </div>
          {photo.海拔 != null && (
            <div className="photo-preview-info-item">
              <HeightIcon fontSize="inherit" />
              <span>{alt}</span>
            </div>
          )}
          {photo.设备型号 && (
            <div className="photo-preview-info-item">
              <CameraAltIcon fontSize="inherit" />
              <span>{photo.设备厂商 ?? ''} {photo.设备型号}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
