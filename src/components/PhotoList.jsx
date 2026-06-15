import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCard from './PhotoCard';

export default function PhotoList({
  展开,
  有GPS列表,
  无GPS列表,
  选中照片,
  点击照片,
  总数,
  全部照片列表,
  打开灯箱,
  手动定位,
  定位中照片,
}) {
  const [搜索词, 设置搜索词] = useState('');
  const [显示类型, 设置显示类型] = useState('全部');

  const 过滤列表 = useMemo(() => {
    let list;
    if (显示类型 === '有GPS') list = 有GPS列表;
    else if (显示类型 === '无GPS') list = 无GPS列表;
    else list = [...有GPS列表, ...无GPS列表];

    if (!搜索词.trim()) return list;

    const kw = 搜索词.trim().toLowerCase();
    return list.filter(
      (p) =>
        p.文件名.toLowerCase().includes(kw) ||
        (p.设备型号 && p.设备型号.toLowerCase().includes(kw)) ||
        (p.拍摄时间 && p.拍摄时间.includes(kw))
    );
  }, [有GPS列表, 无GPS列表, 搜索词, 显示类型]);

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
      }}
    >
      <div className="flex flex-col h-full">
        {/* 搜索和筛选 */}
        <div className="p-3 space-y-2.5 border-b bg-white">
          <TextField
            size="small"
            fullWidth
            placeholder="搜索照片名称、设备、时间..."
            value={搜索词}
            onChange={(e) => 设置搜索词(e.target.value)}
            InputProps={{
              sx: { fontSize: 13, borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <div className="flex gap-1.5 flex-wrap">
            <Chip
              label={`全部 ${总数}`}
              size="small"
              variant={显示类型 === '全部' ? 'filled' : 'outlined'}
              color="primary"
              onClick={() => 设置显示类型('全部')}
              sx={{
                height: 26,
                fontSize: 12,
                fontWeight: 显示类型 === '全部' ? 600 : 400,
                borderRadius: 1.5,
              }}
            />
            <Chip
              label={`已定位 ${有GPS列表.length}`}
              size="small"
              variant={显示类型 === '有GPS' ? 'filled' : 'outlined'}
              color="success"
              onClick={() => 设置显示类型('有GPS')}
              sx={{
                height: 26,
                fontSize: 12,
                fontWeight: 显示类型 === '有GPS' ? 600 : 400,
                borderRadius: 1.5,
              }}
            />
            <Chip
              label={`待定位 ${无GPS列表.length}`}
              size="small"
              variant={显示类型 === '无GPS' ? 'filled' : 'outlined'}
              color={无GPS列表.length > 0 ? 'warning' : 'default'}
              onClick={() => 设置显示类型('无GPS')}
              sx={{
                height: 26,
                fontSize: 12,
                fontWeight: 显示类型 === '无GPS' ? 600 : 400,
                borderRadius: 1.5,
              }}
            />
          </div>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto">
          {总数 === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📂</span>
                </div>
                <div className="text-sm font-medium text-slate-500 mb-1">尚未导入照片</div>
                <div className="text-xs text-slate-400">点击上方「导入照片」按钮开始</div>
              </div>
            </div>
          ) : 过滤列表.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🔍</span>
                </div>
                <div className="text-sm font-medium text-slate-500 mb-1">没有匹配的照片</div>
                <div className="text-xs text-slate-400">尝试更换搜索关键词</div>
              </div>
            </div>
          ) : (
            过滤列表.map((meta, idx) => {
              const 全量索引 = 全部照片列表.findIndex((p) => p.文件名 === meta.文件名);
              const isLocating = 定位中照片?.文件名 === meta.文件名;
              return (
                <PhotoCard
                  key={`${meta.文件名}-${idx}`}
                  元数据={meta}
                  选中={选中照片?.文件名 === meta.文件名}
                  点击={() => 点击照片(meta)}
                  点击缩略图={() => 打开灯箱(全量索引 >= 0 ? 全量索引 : 0)}
                  手动定位={手动定位}
                  定位中={isLocating}
                />
              );
            })
          )}
        </div>
      </div>
    </Box>
  );
}
