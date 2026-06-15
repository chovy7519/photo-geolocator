import React, { useState, useCallback, useRef, useMemo } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import PhotoList from './components/PhotoList';
import StatusBar from './components/StatusBar';
import SettingsDialog from './components/SettingsDialog';
import WelcomeOverlay from './components/WelcomeOverlay';
import Lightbox from './components/Lightbox';
import PhotoPopupCard from './components/PhotoPopupCard';
import { batchExtractMeta } from './utils/exifReader';

export default function App() {
  const [照片列表, 设置照片列表] = useState([]);
  const [选中照片, 设置选中照片] = useState(null);
  const [加载中, 设置加载中] = useState(false);
  const [加载进度, 设置加载进度] = useState({ 当前: 0, 总数: 0 });
  const [底图类型, 设置底图类型] = useState('矢量');
  const [天地图Key, 设置天地图Key] = useState(() => localStorage.getItem('tianditu_key') || '');
  const [设置弹窗, 设置设置弹窗] = useState(false);
  const [侧栏展开, 设置侧栏展开] = useState(true);
  const [拖拽中, 设置拖拽中] = useState(false);
  const [灯箱打开, 设置灯箱打开] = useState(false);
  const [灯箱索引, 设置灯箱索引] = useState(0);
  const [定位中照片, 设置定位中照片] = useState(null);
  const [popup照片, 设置popup照片] = useState(null); // { photo, index, url }
  const fileInputRef = useRef(null);

  // 保存天地图 Key
  const 保存Key = useCallback((新Key) => {
    const k = 新Key.trim();
    设置天地图Key(k);
    if (k) {
      localStorage.setItem('tianditu_key', k);
    } else {
      localStorage.removeItem('tianditu_key');
    }
  }, []);

  // 处理文件导入
  const 处理文件导入 = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    设置加载中(true);
    设置加载进度({ 当前: 0, 总数: files.length });

    const results = await batchExtractMeta(Array.from(files), (当前, 总数) => {
      设置加载进度({ 当前, 总数 });
    });

    设置照片列表(results);
    设置加载中(false);

    // 默认选中第一张有GPS的照片
    const firstGps = results.find((p) => p.有GPS);
    if (firstGps) 设置选中照片(firstGps);
  }, []);

  // 文件夹选择
  const 选择文件夹 = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 拖拽事件
  const 拖拽进入 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    设置拖拽中(true);
  }, []);

  const 拖拽离开 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    设置拖拽中(false);
  }, []);

  const 拖拽放下 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    设置拖拽中(false);

    if (e.dataTransfer.files?.length) {
      处理文件导入(e.dataTransfer.files);
    }
  }, [处理文件导入]);

  // 文件选择变化
  const 文件选择变化 = useCallback((e) => {
    const files = e.target.files;
    if (files?.length) 处理文件导入(files);
    e.target.value = '';
  }, [处理文件导入]);

  // 标记点击
  const 标记点击 = useCallback((meta) => {
    设置选中照片(meta);
  }, []);

  // 列表项点击
  const 列表项点击 = useCallback((meta) => {
    设置选中照片(meta);
  }, []);

  // 打开灯箱
  const 打开灯箱 = useCallback((索引) => {
    设置灯箱索引(索引);
    设置灯箱打开(true);
  }, []);

  // marker 点击后显示浮动卡片
  const 显示Popup卡片 = useCallback((photo, index, url) => {
    设置popup照片({ photo, index, url });
  }, []);

  const 关闭Popup卡片 = useCallback(() => {
    设置popup照片(null);
  }, []);

  // 清除数据
  const 清除数据 = useCallback(() => {
    设置照片列表([]);
    设置选中照片(null);
    设置灯箱打开(false);
    设置定位中照片(null);
  }, []);

  // 手动定位：进入定位模式
  const 开始手动定位 = useCallback((meta) => {
    设置定位中照片(meta);
    设置选中照片(meta);
  }, []);

  // 手动定位：设置坐标
  const 设置手动坐标 = useCallback((文件名, lat, lng) => {
    设置照片列表((prev) =>
      prev.map((p) =>
        p.文件名 === 文件名
          ? {
              ...p,
              纬度: lat,
              经度: lng,
              有GPS: true,
              手动定位: true,
            }
          : p
      )
    );
    设置选中照片((prev) =>
      prev?.文件名 === 文件名
        ? { ...prev, 纬度: lat, 经度: lng, 有GPS: true, 手动定位: true }
        : prev
    );
    设置定位中照片(null);
  }, []);

  // 取消定位
  const 取消定位 = useCallback(() => {
    设置定位中照片(null);
  }, []);

  const 有GPS列表 = useMemo(() => 照片列表.filter((p) => p.有GPS), [照片列表]);
  const 无GPS列表 = useMemo(() => 照片列表.filter((p) => !p.有GPS), [照片列表]);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-white"
      onDragEnter={拖拽进入}
      onDragOver={拖拽进入}
      onDragLeave={拖拽离开}
      onDrop={拖拽放下}
    >
      {/* 隐藏的文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        webkitdirectory=""
        directory=""
        multiple
        accept="image/jpeg,image/png,image/tiff,image/heic,image/heif"
        onChange={文件选择变化}
      />

      {/* 顶部工具栏 */}
      <Header
        底图类型={底图类型}
        切换底图={设置底图类型}
        选择文件夹={选择文件夹}
        清除数据={清除数据}
        打开设置={() => 设置设置弹窗(true)}
        侧栏展开={侧栏展开}
        切换侧栏={() => 设置侧栏展开(!侧栏展开)}
        有数据={照片列表.length > 0}
        加载中={加载中}
        天地图Key={天地图Key}
        定位模式={定位中照片}
        取消定位={取消定位}
      />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 侧栏 - 照片列表 */}
        <PhotoList
          展开={侧栏展开}
          有GPS列表={有GPS列表}
          无GPS列表={无GPS列表}
          选中照片={选中照片}
          点击照片={列表项点击}
          总数={照片列表.length}
          全部照片列表={照片列表}
          打开灯箱={打开灯箱}
          手动定位={开始手动定位}
          定位中照片={定位中照片}
        />

        {/* 地图区域 */}
        <div className="flex-1 relative">
          {加载中 && (
            <div className="absolute top-0 left-0 right-0 z-[1000]">
              <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                正在读取照片信息... {加载进度.当前} / {加载进度.总数}
              </div>
              <div className="h-1 bg-blue-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${加载进度.总数 > 0 ? (加载进度.当前 / 加载进度.总数) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {拖拽中 && (
            <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="drop-zone drag-over bg-white/95 px-14 py-12 rounded-2xl shadow-xl text-center">
                <div className="text-5xl mb-3">📁</div>
                <div className="text-lg font-semibold text-slate-800">释放鼠标导入照片</div>
                <div className="text-sm text-slate-400 mt-1">支持 JPG / PNG / TIFF / HEIC</div>
              </div>
            </div>
          )}

          {照片列表.length === 0 && !加载中 && (
            <WelcomeOverlay 选择文件夹={选择文件夹} />
          )}

          <MapView
            照片列表={有GPS列表}
            选中照片={选中照片}
            底图类型={底图类型}
            天地图Key={天地图Key}
            标记点击={标记点击}
            全部照片列表={照片列表}
            打开灯箱={打开灯箱}
            定位模式={定位中照片}
            设置坐标={设置手动坐标}
            取消定位={取消定位}
            onPhotoSelect={显示Popup卡片}
          />

          {/* 浮动照片卡片 */}
          {popup照片 && (
            <PhotoPopupCard
              photo={popup照片.photo}
              photoIndex={popup照片.index}
              photoUrl={popup照片.url}
              onClose={关闭Popup卡片}
              onZoom={打开灯箱}
            />
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <StatusBar 总数={照片列表.length} 有GPS数={有GPS列表.length} 无GPS数={无GPS列表.length} />

      {/* 设置弹窗 */}
      <SettingsDialog
        打开={设置弹窗}
        关闭={() => 设置设置弹窗(false)}
        Key值={天地图Key}
        保存Key={保存Key}
      />

      {/* Lightbox 灯箱 */}
      <Lightbox
        打开={灯箱打开}
        关闭={() => 设置灯箱打开(false)}
        照片列表={照片列表}
        当前索引={灯箱索引}
        切换照片={设置灯箱索引}
      />
    </div>
  );
}
