import React, { useState, useEffect } from 'react';
import { Layout, Modal, message, Button } from 'antd';
import Sidebar from '../Sidebar/Sidebar';
import RequestSection from '../RequestSection/RequestSection';
import ResponseSection from '../ResponseSection/ResponseSection';
import ImportCollection from '../ImportCollection/ImportCollection';
import ImportEnvironment from '../ImportEnvironment/ImportEnvironment';
import LocalStorageService from '../../services/LocalStorageService';

const { Content } = Layout;

const MainLayout = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [body, setBody] = useState('');
  const [collections, setCollections] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importType, setImportType] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [unassociatedRequests, setUnassociatedRequests] = useState([]);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  useEffect(() => {
    const savedCollections = LocalStorageService.getCollection('postmanCollections');
    const savedEnvironments = LocalStorageService.getCollection('postmanEnvironments');
    const savedUnassociatedRequests = LocalStorageService.getCollection('unassociatedRequests');
    console.log('Loaded environments:', savedEnvironments); // Add this line
    setCollections(savedCollections);
    setEnvironments(savedEnvironments);
    setUnassociatedRequests(savedUnassociatedRequests);
  }, []);

  const handleResponse = (res) => {
    setResponse(res);
    setError(null);
  };

  const handleError = (err) => {
    setError(err);
    setResponse(null);
  };

  const handleCollectionImport = (newCollection) => {
    const updatedCollections = [...collections, newCollection];
    setCollections(updatedCollections);
    LocalStorageService.setItem('postmanCollections', updatedCollections);
    setImportModalVisible(false);
  };

  const handleEnvironmentImport = (newEnvironment) => {
    const updatedEnvironments = [...environments, newEnvironment];
    setEnvironments(updatedEnvironments);
    LocalStorageService.setItem('postmanEnvironments', updatedEnvironments);
    setImportModalVisible(false);
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setBody(request.body || '');
  };

  const handleRemoveCollection = (index) => {
    const updatedCollections = collections.filter((_, i) => i !== index);
    setCollections(updatedCollections);
    LocalStorageService.setItem('postmanCollections', updatedCollections);
  };

  const handleImportClick = (type) => {
    setImportType(type);
    setImportModalVisible(true);
  };

  const handleSelectEnvironment = (environment) => {
    setSelectedEnvironment(environment);
  };

  const handleSaveRequest = (request, newCollectionName) => {
    let updatedCollections = [...collections];
    let updatedUnassociatedRequests = [...unassociatedRequests];
    
    if (newCollectionName) {
      // Create a new collection
      const newCollection = {
        id: Date.now(),
        name: newCollectionName,
        items: []
      };
      updatedCollections.push(newCollection);
      request.collectionId = newCollection.id;
    }

    if (request.id) {
      // Update existing request
      if (request.collectionId) {
        updatedCollections = updatedCollections.map(collection => {
          if (collection.id === request.collectionId) {
            const updatedItems = collection.items.map(item => 
              item.id === request.id ? request : item
            );
            return { ...collection, items: updatedItems };
          }
          return collection;
        });
        // Remove from unassociated if it was there before
        updatedUnassociatedRequests = updatedUnassociatedRequests.filter(item => item.id !== request.id);
      } else {
        // Update in unassociated requests
        updatedUnassociatedRequests = updatedUnassociatedRequests.map(item => 
          item.id === request.id ? request : item
        );
      }
      message.success('Request updated successfully');
    } else {
      // Add new request
      if (request.collectionId) {
        updatedCollections = updatedCollections.map(collection => {
          if (collection.id === request.collectionId) {
            return {
              ...collection,
              items: [...collection.items, { ...request, id: Date.now() }]
            };
          }
          return collection;
        });
      } else {
        // Add to unassociated requests
        updatedUnassociatedRequests.push({ ...request, id: Date.now() });
      }
      message.success('Request saved successfully');
    }

    setCollections(updatedCollections);
    setUnassociatedRequests(updatedUnassociatedRequests);
    LocalStorageService.setItem('postmanCollections', updatedCollections);
    LocalStorageService.setItem('unassociatedRequests', updatedUnassociatedRequests);
  };

  const handleAddCollection = (name) => {
    const newCollection = {
      id: Date.now(),
      name,
      items: []
    };
    const updatedCollections = [...collections, newCollection];
    setCollections(updatedCollections);
    LocalStorageService.setItem('postmanCollections', updatedCollections);
    message.success('New collection added successfully');
  };

  const handleRequestChange = (newHasChanges) => {
    setHasChanges(newHasChanges);
  };

  const handleEditEnvironment = (updatedEnvironment) => {
    const updatedEnvironments = environments.map(env =>
      env.name === updatedEnvironment.name ? updatedEnvironment : env
    );
    setEnvironments(updatedEnvironments);
    LocalStorageService.setItem('postmanEnvironments', updatedEnvironments);
    message.success('Environment updated successfully');
  };

  const handleSendRequest = () => {
    setIsRequestInProgress(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar 
        collections={collections}
        environments={environments}
        onSelectRequest={handleSelectRequest}
        onRemoveCollection={handleRemoveCollection}
        onImportClick={handleImportClick}
        onSelectEnvironment={handleSelectEnvironment}
        onSaveRequest={handleSaveRequest}
        onAddCollection={handleAddCollection}
        selectedRequest={selectedRequest}
        hasChanges={hasChanges}
        unassociatedRequests={unassociatedRequests}
        onEditEnvironment={handleEditEnvironment}
      />
      <Layout className="site-layout">
        <Content style={{ margin: '16px', padding: '16px', background: '#141414' }}>
          <RequestSection 
            onResponse={handleResponse} 
            onError={handleError}
            body={body}
            onBodyChange={setBody}
            onCollectionImport={handleCollectionImport}
            selectedRequest={selectedRequest}
            environments={environments}
            selectedEnvironment={selectedEnvironment}
            onSelectEnvironment={handleSelectEnvironment}
            onSaveRequest={handleSaveRequest}
            collections={collections}
            onRequestChange={handleRequestChange}
            onSendRequest={handleSendRequest}
            isRequestInProgress={isRequestInProgress}
          />
          <ResponseSection response={response} error={error} />
        </Content>
      </Layout>
      <Modal
        title={`Import ${importType === 'collection' ? 'Collection' : 'Environment'}`}
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        {importType === 'collection' ? (
          <ImportCollection onImport={handleCollectionImport} />
        ) : (
          <ImportEnvironment onImport={handleEnvironmentImport} />
        )}
      </Modal>
    </Layout>
  );
};

export default MainLayout;