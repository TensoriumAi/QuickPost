import React from 'react';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const ResponseTabs = () => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Params" key="1">
        Params content
      </TabPane>
      <TabPane tab="Headers" key="2">
        Headers content
      </TabPane>
      <TabPane tab="Body" key="3">
        Body content
      </TabPane>
    </Tabs>
  );
};

export default ResponseTabs;