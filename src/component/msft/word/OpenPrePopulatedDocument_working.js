import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

/* global Office, Word */

const OpenPrePopulatedDocument = () => {
  const { instance, accounts } = useMsal();
  const [fileUrl, setFileUrl] = useState(null);

  const copyTemplateAndOpenDocument = async () => {
    const graphClient = getGraphClient(instance, accounts);
    const templatePath = '/me/drive/root:/projectShell/templates/UserTemplate.docx';
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const newDocumentName = `UserLetter_${timestamp}.docx`;
    const destinationPath = '/me/drive/root:/projectShell';

    try {
      const copyResponse = await graphClient
        .api(`${templatePath}:/copy`)
        .post({
          name: newDocumentName,
          parentReference: { path: destinationPath }
        });

      console.log('Template copied:', copyResponse);

      const documentWebUrl = await getFileIdByName(graphClient, newDocumentName, destinationPath);

      if (documentWebUrl) {
        setFileUrl(documentWebUrl);
        window.open(documentWebUrl, '_blank');
        console.log('Document opened successfully');

      } else {
        console.error('Error: Unable to retrieve webUrl');
        // alert('Error: Failed to copy template.');
      }
    } catch (error) {
      console.error('Error copying template document:', error.message, error);
    //   alert('Error: Failed to copy template.');
    }
  };

  const getFileIdByName = async (graphClient, fileName, directoryPath) => {
    try {
      const response = await graphClient.api(`${directoryPath}:/children`).get();
      const file = response.value.find((item) => item.name === fileName);

      return file ? file.webUrl : null;
    } catch (error) {
      console.error('Error retrieving file ID:', error);
      return null;
    }
  };

  const handleOpenDocumentClick = () => {
    copyTemplateAndOpenDocument();
  };

  return (
    <div>
      <button onClick={handleOpenDocumentClick}>Open Pre-Populated User Letter</button>
      {fileUrl && (
        <div>
          <p>Your document is ready: <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open Document</a></p>
        </div>
      )}
    </div>
  );
};

export default OpenPrePopulatedDocument;
