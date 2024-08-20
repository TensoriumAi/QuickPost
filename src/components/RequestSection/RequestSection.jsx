import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Modal, Space, Form } from 'antd';
import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import ImportCollection from '../ImportCollection/ImportCollection';
import RequestTabs from '../RequestTabs/RequestTabs';

const { Option } = Select;

const RequestSection = ({ onResponse, onError, body, onBodyChange, onCollectionImport, selectedRequest, environments, selectedEnvironment, onSelectEnvironment, onSaveRequest, collections, response, onSendRequest }) => {
  const [method, setMethod] = useState('GET');
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [params, setParams] = useState([]);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (selectedRequest) {
      setMethod(selectedRequest.method);
      setUrl(selectedRequest.url);
      onBodyChange(selectedRequest.body || '');
      
      // Extract params from URL
      const urlParams = extractParams(selectedRequest.url);
      
      // Combine URL-extracted params with existing params, avoiding duplicates
      const combinedParams = urlParams.map(urlParam => {
        const existingParam = selectedRequest.params?.find(p => p.key === urlParam.key && p.type === urlParam.type);
        return existingParam || urlParam;
      });

      // Add any additional params from selectedRequest that weren't in the URL
      selectedRequest.params?.forEach(param => {
        if (param.type && !combinedParams.some(p => p.key === param.key && p.type === param.type)) {
          combinedParams.push(param);
        }
      });

      setParams(combinedParams);
      setHasChanges(false);
    } else {
      // Clear fields when no request is selected
      setMethod('GET');
      setUrl('');
      onBodyChange('');
      setParams([]);
      setHasChanges(false);
    }
  }, [selectedRequest, onBodyChange]);

  const extractParams = (urlString) => {
    const params = [];
    try {
      const urlObj = new URL(urlString);
      
      // Extract path params
      const pathSegments = urlObj.pathname.split('/');
      pathSegments.forEach(segment => {
        if (segment.startsWith(':')) {
          params.push({
            type: 'path',
            key: segment.slice(1),
            value: ''
          });
        }
      });

      // Extract query params
      urlObj.searchParams.forEach((value, key) => {
        params.push({
          type: 'query',
          key,
          value
        });
      });
    } catch (error) {
      // If URL is invalid, try to extract params manually
      const [path, query] = urlString.split('?');
      
      // Extract path params
      const pathSegments = path.split('/');
      pathSegments.forEach(segment => {
        if (segment.startsWith(':')) {
          params.push({
            type: 'path',
            key: segment.slice(1),
            value: ''
          });
        }
      });

      // Extract query params
      if (query) {
        query.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) {
            params.push({
              type: 'query',
              key: decodeURIComponent(key),
              value: decodeURIComponent(value || '')
            });
          }
        });
      }
    }
    return params.filter(param => param.type); // Only return params with a valid type
  };

  const replaceEnvironmentVariables = (text) => {
    if (!selectedEnvironment) return text;
    let replacedText = text;
    selectedEnvironment.values.forEach(({ key, value, enabled }) => {
      if (enabled) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const replacements = (replacedText.match(regex) || []).length;
        if (replacements > 0) {
          console.log(`Replacing {{${key}}} with "${value}" (${replacements} occurrences)`);
        }
        replacedText = replacedText.replace(regex, value);
      } else {
        console.log(`Skipping disabled variable: ${key}`);
      }
    });
    console.log('Final replaced text:', replacedText);
    return replacedText;
  };

  const handleSendRequest = useCallback(async () => {
    console.log('Sending request...');
    setLoading(true);
    onSendRequest(); // Notify App component that a request is in progress
    try {
      const replaceVars = replaceEnvironmentVariables;
      
      let requestUrl = replaceVars(url);
      
      // Handle path params
      params.filter(param => param.type === 'path').forEach(param => {
        requestUrl = requestUrl.replace(`:${param.key}`, encodeURIComponent(replaceVars(param.value)));
      });

      const urlObj = new URL(requestUrl);
      
      // Handle query params
      params.filter(param => param.type === 'query').forEach(param => {
        if (param.key && param.value) {
          urlObj.searchParams.set(param.key, replaceVars(param.value));
        }
      });

      const responseData = await axios({
        method,
        url: urlObj.toString(),
        data: ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.parse(replaceVars(body)) : undefined,
        headers: selectedRequest?.headers?.reduce((acc, header) => {
          acc[header.key] = replaceVars(header.value);
          return acc;
        }, {})
      });
      console.log('Request successful, response:', responseData);
      onResponse(responseData);
      localStorage.lastUsedUrl = url;
    } catch (error) {
      console.error('Request error:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  }, [url, method, body, params, selectedRequest, selectedEnvironment, onResponse, onError, onSendRequest]);

  const handleImport = (collection) => {
    setImportModalVisible(false);
    onCollectionImport(collection);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    const urlParams = extractParams(newUrl);
    setParams(prevParams => {
      // Combine URL-extracted params with existing params, avoiding duplicates
      const combinedParams = urlParams.map(urlParam => {
        const existingParam = prevParams.find(p => p.key === urlParam.key && p.type === urlParam.type);
        return existingParam || urlParam;
      });

      // Add any additional params from prevParams that weren't in the URL
      prevParams.forEach(param => {
        if (!combinedParams.some(p => p.key === param.key && p.type === param.type)) {
          combinedParams.push(param);
        }
      });

      return combinedParams;
    });
  };

  const handleSaveClick = () => {
    setSaveModalVisible(true);
    form.setFieldsValue({
      requestName: selectedRequest?.name || 'New Request',
      collectionId: selectedRequest?.collectionId || 'none',
    });
  };

  const handleSaveModalOk = () => {
    form.validateFields().then((values) => {
      const requestToSave = {
        id: selectedRequest?.id, // Include the id if it's an existing request
        name: values.requestName,
        method,
        url,
        body,
        params,
        collectionId: values.collectionId === 'none' ? null : values.collectionId,
      };
      onSaveRequest(requestToSave, values.newCollectionName);
      setSaveModalVisible(false);
      form.resetFields();
      setHasChanges(false);
    });
  };

  const handleEnvironmentSelect = (value) => {
    const selectedEnv = environments.find(env => env.name === value);
    if (selectedEnv) {
      console.log('Selected Environment Variables:', selectedEnv.values);
    } else {
      console.log('No environment selected');
    }
    onSelectEnvironment(selectedEnv);
  };

  return (
    <div className="request-section">
      <div className="request-input-row">
        <Space.Compact style={{ width: 'calc(100% - 500px)' }}>
          <Input 
            placeholder="Enter URL" 
            value={url}
            onChange={handleUrlChange}
          />
          <Button icon={<SaveOutlined />} onClick={handleSaveClick} disabled={!hasChanges}>
            Save
          </Button>
        </Space.Compact>
        <Select 
          style={{ width: 100 }}
          value={method}
          onChange={(value) => setMethod(value)}
        >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
        <Select
          style={{ width: 200 }}
          value={selectedEnvironment ? selectedEnvironment.name : undefined}
          onChange={handleEnvironmentSelect}
          placeholder="Select Environment"
        >
          <Option value={undefined}>No Environment</Option>
          {environments.map((env) => (
            <Option key={env.name} value={env.name}>{env.name}</Option>
          ))}
        </Select>
        <Button type="primary" icon={<SendOutlined />} onClick={handleSendRequest} loading={loading}>
          Send
        </Button>
      </div>
      <RequestTabs
        body={body}
        onBodyChange={onBodyChange}
        params={params}
        onParamsChange={setParams}
        url={url}
        response={response}
      />
      <Modal
        title="Save Request"
        visible={saveModalVisible}
        onOk={handleSaveModalOk}
        onCancel={() => setSaveModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="requestName"
            label="Request Name"
            rules={[{ required: true, message: 'Please input the request name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="collectionId"
            label="Collection"
            rules={[{ required: true, message: 'Please select a collection or choose to save without a collection!' }]}
          >
            <Select>
              <Option value="none">Save without collection</Option>
              {collections.map((collection) => (
                <Option key={collection.id} value={collection.id}>{collection.name}</Option>
              ))}
              <Option value="new">Create New Collection</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.collectionId !== currentValues.collectionId}
          >
            {({ getFieldValue }) => 
              getFieldValue('collectionId') === 'new' ? (
                <Form.Item
                  name="newCollectionName"
                  label="New Collection Name"
                  rules={[{ required: true, message: 'Please input the new collection name!' }]}
                >
                  <Input />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Import Postman Collection"
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <ImportCollection onImport={handleImport} />
      </Modal>
    </div>
  );
};

export default React.memo(RequestSection);