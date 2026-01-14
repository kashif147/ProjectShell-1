import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const UpdateWordDocument = () => {
  const { instance, accounts } = useMsal();
  const [fileUrl, setFileUrl] = useState(null);
  
  const createDocument = async () => {
    const graphClient = getGraphClient(instance, accounts);

    const driveItem = {
      name: 'NewDocument.docx',
      file: {}, // Empty file object indicates a Word document
    };

    try {
      // Create the document in OneDrive
      const response = await graphClient.api('/me/drive/root/children').post(driveItem);
      const documentId = response.id;

      // Build the URL to open the document in Word Online in edit mode
      const wordOnlineUrl = `https://word.office.com/Doc.aspx?sourcedoc=${documentId}&action=edit`;

      // Set the file URL to state so it can be opened or displayed
      setFileUrl(wordOnlineUrl);

      // Optionally, automatically navigate to the Word Online editor after creation
      window.open(wordOnlineUrl, '_blank');
      alert('Document Created and Opened Successfully in Word Online!');

    } catch (error) {
      
      alert('Error creating document');
    }
  };

  const handleClick = () => {
    createDocument();
  };

  return (
    <div>
      <button onClick={handleClick}>Create and Open Word Document in Edit Mode</button>
      {fileUrl && (
        <div>
          <p>Your document is ready: <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open Document</a></p>
        </div>
      )}
    </div>
  );
};

export default UpdateWordDocument;
