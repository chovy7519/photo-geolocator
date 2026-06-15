import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { createLayers, DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/tiandituLayers';

/**
 * 对文件名中的特殊字符做 HTML 属性转义
 */
function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Leaflet 弹出窗口工厂
 * - 照片可点击打开 Lightbox（事件委托）
 * - 照片可拖拽到文件夹（HTML5 native drag）
 * - 悬停时显示双提示图标（放大 + 下载）
 */
function buildPopupContent(meta, 图片URL) {
  const lat = meta.纬度?.toFixed(6) ?? '—';
  const lng = meta.经度?.toFixed(6) ?? '—';
  const time = meta.拍摄时间
    ? new Date(meta.拍摄时间).toLocaleString('zh-CN')
    : '—';
  const alt = meta.海拔 != null ? `${meta.海拔} m` : '—';
  const 安全文件名 = escapeAttr(meta.文件名);
  const isManual = meta.手动定位;

  const 图片HTML = 图片URL
    ? `<div class="popup-photo-wrap">
         <img src="${图片URL}" alt="" data-photo-filename="${安全文件名}"
              class="lightbox-popup-trigger popup-photo-img"
              draggable="true"
              title="点击放大 · 拖拽到文件夹即可保存"
              loading="lazy" />
         <div class="popup-photo-overlay">
           <div class="popup-photo-icon" title="点击放大预览">
             <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="11" cy="11" r="8"/>
               <line x1="21" y1="21" x2="16.65" y2="16.65"/>
               <line x1="11" y1="8" x2="11" y2="14"/>
               <line x1="8" y1="11" x2="14" y2="11"/>
             </svg>
           </div>
           <div class="popup-photo-drag" title="拖拽到文件夹保存">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
               <polyline points="7 10 12 15 17 10"/>
               <line x1="12" y1="15" x2="12" y2="3"/>
             </svg>
           </div>
         </div>
         <div class="popup-photo-tip">点击放大 · 拖到文件夹保存</div>
       </div>`
    : `<div class="popup-photo-empty">
         <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
           <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
           <circle cx="8.5" cy="8.5" r="1.5"/>
           <polyline points="21 15 16 10 5 21"/>
         </svg>
         <span>无缩略图（>20MB）</span>
       </div>`;

  return `
    <div style="min-width:260px;max-width:320px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans SC',sans-serif;">
      ${图片HTML}
      <div style="padding:10px 14px 12px;">
        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px;" title="${安全文件名}">
          ${meta.文件名}
        </div>
        <div style="font-size:12px;color:#666;line-height:1.9;">
          <div>📍 经度：${lng}&emsp;纬度：${lat}</div>
          <div>🕐 拍摄时间：${time}</div>
          <div>⛰ 海拔：${alt}</div>
          ${meta.设备型号 ? `<div>📱 设备：${meta.设备厂商 ?? ''} ${meta.设备型号}</div>` : ''}
          ${isManual ? '<div style="color:#7c4dff;font-weight:500;margin-top:4px;">✎ 手动定位</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * 创建缩略图 Marker 图标
 */
function createPhotoIcon(图片URL, selected, isManual) {
  if (图片URL) {
    return L.divIcon({
      className: `photo-marker ${selected ? 'photo-marker-selected' : ''}`,
      html: `<div class="photo-marker-inner">
               <img src="${图片URL}" alt="" draggable="false" />
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -42],
    });
  }

  return L.divIcon({
    className: `photo-marker-placeholder ${selected ? 'photo-marker-selected' : ''} ${isManual ? 'photo-marker-manual' : ''}`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

export default function MapView({
  照片列表,
  选中照片,
  底图类型,
  天地图Key,
  标记点击,
  全部照片列表,
  打开灯箱,
  定位模式,
  设置坐标,
  取消定位,
}) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const layersRef = useRef({});
  const markersRef = useRef({});
  const clusterGroupRef = useRef(null);
  const selectedMarkerRef = useRef(null);
  const blobUrlsRef = useRef({});
  const locateClickHandlerRef = useRef(null);
  const 照片元数据Ref = useRef({});

  // 通过委托监听 document 上的 popup 图片点击（打开 Lightbox）
  useEffect(() => {
    const handlePopupImageClick = (e) => {
      const img = e.target.closest('.lightbox-popup-trigger');
      if (!img) return;

      const filename = img.getAttribute('data-photo-filename');
      if (!filename) return;

      const 索引 = 全部照片列表.findIndex((p) => p.文件名 === filename);
      if (索引 >= 0) {
        打开灯箱(索引);
      }
    };

    document.addEventListener('click', handlePopupImageClick);
    return () => document.removeEventListener('click', handlePopupImageClick);
  }, [全部照片列表, 打开灯箱]);

  // 通过委托监听 document 上的 popup 图片拖拽（下载到文件夹）
  useEffect(() => {
    const handlePopupImageDragStart = (e) => {
      const img = e.target.closest('.popup-photo-img');
      if (!img) return;

      const filename = img.getAttribute('data-photo-filename');
      if (!filename) return;

      const meta = 照片元数据Ref.current[filename];
      if (!meta) return;

      // 优先：Electron 环境 → 走原生 startDrag（拖出窗口复制真实文件）
      if (window.electronAPI?.startDrag && meta.filePath) {
        e.preventDefault();
        window.electronAPI.startDrag(meta.filePath);
        return;
      }

      // 兜底：浏览器环境 → 设置 DownloadURL 数据（拖到桌面或浏览器会触发下载）
      try {
        const src = img.getAttribute('src');
        if (src) {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('DownloadURL', `image/jpeg:${filename}:${src}`);
          e.dataTransfer.setData('text/uri-list', src);
        }
      } catch (err) {
        console.warn('拖拽初始化失败:', err);
      }
    };

    document.addEventListener('dragstart', handlePopupImageDragStart);
    return () => document.removeEventListener('dragstart', handlePopupImageDragStart);
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 组合 Key
  const 地图Key = useMemo(() => `${天地图Key}-${底图类型}`, [天地图Key, 底图类型]);

  // 更新天地图图层
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !天地图Key) return;

    Object.values(layersRef.current).forEach((layer) => {
      if (layer) {
        map.removeLayer(layer);
      }
    });
    layersRef.current = {};

    const { 底图, 标注 } = createLayers(天地图Key);

    const currentBase = 底图[底图类型];
    const currentAnno = 标注[底图类型];
    if (currentBase) {
      currentBase.addTo(map);
      layersRef.current.base = currentBase;
    }
    if (currentAnno) {
      currentAnno.addTo(map);
      layersRef.current.anno = currentAnno;
    }

    return () => {
      Object.values(layersRef.current).forEach((l) => map.removeLayer(l));
    };
  }, [地图Key]);

  // 更新标记点
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }
    markersRef.current = {};
    照片元数据Ref.current = {};

    Object.values(blobUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = {};

    if (照片列表.length === 0) return;

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let cls = 'marker-cluster-small';
        if (count >= 50) cls = 'marker-cluster-large';
        else if (count >= 10) cls = 'marker-cluster-medium';
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${cls}`,
          iconSize: L.point(42, 42),
        });
      },
    });

    const markers = [];
    照片列表.forEach((meta) => {
      const { 纬度, 经度 } = meta;
      if (纬度 == null || 经度 == null) return;

      // 记录元数据（供拖拽使用）
      照片元数据Ref.current[meta.文件名] = meta;

      // 生成缩略图 blob URL（限制 5M，仅用于 marker 图标）
      let 缩略图URL = null;
      if (meta.file && meta.文件大小 <= 5 * 1024 * 1024) {
        try {
          缩略图URL = URL.createObjectURL(meta.file);
          blobUrlsRef.current[`thumb-${meta.文件名}`] = 缩略图URL;
        } catch {
          // ignore
        }
      }

      // popup 用的大图 blob URL（限制 20M）
      let popup图片URL = null;
      if (meta.file && meta.文件大小 <= 20 * 1024 * 1024) {
        try {
          popup图片URL = URL.createObjectURL(meta.file);
          blobUrlsRef.current[`popup-${meta.文件名}`] = popup图片URL;
        } catch {
          // ignore
        }
      }

      const isSelected = 选中照片?.文件名 === meta.文件名;
      const icon = createPhotoIcon(缩略图URL, isSelected, meta.手动定位);

      const marker = L.marker([纬度, 经度], { icon });

      marker.bindPopup(buildPopupContent(meta, popup图片URL), {
        className: 'photo-popup',
        maxWidth: 340,
        closeButton: true,
        minWidth: 280,
      });

      marker.on('click', () => {
        if (!定位模式) {
          标记点击(meta);
        }
      });

      markers.push(marker);
      markersRef.current[meta.文件名] = marker;
    });

    clusterGroup.addLayers(markers);
    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    // 自动缩放到所有点
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [照片列表, 定位模式]);

  // 选中照片变化时高亮并定位
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !选中照片?.有GPS) return;

    // 取消之前的高亮
    if (selectedMarkerRef.current) {
      const meta = 照片列表.find((p) => p.文件名 === selectedMarkerRef.current.文件名);
      const 缩略图URL = blobUrlsRef.current[`thumb-${meta?.文件名}`];
      selectedMarkerRef.current.marker.setIcon(
        createPhotoIcon(缩略图URL, false, meta?.手动定位)
      );
    }

    const marker = markersRef.current[选中照片.文件名];
    if (marker) {
      const 缩略图URL = blobUrlsRef.current[`thumb-${选中照片.文件名}`];
      marker.setIcon(createPhotoIcon(缩略图URL, true, 选中照片.手动定位));
      selectedMarkerRef.current = { marker, 文件名: 选中照片.文件名 };

      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15), { animate: true });
      marker.openPopup();
    }
  }, [选中照片, 照片列表]);

  // 定位模式：监听地图点击
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 先移除旧的
    if (locateClickHandlerRef.current) {
      map.off('click', locateClickHandlerRef.current);
      locateClickHandlerRef.current = null;
    }

    if (定位模式) {
      const handler = (e) => {
        const { lat, lng } = e.latlng;
        设置坐标(定位模式.文件名, lat, lng);
      };
      locateClickHandlerRef.current = handler;
      map.on('click', handler);

      // 添加定位提示
      const hintEl = document.createElement('div');
      hintEl.className = 'map-locate-hint';
      hintEl.id = 'map-locate-hint';
      hintEl.innerHTML = `🖱 点击地图为「<strong>${定位模式.文件名}</strong>」设置位置 <span style="margin-left:8px;opacity:0.7;">按 ESC 取消</span>`;
      mapContainerRef.current?.appendChild(hintEl);

      // 添加定位模式样式
      mapContainerRef.current?.classList.add('map-locate-mode');
    } else {
      // 移除定位提示
      const hint = document.getElementById('map-locate-hint');
      if (hint) hint.remove();
      mapContainerRef.current?.classList.remove('map-locate-mode');
    }

    return () => {
      if (locateClickHandlerRef.current) {
        map.off('click', locateClickHandlerRef.current);
      }
      const hint = document.getElementById('map-locate-hint');
      if (hint) hint.remove();
    };
  }, [定位模式, 设置坐标]);

  // 定位模式下 ESC 取消
  useEffect(() => {
    if (!定位模式) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        取消定位();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [定位模式, 取消定位]);

  // 没有 Key 时显示空状态
  if (!天地图Key) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🗺️</span>
          </div>
          <div className="text-base font-semibold text-slate-600 mb-1">未配置天地图 API Key</div>
          <div className="text-sm text-slate-400">
            请点击右上角设置按钮，输入您的天地图 Key
          </div>
          <div className="text-xs mt-2 text-slate-300">
            前往 console.tianditu.gov.cn 注册获取
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full relative" />;
}
