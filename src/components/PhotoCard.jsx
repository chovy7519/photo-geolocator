import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PhotoIcon from '@mui/icons-material/Photo';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export default function PhotoCard({
  元数据,
  选中,
  点击,
  点击缩略图,
  手动定位,
  定位中,
}) {
  const [缩略图URL, 设置缩略图URL] = useState(null);

  useEffect(() => {
    if (!元数据.file || 元数据.文件大小 > 20 * 1024 * 1024) return;

    const url = URL.createObjectURL(元数据.file);
    设置缩略图URL(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [元数据.file, 元数据.文件大小]);

  const 时间文本 = 元数据.拍摄时间
    ? new Date(元数据.拍摄时间).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const 坐标文本 = 元数据.有GPS
    ? `${元数据.纬度?.toFixed(5)}, ${元数据.经度?.toFixed(5)}`
    : '无GPS坐标';

  const handle缩略图点击 = (e) => {
    e.stopPropagation();
    if (点击缩略图) {
      点击缩略图();
    }
  };

  const handle手动定位 = (e) => {
    e.stopPropagation();
    if (手动定位) {
      手动定位(元数据);
    }
  };

  return (
    <Box
      onClick={点击}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 选中 ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
        borderLeft: 选中 ? '3px solid #3b82f6' : '3px solid transparent',
        '&:hover': {
          bgcolor: 选中 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0,0,0,0.02)',
        },
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      {/* 缩略图 */}
      <Box
        onClick={handle缩略图点击}
        title="点击放大预览"
        sx={{
          width: 52,
          height: 52,
          borderRadius: 1.5,
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.15)',
          },
          transition: 'all 0.15s',
        }}
      >
        {缩略图URL ? (
          <>
            <img
              src={缩略图URL}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
            {/* 悬停放大图标 */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.15s',
                '&:hover': { opacity: 1 },
              }}
            >
              <ZoomInIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
          </>
        ) : (
          <PhotoIcon sx={{ color: 'grey.400', fontSize: 22 }} />
        )}
      </Box>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <Tooltip title={元数据.文件名} arrow>
          <Typography
            variant="body2"
            fontWeight={选中 ? 600 : 500}
            noWrap
            sx={{ fontSize: 13, color: '#1e293b', lineHeight: 1.4 }}
          >
            {元数据.文件名}
          </Typography>
        </Tooltip>

        <div className="flex items-center gap-1 mt-1">
          {元数据.有GPS ? (
            <LocationOnIcon sx={{ fontSize: 13, color: '#10b981' }} />
          ) : (
            <LocationOffIcon sx={{ fontSize: 13, color: '#cbd5e1' }} />
          )}
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontSize: 11,
              color: 元数据.有GPS ? '#059669' : '#94a3b8',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
            }}
          >
            {坐标文本}
          </Typography>
        </div>

        <Typography
          variant="caption"
          sx={{ fontSize: 11, color: '#94a3b8', mt: 0.25, display: 'block' }}
        >
          {时间文本}
          {元数据.设备型号 && (
            <span className="ml-2 text-slate-300">· {元数据.设备型号}</span>
          )}
        </Typography>
      </div>

      {/* 手动定位按钮（仅无GPS照片） */}
      {!元数据.有GPS && (
        <Tooltip title="在地图上手动定位">
          <IconButton
            size="small"
            onClick={handle手动定位}
            sx={{
              width: 28,
              height: 28,
              color: 定位中 ? '#7c4dff' : '#94a3b8',
              bgcolor: 定位中 ? 'rgba(124, 77, 255, 0.1)' : 'transparent',
              border: 定位中 ? '1px solid rgba(124, 77, 255, 0.3)' : '1px solid transparent',
              '&:hover': {
                color: '#7c4dff',
                bgcolor: 'rgba(124, 77, 255, 0.08)',
              },
              transition: 'all 0.15s',
            }}
          >
            <AddLocationAltIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
