import React from 'react';
import { Layout } from 'antd';
import FlowChart from '../FlowChart';
import ChatPanel from '../Chat';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout className="h-screen">
      <Content className="flex">
        <div className="w-3/5 h-full p-4 border-r">
          <FlowChart />
        </div>
        <div className="w-2/5 h-full">
          <ChatPanel />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout; 