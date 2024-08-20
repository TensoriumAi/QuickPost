import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const ImportCollection = ({ onImport }) => {
  const parseCollection = (collection) => {
    const parseItem = (item) => {
      if (item.request) {
        return {
          name: item.name,
          method: item.request.method,
          url: item.request.url.raw || item.request.url,
          body: item.request.body?.raw || '',
          headers: item.request.header,
          params: item.request.url.query?.map(q => ({ key: q.key, value: q.value })) || [],
        };
      } else if (item.item) {
        return {
          name: item.name,
          items: item.item.map(parseItem),
        };
      }
    };

    return {
      name: collection.info.name,
      items: collection.item.map(parseItem),
    };
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const collection = JSON.parse(e.target.result);
        const parsedCollection = parseCollection(collection);
        onImport(parsedCollection);
        message.success(`${file.name} imported successfully`);
      } catch (error) {
        message.error(`Failed to import ${file.name}: Invalid JSON`);
      }
    };
    reader.readAsText(file);
    return false;
  };

  return (
    <Dragger
      accept=".json"
      beforeUpload={handleImport}
      multiple={false}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag Postman collection file to this area to import</p>
    </Dragger>
  );
};

export default ImportCollection;