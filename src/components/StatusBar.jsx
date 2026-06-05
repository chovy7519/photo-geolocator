import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import ImageIcon from '@mui/icons-material/Image';

export default function StatusBar({ 总数, 有GPS数, 无GPS数 }) {
  if (总数 === 0) {
    return (
      <Box
        sx={{
          height: 32,
          bgcolor: '#f8fafc',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
        }}
      >
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12 }}>
          未加载照片 — 请点击「导入照片」或拖拽文件夹到此窗口
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 32,
        bgcolor: '#f8fafc',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ImageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
          共 <strong style={{ color: '#334155' }}>{总数}</strong> 张照片
        </Typography>
      </Box>

      <Box sx={{ width: 1, height: 12, bgcolor: '#e2e8f0', borderRadius: 6, overflow: 'hidden', flex: 1, maxWidth: 200 }}>
        <Box
          sx={{
            width: `${总数 > 0 ? (有GPS数 / 总数) * 100 : 0}%`,
            height: '100%',
            bgcolor: '#10b981',
            borderRadius: 6,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>

      <Tooltip title="包含GPS坐标的照片">
        <Chip
          icon={<LocationOnIcon sx={{ fontSize: 12, color: '#10b981 !important' }} />}
          label={`${有GPS数} 张已定位`}
          size="small"
          sx={{
            height: 22,
            fontSize: 11,
            bgcolor: 'rgba(16, 185, 129, 0.08)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            '& .MuiChip-icon': { ml: '6px' },
          }}
        />
      </Tooltip>

      {无GPS数 > 0 && (
        <Tooltip title="缺少GPS坐标的照片，可手动定位">
          <Chip
            icon={<LocationOffIcon sx={{ fontSize: 12, color: '#f59e0b !important' }} />}
            label={`${无GPS数} 张待定位`}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              '& .MuiChip-icon': { ml: '6px' },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
