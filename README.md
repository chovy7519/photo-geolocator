# 照片地理定位器 · Photo Geolocator

> 城市规划实地调研工具 — 批量读取手机拍摄照片的 GPS 坐标，在**天地图**上可视化展示。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](https://react.dev)
[![Electron](https://img.shields.io/badge/electron-42.x-47848f.svg)](https://electronjs.org)

---

## 为什么做这个

城市规划师经常需要外出实地调研，用手机拍摄大量现场照片。这些照片的 EXIF 里自带 GPS 坐标，但回到电脑上只能在文件夹里干看。GeoSetter 这类工具又没有国内地图源，地图加载极慢。

本工具直接调用**天地图**（国家地理信息公共服务平台），在国内访问毫秒级加载，专为规划师实地调研场景设计。

---

## 功能特性

- 📸 **批量导入** — 支持 JPG / PNG / TIFF / HEIC，拖拽或选择文件夹
- 📍 **GPS 自动提取** — 读取 EXIF 中的经纬度、海拔、拍摄方向、设备信息
- 🗺️ **天地图底图** — 矢量 / 卫星 / 地形，中文标注，国内极速加载
- 🔍 **聚合与筛选** — MarkerCluster 聚合、按已定位/待定位筛选、搜索
- 🖼️ **Lightbox 预览** — 滚轮缩放、拖拽平移、触屏双指缩放、键盘导航
- 🎯 **手动定位** — 无 GPS 照片可在地图上点选补录坐标
- 💻 **桌面端打包** — 基于 Electron，生成 Windows .exe 独立运行

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite |
| UI 组件库 | MUI 5 + Tailwind CSS 3 |
| 地图引擎 | Leaflet + react-leaflet |
| EXIF 读取 | exifr 7.x |
| 地图服务 | 天地图 WMTS（矢量/卫星/地形） |
| 桌面打包 | Electron + electron-builder |

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/chovy7519/photo-geolocator.git
cd photo-geolocator
npm install
```

### 2. 获取天地图 Key（免费）

1. 访问 [天地图控制台](https://console.tianditu.gov.cn/)
2. 注册账号并登录
3. 进入「应用管理」→「创建新应用」
4. 应用类型选择「**浏览器端**」
5. 复制生成的 Key

> 个人开发者每天可免费调用 **10,000 次**，足够日常使用。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器自动打开 `http://localhost:3000`，在右上角设置里填入天地图 Key。

### 4. 打包桌面端

```bash
npm run electron:build:win
```

生成文件在 `release/` 目录：
- `照片地理定位器 Setup 1.0.0.exe` — 安装版
- `照片地理定位器 1.0.0.exe` — 便携版

---

## 项目结构

```
src/
├── App.jsx                    # 主应用入口
├── main.jsx                   # React 挂载
├── index.css                  # 全局样式
├── components/
│   ├── Header.jsx             # 顶部工具栏
│   ├── MapView.jsx            # 地图核心组件
│   ├── PhotoList.jsx          # 左侧照片列表
│   ├── PhotoCard.jsx          # 单张照片卡片
│   ├── Lightbox.jsx           # 照片放大预览
│   ├── StatusBar.jsx          # 底部状态栏
│   ├── SettingsDialog.jsx     # 天地图 Key 设置
│   └── WelcomeOverlay.jsx     # 初始引导页
├── utils/
│   ├── exifReader.js          # EXIF GPS 数据提取
│   └── tiandituLayers.js      # 天地图瓦片图层
electron/
├── main.cjs                   # Electron 主进程
└── preload.cjs                # IPC 安全桥接
```

---

## 数据隐私

所有照片和 GPS 数据**仅在本地浏览器/桌面端处理**，不上传任何服务器。天地图 Key 保存在浏览器 localStorage 中。

---

## License

MIT © [chovy7519](https://github.com/chovy7519)
