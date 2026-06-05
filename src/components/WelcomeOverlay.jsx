import React from 'react';
import Button from '@mui/material/Button';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';

export default function WelcomeOverlay({ 选择文件夹 }) {
  return (
    <div className="absolute inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 pointer-events-auto">
      <div className="text-center max-w-lg px-8">
        {/* 顶部装饰 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <MapIcon sx={{ color: '#fff', fontSize: 26 }} />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              照片地理定位器
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">
              Photo GeoLocator
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          城市规划实地调研工具 — 批量导入照片，自动读取 GPS 坐标
          <br />
          在天地图底图上可视化展示调研足迹
        </p>

        {/* 导入区域 */}
        <div
          className="drop-zone bg-white/80 backdrop-blur-sm p-8 mb-8 shadow-sm"
          style={{ border: '2px dashed #cbd5e1' }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<FolderOpenIcon />}
            onClick={选择文件夹}
            sx={{
              textTransform: 'none',
              mb: 2,
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontSize: 15,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
              boxShadow: '0 4px 16px rgba(21, 101, 192, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                boxShadow: '0 6px 20px rgba(21, 101, 192, 0.35)',
              },
            }}
          >
            选择照片文件夹
          </Button>
          <p className="text-xs text-slate-400">
            或直接将照片文件夹拖拽到此窗口
          </p>
        </div>

        {/* 功能列表 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: <MapIcon sx={{ fontSize: 22, color: '#1565c0' }} />,
              title: '批量导入',
              desc: 'JPG / PNG / HEIC',
            },
            {
              icon: <LocationOnIcon sx={{ fontSize: 22, color: '#00897b' }} />,
              title: 'GPS 定位',
              desc: 'EXIF 自动读取',
            },
            {
              icon: <SatelliteAltIcon sx={{ fontSize: 22, color: '#ff6d00' }} />,
              title: '天地图底图',
              desc: '矢量 / 卫星 / 地形',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-slate-100"
            >
              <div className="mb-2">{item.icon}</div>
              <div className="text-xs font-semibold text-slate-700 mb-0.5">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
