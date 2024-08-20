import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Sidebar from './components/Sidebar/Sidebar';
import RequestSection from './components/RequestSection/RequestSection';

const App = () => {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [response, setResponse] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const handleEditEnvironment = (updatedEnvironment) => {
    setEnvironments(prevEnvironments => 
      prevEnvironments.map(env => 
        env.id === updatedEnvironment.id ? updatedEnvironment : env
      )
    );
    if (selectedEnvironment && selectedEnvironment.id === updatedEnvironment.id) {
      setSelectedEnvironment(updatedEnvironment);
    }
  };

  const handleSelectEnvironment = (env) => {
    setSelectedEnvironment(env);
    console.log('Environment selected:', env);
  };

  const handleSelectRequest = (request) => {
    if (!isRequestInProgress) {
      setSelectedRequest(request);
      setResponse(null); // Clear the response only when a new request is selected
    }
  };

  const handleResponse = (newResponse) => {
    setResponse(newResponse);
    setIsRequestInProgress(false);
  };

  const handleSendRequest = () => {
    setIsRequestInProgress(true);
  };

  const handleError = (error) => {
    console.error('Request error:', error);
    setIsRequestInProgress(false);
  };

  return (
    <MainLayout>
      <Sidebar
        environments={environments}
        selectedEnvironment={selectedEnvironment}
        onEditEnvironment={handleEditEnvironment}
        onSelectEnvironment={handleSelectEnvironment}
        onSelectRequest={handleSelectRequest}
        selectedRequest={selectedRequest}
      />
      <RequestSection
        environments={environments}
        selectedEnvironment={selectedEnvironment}
        onSelectEnvironment={handleSelectEnvironment}
        onResponse={handleResponse}
        onSendRequest={handleSendRequest}
        onError={handleError}
        response={response}
        selectedRequest={selectedRequest}
      />
    </MainLayout>
  );
};

export default App;