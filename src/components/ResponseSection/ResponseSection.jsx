import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Paragraph } = Typography;

const ResponseSection = ({ response, error }) => {
  if (!response && !error) return null;

  const formatData = (data) => {
    if (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE html>')) {
      return data.slice(0, 500) + '...'; // Show first 500 characters of HTML
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card title="Response" className="response-section">
      {error ? (
        <Text type="danger">Error: {error.message}</Text>
      ) : (
        <>
          <Paragraph><Text strong>URL:</Text> {response.config.url}</Paragraph>
          <Paragraph><Text strong>Status:</Text> {response.status} {response.statusText}</Paragraph>
          <Paragraph>
            <Text strong>Data:</Text>
            <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
              {formatData(response.data)}
            </pre>
          </Paragraph>
        </>
      )}
    </Card>
  );
};

export default ResponseSection;