import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import App from './App';
import './index.css';

dayjs.locale('zh-cn');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('找不到 root 元素，请检查 index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1677ff',
          fontSize: 14,
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#001529',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: '#1677ff',
            darkItemSelectedColor: '#ffffff',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
          },
          Table: {
            headerBg: '#fafafa',
            rowHoverBg: '#f5f5f5',
            borderColor: '#f0f0f0',
          },
          Card: {
            headerBg: '#fafafa',
          },
        },
      }}
    >
      <AntdApp>
        <HashRouter>
          <App />
        </HashRouter>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
);
