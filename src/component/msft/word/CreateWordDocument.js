import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const CreateWordDocument = ({ currentPath, refreshFileList }) => {
  const { instance, accounts } = useMsal();
  const [fileUrl, setFileUrl] = useState(null);

  const createDocument = async () => {
    const graphClient = getGraphClient(instance, accounts);
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const documentName = `NewDocument_${timestamp}.docx`;

    const driveItem = {
      name: documentName,
      file: {},
    };

    try {
      // Use currentPath instead of hardcoded '/projectShell'
      const response = await graphClient.api(`/me/drive/root:${currentPath}:/children`).post(driveItem);
      if (response && response.webUrl) {
        setFileUrl(response.webUrl);
        // alert('Document Created. Please rename and save it in Word Online.');
        window.open(response.webUrl, '_blank');
        refreshFileList(); // Refresh the file list after creating the document
      } else {
        // alert('Error: Failed to create document.');
        console.log('Error: Failed to create document.')
      }
    } catch (error) {
      console.error('Error creating document:', error.message);
      // alert('Error: Failed to create document.');
    }
  };

  return (
    <div>
      <button onClick={createDocument}>Create New Word Document</button>
      {/* {fileUrl && (
        <div>
          <p>Your document is ready: <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open Document</a></p>
        </div>
      )} */}
    </div>
  );
};

export default CreateWordDocument;
