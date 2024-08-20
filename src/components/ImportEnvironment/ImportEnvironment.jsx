import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const ImportEnvironment = ({ onImport }) => {
  const parseEnvironment = (environment) => {
    return {
      name: environment.name,
      values: environment.values.map(value => ({
        key: value.key,
        value: value.value,
        enabled: value.enabled
      }))
    };
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const environment = JSON.parse(e.target.result);
        const parsedEnvironment = parseEnvironment(environment);
        onImport(parsedEnvironment);
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
      <p className="ant-upload-text">Click or drag Postman environment file to this area to import</p>
    </Dragger>
  );
};

export default ImportEnvironment;