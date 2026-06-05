import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import TerrainIcon from '@mui/icons-material/Terrain';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

export default function Header({
  底图类型,
  切换底图,
  选择文件夹,
  清除数据,
  打开设置,
  侧栏展开,
  切换侧栏,
  有数据,
  加载中,
  天地图Key,
  定位模式,
  取消定位,
}) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#1e293b',
        color: '#e2e8f0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 52, gap: 1.5, px: 2 }}>
        {/* 侧栏切换 */}
        <Tooltip title={侧栏展开 ? '收起侧栏' : '展开侧栏'}>
          <IconButton
            size="small"
            onClick={切换侧栏}
            sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' } }}
          >
            {侧栏展开 ? (
              <MenuOpenIcon fontSize="small" />
            ) : (
              <MenuIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* 标题 */}
        <div className="flex items-center gap-2 mr-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <MapIcon sx={{ color: '#fff', fontSize: 16 }} />
          </div>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ color: '#f1f5f9', letterSpacing: '-0.01em' }}
            noWrap
          >
            照片地理定位器
          </Typography>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-slate-600/50 mx-1" />

        {/* 底图切换 */}
        <ToggleButtonGroup
          size="small"
          value={底图类型}
          exclusive
          onChange={(_, v) => v && 切换底图(v)}
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontSize: 12,
              color: '#94a3b8',
              borderColor: 'rgba(255,255,255,0.1)',
              '&.Mui-selected': {
                color: '#fff',
                backgroundColor: 'rgba(59, 130, 246, 0.25)',
                borderColor: 'rgba(59, 130, 246, 0.4)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            },
          }}
        >
          <ToggleButton value="矢量">
            <MapIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
            矢量
          </ToggleButton>
          <ToggleButton value="卫星">
            <SatelliteAltIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
            卫星
          </ToggleButton>
          <ToggleButton value="地形">
            <TerrainIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
            地形
          </ToggleButton>
        </ToggleButtonGroup>

        <div className="flex-1" />

        {/* 定位模式提示 */}
        {定位模式 && (
          <Chip
            icon={<AddLocationAltIcon sx={{ fontSize: 16 }} />}
            label={`正在为「${定位模式.文件名}」定位...`}
            size="small"
            sx={{
              bgcolor: 'rgba(124, 77, 255, 0.2)',
              color: '#c4b5fd',
              border: '1px solid rgba(124, 77, 255, 0.3)',
              mr: 1,
              '& .MuiChip-icon': { color: '#a78bfa' },
            }}
            onDelete={取消定位}
          />
        )}

        {/* Key 状态提示 */}
        {!天地图Key && !定位模式 && (
          <Typography
            variant="caption"
            sx={{
              color: '#fbbf24',
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span>⚠</span> 未设置天地图 Key
          </Typography>
        )}

        {/* 导入按钮 */}
        <Button
          size="small"
          variant="contained"
          startIcon={
            加载中 ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <FolderOpenIcon fontSize="small" />
            )
          }
          onClick={选择文件夹}
          disabled={加载中 || !!定位模式}
          sx={{
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 500,
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' },
            borderRadius: 1.5,
            px: 2,
          }}
        >
          {加载中 ? '读取中...' : '导入照片'}
        </Button>

        {/* 清除 */}
        {有数据 && (
          <Tooltip title="清除全部数据">
            <IconButton
              size="small"
              onClick={清除数据}
              disabled={!!定位模式}
              sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* 设置 */}
        <Tooltip title="天地图 API Key 设置">
          <IconButton
            size="small"
            onClick={打开设置}
            disabled={!!定位模式}
            sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' } }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
