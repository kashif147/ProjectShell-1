import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const DocumentInstance = ({ refreshFileList }) => {
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
        setDocumentId(response.id);
        setInitialDocumentName(documentName);
        refreshFileList();  // Trigger a refresh of the file list after creation

        // Now replace placeholders in the document
        await replacePlaceholders(response.id, documentName);

        // Open the document in a new tab
        window.open(response.webUrl, '_blank');
      } else {
        
        alert('Error: Failed to create document.');
      }
    } catch (error) {
      
      alert('Error: Failed to create document.');
    }
  };

  const replacePlaceholders = async (documentId, documentName) => {
    const graphClient = getGraphClient(instance, accounts);

    // Define your placeholder data
    const data = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      message: "some text"
    };

    // You may need to retrieve the document content, this depends on how you want to replace the placeholders
    try {
      // Fetch the document content (assuming the document is a plain text)
      const documentContent = await graphClient.api(`/me/drive/items/${documentId}/content`).get();

      // Replace placeholders
      let updatedContent = documentContent;
      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        updatedContent = updatedContent.replace(new RegExp(placeholder, "g"), value);
      }

      // Update the document with the new content (this will depend on the format)
      await graphClient.api(`/me/drive/items/${documentId}/content`).put(updatedContent);
    } catch (error) {
      
      alert('Error: Failed to replace placeholders in the document.');
    }
  };

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

export default DocumentInstance;
