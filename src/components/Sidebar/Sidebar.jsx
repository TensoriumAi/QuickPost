import React, { useState } from 'react';
import { Layout, Menu, Tooltip, Button, Modal, Input, Select, Form } from 'antd';
import { FolderOutlined, ApiOutlined, DeleteOutlined, AppstoreOutlined, EnvironmentOutlined, SettingOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;
const { Option } = Select;

const Sidebar = ({ collections, environments, onSelectRequest, onRemoveCollection, onImportClick, onSelectEnvironment, onSaveRequest, onAddCollection, selectedRequest, hasChanges, unassociatedRequests }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [requestToSave, setRequestToSave] = useState(null);
  const [newCollectionModalVisible, setNewCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const renderMenuItems = (items, parentKey = '') => {
    return items.map((item, index) => {
      const key = `${parentKey}-${index}`;
      if (item.items && Array.isArray(item.items)) {
        return (
          <SubMenu key={key} icon={<FolderOutlined />} title={item.name || 'Unnamed Folder'}>
            {renderMenuItems(item.items, key)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={key} icon={<ApiOutlined />} onClick={() => onSelectRequest(item)}>
          {item.name || 'Unnamed Request'}
          {hasChanges && selectedRequest && selectedRequest.id === item.id && (
            <Button
              icon={<SaveOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveClick(item);
              }}
              style={{ marginLeft: '8px', float: 'right' }}
            />
          )}
        </Menu.Item>
      );
    });
  };

  const handleSaveClick = (request) => {
    if (request.collectionId) {
      // Existing request, save directly
      onSaveRequest(request);
    } else {
      // New request, show modal to select collection
      setRequestToSave(request);
      setNewRequestName(request.name || '');
      setSaveModalVisible(true);
    }
  };

  const handleSaveModalOk = () => {
    onSaveRequest({
      ...requestToSave,
      name: newRequestName,
      collectionId: selectedCollection
    });
    setSaveModalVisible(false);
    setNewRequestName('');
    setSelectedCollection(null);
    setRequestToSave(null);
  };

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName.trim());
      setNewCollectionName('');
      setNewCollectionModalVisible(false);
    }
  };

  const menuItems = [
    ...collections.map((collection, index) => (
      <SubMenu
        key={`collection-${index}`}
        icon={<FolderOutlined />}
        title={collection.name || 'Unnamed Collection'}
      >
        {renderMenuItems(collection.items || [], `collection-${index}`)}
      </SubMenu>
    )),
    <SubMenu
      key="unassociated"
      icon={<ApiOutlined />}
      title="Unassociated Requests"
    >
      {unassociatedRequests.map((request, index) => (
        <Menu.Item key={`unassociated-${index}`} onClick={() => onSelectRequest(request)}>
          {request.name || 'Unnamed Request'}
          {hasChanges && selectedRequest && selectedRequest.id === request.id && (
            <Button
              icon={<SaveOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveClick(request);
              }}
              style={{ marginLeft: '8px', float: 'right' }}
            />
          )}
        </Menu.Item>
      ))}
    </SubMenu>
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="dark"
      width={250}
      collapsedWidth={80}
    >
      <Menu
        theme="dark"
        mode="inline"
        defaultOpenKeys={['environments']}
        style={{ height: '100%', borderRight: 0 }}
      >
        {menuItems}
        <Menu.Item key="add-collection" icon={<PlusOutlined />} onClick={() => setNewCollectionModalVisible(true)}>
          {collapsed ? <Tooltip title="Add Collection" placement="right">Add Collection</Tooltip> : 'Add Collection'}
        </Menu.Item>
        <Menu.Item key="import-collection" icon={<AppstoreOutlined />} onClick={() => onImportClick('collection')}>
          {collapsed ? <Tooltip title="Import Collection" placement="right">Import Collection</Tooltip> : 'Import Collection'}
        </Menu.Item>
        <Menu.Item key="import-environment" icon={<EnvironmentOutlined />} onClick={() => onImportClick('environment')}>
          {collapsed ? <Tooltip title="Import Environment" placement="right">Import Environment</Tooltip> : 'Import Environment'}
        </Menu.Item>
        <SubMenu key="environments" icon={<SettingOutlined />} title="Environments">
          {environments.map((env, index) => (
            <Menu.Item key={`env-${index}`} onClick={() => onSelectEnvironment(env)}>
              {env.name}
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
      <Modal
        title="Save Request"
        visible={saveModalVisible}
        onOk={handleSaveModalOk}
        onCancel={() => {
          setSaveModalVisible(false);
          setNewRequestName('');
          setSelectedCollection(null);
          setRequestToSave(null);
        }}
      >
        <Input
          placeholder="Request Name"
          value={newRequestName}
          onChange={(e) => setNewRequestName(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Select
          style={{ width: '100%' }}
          placeholder="Select a collection"
          onChange={(value) => setSelectedCollection(value)}
        >
          <Option value="none">Save without collection</Option>
          {collections.map((collection, index) => (
            <Option key={index} value={collection.id}>{collection.name}</Option>
          ))}
          <Option value="new">Create New Collection</Option>
        </Select>
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
      </Modal>
      <Modal
        title="Add New Collection"
        visible={newCollectionModalVisible}
        onOk={handleAddCollection}
        onCancel={() => {
          setNewCollectionModalVisible(false);
          setNewCollectionName('');
        }}
      >
        <Input
          placeholder="Collection Name"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
        />
      </Modal>
    </Sider>
  );
};

export default Sidebar;