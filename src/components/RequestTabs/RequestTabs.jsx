import React from 'react';
import { Tabs, Input, Table, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const RequestTabs = ({ body, onBodyChange, params, onParamsChange, url, response }) => {
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => handleParamChange(index, 'type', value)}
          style={{ width: 120 }}
        >
          <Option value="query">Query</Option>
          <Option value="path">Path</Option>
        </Select>
      ),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleParamChange(index, 'key', e.target.value)}
        />
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleParamChange(index, 'value', e.target.value)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button onClick={() => handleRemoveParam(index)} type="link" danger>
          Delete
        </Button>
      ),
    },
  ];

  const handleParamChange = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    onParamsChange(newParams);
  };

  const handleRemoveParam = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    onParamsChange(newParams);
  };

  const handleAddParam = () => {
    const newParams = [...params, { type: 'query', key: '', value: '' }];
    onParamsChange(newParams);
  };

  return (
    <div className="request-tabs">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Params" key="1">
          <Table
            dataSource={params}
            columns={columns}
            pagination={false}
            rowKey={(record, index) => index}
          />
          <Button
            type="dashed"
            onClick={handleAddParam}
            style={{ width: '100%', marginTop: 16 }}
            icon={<PlusOutlined />}
          >
            Add Parameter
          </Button>
        </TabPane>
        <TabPane tab="Headers" key="2">
          Request headers (Not implemented)
        </TabPane>
        <TabPane tab="Body" key="3">
          <TextArea
            rows={10}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Enter request body (JSON)"
          />
        </TabPane>
        <TabPane tab="Response" key="4">
          {response ? (
            <pre>{JSON.stringify(response, null, 2)}</pre>
          ) : (
            <p>No response yet. Send a request to see the response here.</p>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RequestTabs;