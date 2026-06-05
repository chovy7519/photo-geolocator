import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function SettingsDialog({ 打开, 关闭, Key值, 保存Key }) {
  const [输入值, 设置输入值] = useState(Key值);

  const 确认保存 = () => {
    保存Key(输入值);
    关闭();
  };

  const 取消 = () => {
    设置输入值(Key值);
    关闭();
  };

  return (
    <Dialog open={打开} onClose={取消} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>天地图 API Key 设置</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, fontSize: 13 }}>
          天地图是国家地理信息公共服务平台，提供高质量的中国地图服务。
          个人开发者每天可免费调用 10,000 次，足够日常使用。
        </Alert>

        <div className="space-y-3">
          <div>
            <Typography variant="body2" gutterBottom fontWeight={500}>
              注册获取 Key（免费）
            </Typography>
            <ol className="text-sm text-gray-600 space-y-1 pl-5 list-decimal">
              <li>
                访问{' '}
                <Link href="https://console.tianditu.gov.cn/" target="_blank" rel="noopener">
                  天地图控制台
                </Link>
              </li>
              <li>注册账号并登录</li>
              <li>进入「应用管理」→「创建新应用」</li>
              <li>应用类型选择「浏览器端」</li>
              <li>复制生成的 Key 粘贴到下方</li>
            </ol>
          </div>

          <TextField
            autoFocus
            fullWidth
            label="天地图 API Key"
            placeholder="请输入您的天地图 Key（tk 参数值）"
            value={输入值}
            onChange={(e) => 设置输入值(e.target.value)}
            size="small"
            helperText="Key 将保存在浏览器本地存储中，下次打开无需重新输入"
            InputProps={{
              endAdornment: 输入值 ? (
                <Tooltip title="复制">
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(输入值)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null,
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={取消}>取消</Button>
        <Button onClick={确认保存} variant="contained" disabled={!输入值.trim()}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
