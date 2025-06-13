import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import RoomPage from './pages/RoomPage';
import './App.css';

/**
 * 路由组件
 */
const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create-room" element={<CreateRoomPage />} />
      <Route path="/room/:id" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Router>
);

/**
 * 应用程序主组件
 */
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // 模拟初始化加载
  useEffect(() => {
    // 延迟一小段时间以确保上下文正确初始化
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 减少延迟

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>加载中...</h2>
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <AuthProvider>
          <RoomProvider>
            <AppRoutes />
          </RoomProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
