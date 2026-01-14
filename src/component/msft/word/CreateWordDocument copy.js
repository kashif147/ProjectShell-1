import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const CreateWordDocument = ({ refreshFileList }) => {
  const { instance, accounts } = useMsal();
  const [fileUrl, setFileUrl] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [initialDocumentName, setInitialDocumentName] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const createDocument = async () => {
    const graphClient = getGraphClient(instance, accounts);

    // Generate a unique document name by appending a timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const documentName = `NewDocument_${timestamp}.docx`;

    const driveItem = {
      name: documentName,
      file: {}, // An empty file object
    };

    try {
      const response = await graphClient.api('/me/drive/root:/projectShell:/children').post(driveItem);
      if (response && response.webUrl && response.id) {
        setFileUrl(response.webUrl);
        setDocumentId(response.id);
        setInitialDocumentName(documentName);
        refreshFileList();  // Trigger a refresh of the file list after creation
        alert('Document Created. Please rename and save it in Word Online.');
        window.open(response.webUrl, '_blank'); // Open the document in a new tab
      } else {
        console.error('Error: No document ID returned from API', response);
        alert('Error: Failed to create document.');
      }
    } catch (error) {
      console.error('Error creating document:', error.message, error);
      alert('Error: Failed to create document.');
    }
  };

  // Poll to check if the document's name has changed
  useEffect(() => {
    if (documentId) {
      const graphClient = getGraphClient(instance, accounts);

      const pollDocumentName = async () => {
        try {
          const documentMetadata = await graphClient.api(`/me/drive/items/${documentId}`).get();
          if (documentMetadata && documentMetadata.name !== initialDocumentName) {
            setInitialDocumentName(documentMetadata.name);
            refreshFileList(); // Trigger refresh when name change is detected
            clearInterval(intervalId); // Stop polling
          }
        } catch (error) {
          console.error('Error polling document name:', error);
        }
      };

      const id = setInterval(pollDocumentName, 5000); // Poll every 5 seconds
      setIntervalId(id);

      // Clear interval on unmount or when documentId changes
      return () => clearInterval(id);
    }
  }, [documentId, instance, accounts, initialDocumentName, refreshFileList]);

  const handleCreateClick = () => {
    createDocument();
  };

  return (
    <div>
      <button onClick={handleCreateClick}>Create and Open Word Document</button>
      {fileUrl && (
        <div>
          <p>Your document is ready: <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open Document</a></p>
        </div>
      )}
    </div>
  );
};

export default CreateWordDocument;