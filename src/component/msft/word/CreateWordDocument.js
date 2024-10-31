import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const CreateWordDocument = () => {
  const { instance, accounts } = useMsal();
  const [fileUrl, setFileUrl] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [eTag, setETag] = useState(null);

  const createDocument = async () => {
    const graphClient = getGraphClient(instance, accounts);
    
    // Generate a unique document name by appending a timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const documentName = `NewDocument_${timestamp}.docx`;

    const driveItem = {
      name: documentName,
      file: {}, // An empty file object
    };

    console.log('Drove Item', driveItem)
    try {
      const userDetails = await graphClient.api('/me').get();
      console.log(userDetails);

      const user = userDetails.userPrincipalName.replace(/[@.]/g, '_');

      console.log('Attempting to create a new document...');
      const response = await graphClient.api('/me/drive/root/children').post(driveItem);
  
      console.log('Response from Microsoft Graph:', response);

      if (response && response.id) {
        const newDocumentId = response.id;
        setDocumentId(newDocumentId);
        // Construct the URL to directly open the document in Word Online's editor
        const wordOnlineEditUrl = `https://creativelabs147-my.sharepoint.com/:w:/r/personal/${user}/_layouts/15/Doc.aspx?sourcedoc=%7B${newDocumentId}%7D&file=${documentName}&action=edit&mobileredirect=true`;
        fetchDocumentMetadata(newDocumentId); // Fetch eTag after creating


        // Set the file URL to state so it can be opened or displayed
        setFileUrl(wordOnlineEditUrl);
        alert('Document Created and Opened Successfully in Word Online!');
        window.open(wordOnlineEditUrl, '_blank'); // Open the document directly in a new tab
      } else {
        console.error('Error: No document ID returned from API', response);
        alert('Error: Failed to create document.');
      }
    } catch (error) {
      console.error('Error creating document:', error.message, error);
      alert('Error: Failed to create document.');
    }
  };

  const fetchDocumentMetadata = async (docId) => {
    const graphClient = getGraphClient(instance, accounts);
    try {
      console.log(`Fetching metadata for document ID: ${docId}`);
      const metadata = await graphClient.api(`/me/drive/items/${docId}`).get();

      if (metadata && metadata.eTag) {
        setETag(metadata.eTag); // Save the latest eTag
        console.log('Fetched document metadata, eTag:', metadata.eTag);
      } else {
        console.error('Error: Could not retrieve metadata or eTag');
      }
    } catch (error) {
      console.error('Error fetching document metadata:', error.message, error);
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

export default CreateWordDocument;
