import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

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
          parentReference: { path: destinationPath },
        });

   

      const documentWebUrl = await getFileIdByName(graphClient, newDocumentName, destinationPath);

      if (documentWebUrl) {
        setFileUrl(documentWebUrl);
        await fetchDocumentContent(documentWebUrl); // Fetch content using proxy
      } else {
        
      }
    } catch (error) {
      
    }
  };

  const getFileIdByName = async (graphClient, fileName, directoryPath) => {
    try {
      const response = await graphClient.api(`${directoryPath}:/children`).get();
      const file = response.value.find((item) => item.name === fileName);

      return file ? file.webUrl : null;
    } catch (error) {
      
      return null;
    }
  };

  const fetchDocumentContent = async (documentWebUrl) => {
    try {
      const account = accounts[0];
      const accessTokenResponse = await instance.acquireTokenSilent({
        scopes: ['User.Read', 'Files.Read.All'],
        account,
      });
      const accessToken = accessTokenResponse.accessToken;

      const proxyUrl = `http://localhost:5001/getDocument?url=${encodeURIComponent(documentWebUrl)}`;
      const response = await fetch(proxyUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Pass access token in Authorization header
        },
      });

      if (response.ok) {
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank'); // Open document in a new tab
      } else {
        
      }
    } catch (error) {
      
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
