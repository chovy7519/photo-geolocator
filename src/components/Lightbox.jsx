import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

export default function Lightbox({ 打开, 关闭, 照片列表, 当前索引, 切换照片 }) {
  const [可见, 设置可见] = useState(false);
  const [动画中, 设置动画中] = useState(false);
  const [图片URL, 设置图片URL] = useState(null);
  const [加载中, 设置加载中] = useState(true);
  const [加载失败, 设置加载失败] = useState(false);

  // 缩放与拖拽状态
  const [缩放, 设置缩放] = useState(1);
  const [偏移, 设置偏移] = useState({ x: 0, y: 0 });
  const [拖拽中, 设置拖拽中] = useState(false);
  const [显示提示, 设置显示提示] = useState(true);

  const blobUrlRef = useRef(null);
  const imgContainerRef = useRef(null);
  const 拖拽起点 = useRef({ x: 0, y: 0 });
  const 偏移起点 = useRef({ x: 0, y: 0 });
  const 提示定时器 = useRef(null);

  // 安全创建和清理 blob URL
  const 设置BlobURL = useCallback((file) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      设置图片URL(url);
    } else {
      设置图片URL(null);
    }
  }, []);

  // 重置缩放和偏移
  const 重置视图 = useCallback(() => {
    设置缩放(1);
    设置偏移({ x: 0, y: 0 });
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // 照片变化时更新
  useEffect(() => {
    if (!打开) return;
    const 当前照片 = 照片列表[当前索引];
    设置加载中(true);
    设置加载失败(false);
    重置视图();

    // 显示提示
    设置显示提示(true);
    if (提示定时器.current) clearTimeout(提示定时器.current);
    提示定时器.current = setTimeout(() => 设置显示提示(false), 2500);

    if (当前照片?.file) {
      设置BlobURL(当前照片.file);
    } else {
      设置BlobURL(null);
      设置加载中(false);
    }
  }, [打开, 当前索引, 照片列表, 设置BlobURL, 重置视图]);

  // 图片加载完成
  const handle图片加载 = useCallback(() => {
    设置加载中(false);
  }, []);

  // 图片加载失败
  const handle图片错误 = useCallback(() => {
    设置加载中(false);
    设置加载失败(true);
  }, []);

  // 控制进入/离开动画
  useEffect(() => {
    if (打开) {
      设置可见(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => 设置动画中(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      设置动画中(false);
      const timer = setTimeout(() => 设置可见(false), 300);
      return () => clearTimeout(timer);
    }
  }, [打开]);

  // 锁定/解锁 body 滚动
  useEffect(() => {
    if (打开) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [打开]);

  // 键盘事件
  const 上一张 = useCallback(() => {
    if (照片列表.length <= 1) return;
    切换照片((当前索引 - 1 + 照片列表.length) % 照片列表.length);
  }, [当前索引, 照片列表.length, 切换照片]);

  const 下一张 = useCallback(() => {
    if (照片列表.length <= 1) return;
    切换照片((当前索引 + 1) % 照片列表.length);
  }, [当前索引, 照片列表.length, 切换照片]);

  useEffect(() => {
    if (!打开) return;
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          关闭();
          break;
        case 'ArrowLeft':
          上一张();
          break;
        case 'ArrowRight':
          下一张();
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            重置视图();
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [打开, 关闭, 上一张, 下一张, 重置视图]);

  // 滚轮缩放
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!imgContainerRef.current) return;

    const rect = imgContainerRef.current.getBoundingClientRect();
    const 鼠标相对X = e.clientX - rect.left - rect.width / 2;
    const 鼠标相对Y = e.clientY - rect.top - rect.height / 2;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const 新缩放 = Math.min(Math.max(缩放 * delta, 0.5), 8);

    // 以鼠标位置为中心缩放
    const scaleRatio = 新缩放 / 缩放;
    const 新偏移X = 鼠标相对X - (鼠标相对X - 偏移.x) * scaleRatio;
    const 新偏移Y = 鼠标相对Y - (鼠标相对Y - 偏移.y) * scaleRatio;

    设置缩放(新缩放);
    设置偏移({ x: 新偏移X, y: 新偏移Y });
  }, [缩放, 偏移]);

  // 鼠标拖拽
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // 仅左键
    e.preventDefault();
    设置拖拽中(true);
    拖拽起点.current = { x: e.clientX, y: e.clientY };
    偏移起点.current = { ...偏移 };
  }, [偏移]);

  const handleMouseMove = useCallback((e) => {
    if (!拖拽中) return;
    const dx = e.clientX - 拖拽起点.current.x;
    const dy = e.clientY - 拖拽起点.current.y;
    设置偏移({
      x: 偏移起点.current.x + dx,
      y: 偏移起点.current.y + dy,
    });
  }, [拖拽中]);

  const handleMouseUp = useCallback(() => {
    设置拖拽中(false);
  }, []);

  useEffect(() => {
    if (拖拽中) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [拖拽中, handleMouseMove, handleMouseUp]);

  // 背景点击关闭（避免点击图片时关闭）
  const handle背景点击 = useCallback((e) => {
    if (e.target === e.currentTarget && 缩放 === 1) {
      关闭();
    }
  }, [关闭, 缩放]);

  // 触屏滑动支持
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const 触屏缩放起点 = useRef(0);
  const 触屏缩放值 = useRef(1);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      触屏缩放起点.current = Math.sqrt(dx * dx + dy * dy);
      触屏缩放值.current = 缩放;
    }
  }, [缩放]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && 缩放 > 1) {
      // 单指拖拽（仅在放大时）
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      设置偏移((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // 双指缩放
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = (distance / 触屏缩放起点.current) * 触屏缩放值.current;
      设置缩放(Math.min(Math.max(scale, 0.5), 8));
    }
  }, [缩放]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0 && 缩放 <= 1) {
      // 检查是否是滑动切换
      const diffX = touchStartX.current - (e.changedTouches[0]?.clientX || 0);
      if (Math.abs(diffX) > 60) {
        if (diffX > 0) 下一张();
        else 上一张();
      }
    }
  }, [缩放, 上一张, 下一张]);

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    重置视图();
  }, [重置视图]);

  if (!可见 && !打开) return null;

  const 当前照片 = 照片列表[当前索引];
  if (!当前照片) return null;

  const 拍摄时间文本 = 当前照片.拍摄时间
    ? new Date(当前照片.拍摄时间).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '时间未知';

  const 坐标文本 = 当前照片.有GPS
    ? `${当前照片.纬度?.toFixed(6)}, ${当前照片.经度?.toFixed(6)}`
    : '无GPS坐标';

  const 总数 = 照片列表.length;
  const 缩放百分比 = Math.round(缩放 * 100);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 select-none"
      style={{
        opacity: 动画中 ? 1 : 0,
        background: 动画中 ? 'rgba(15, 23, 42, 0.92)' : 'rgba(15, 23, 42, 0)',
        backdropFilter: 动画中 ? 'blur(16px)' : 'blur(0px)',
        WebkitBackdropFilter: 动画中 ? 'blur(16px)' : 'blur(0px)',
        cursor: 拖拽中 ? 'grabbing' : 缩放 > 1 ? 'grab' : 'default',
      }}
      onClick={handle背景点击}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 缩放提示 */}
      {显示提示 && (
        <div className="lightbox-zoom-hint">
          滚轮缩放 · 拖拽平移 · 双击重置 · ESC 关闭
        </div>
      )}

      {/* 缩放倍率显示 */}
      {缩放 !== 1 && (
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {缩放百分比}%
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); 重置视图(); }}
            className="text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            重置
          </button>
        </div>
      )}

      {/* 右上角关闭按钮 */}
      <button
        onClick={(e) => { e.stopPropagation(); 关闭(); }}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                   rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white
                   transition-all duration-200 focus:outline-none backdrop-blur-sm"
        aria-label="关闭"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* 上一张按钮 */}
      {总数 > 1 && 缩放 === 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); 上一张(); }}
          className="absolute left-4 z-10 w-11 h-11 flex items-center justify-center
                     rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white
                     transition-all duration-200 focus:outline-none backdrop-blur-sm"
          aria-label="上一张"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* 下一张按钮 */}
      {总数 > 1 && 缩放 === 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); 下一张(); }}
          className="absolute right-4 z-10 w-11 h-11 flex items-center justify-center
                     rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white
                     transition-all duration-200 focus:outline-none backdrop-blur-sm"
          aria-label="下一张"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* 照片区域 */}
      <div
        ref={imgContainerRef}
        className="flex-1 flex items-center justify-center w-full px-16 py-20 min-h-0 overflow-hidden"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* 加载指示器 */}
        {加载中 && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-10 h-10 border-2 border-white/15 border-t-white/70 rounded-full animate-spin" />
          </div>
        )}

        {图片URL && !加载失败 ? (
          <img
            src={图片URL}
            alt={当前照片.文件名}
            className="max-w-[90vw] max-h-[85vh] object-contain select-none"
            style={{
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
              borderRadius: 4,
              opacity: 加载中 ? 0 : 1,
              transition: 'opacity 0.3s ease',
              transform: `translate(${偏移.x}px, ${偏移.y}px) scale(${缩放})`,
              cursor: 拖拽中 ? 'grabbing' : 缩放 > 1 ? 'grab' : 'zoom-in',
              willChange: 'transform',
            }}
            draggable={false}
            onLoad={handle图片加载}
            onError={handle图片错误}
          />
        ) : (
          !加载中 && (
            <div className="text-white/50 text-lg flex flex-col items-center gap-3">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm">无法显示图片</span>
            </div>
          )
        )}
      </div>

      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4
                      bg-gradient-to-t from-black/70 to-transparent text-white">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate" title={当前照片.文件名}>
            {当前照片.文件名}
          </div>
          <div className="text-xs text-white/60 mt-0.5 flex items-center gap-2">
            <span>{拍摄时间文本}</span>
            {当前照片.有GPS && (
              <>
                <span className="text-white/30">·</span>
                <span className="font-mono text-[11px]">{坐标文本}</span>
              </>
            )}
          </div>
        </div>
        {总数 > 1 && (
          <div className="text-xs text-white/40 ml-4 flex-shrink-0 font-mono">
            {当前索引 + 1} / {总数}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
