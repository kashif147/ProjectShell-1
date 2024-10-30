import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const OpenPrePopulatedDocument = () => {
  const { instance, accounts } = useMsal();
  const [fileUrl, setFileUrl] = useState(null);

  const copyTemplateAndOpenDocument = async () => {
    const graphClient = getGraphClient(instance, accounts);

    // Path to the pre-formatted template in OneDrive or SharePoint
    // const templatePath = '/drive/root:/templates/UserTemplate.docx';
    const templatePath = '/me/drive/root:/projectShell/templates/UserTemplate.docx';
    // const templatePath = '/Documents/projectShell/templates/UserTemplate.docx';

    // const filepath = verifyTemplatePath()
    // console.log(filepath)
    // alert('Error: incorrect file path', filepath);

    // Generate a unique name for the new document
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const newDocumentName = `UserLetter_${timestamp}.docx`;
    const destinationPath = '/me/drive/root:/projectShell'
    try {
      // Step 1: Copy the template file
      const copyResponse = await graphClient
        .api(`${templatePath}:/copy`)
        .post({
          name: newDocumentName,
        //   parentReference: { path: '/drive/root:/Documents' } // Path where the new file will be stored
          parentReference: { path:  destinationPath} // Path where the new file will be stored
        //   parentReference: { path: '/Documents/projectShell' } // Path where the new file will be stored
        //   const templatePath = '/Documents/projectShell/templates/UserTemplate.docx';
        });

      console.log('Template copied:', copyResponse);


       // Introduce a delay to allow the copy operation to complete (2 seconds here)
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // Retrieve the ID of the copied file by listing the destination directory
    // const newDocumentId = await getFileIdByName(graphClient, newDocumentName, destinationPath);


    //    // The copy operation is asynchronous; get the location for polling
    //     const copyLocation = copyResponse?.headers?.location;

    //   if (copyLocation) {    
    //     const newDocumentId = await pollCopyStatusWithBackoff(copyLocation);
    
    // Use the webUrl to open the document directly in Word Online
    const documentWebUrl = await getFileIdByName(graphClient, newDocumentName, destinationPath);

        if (documentWebUrl){
        // Step 2: Construct the Word Online URL to open the copied document in edit mode
        // const wordOnlineUrl = documentWebUrl //buildWordOnlineUrl(newDocumentId, newDocumentName);
        console.log(documentWebUrl)
        setFileUrl(documentWebUrl);

        // Step 3: Open the document in Word Online for editing
        window.open(documentWebUrl, '_blank');
        console.log('Document opened successfully');
    }
    //   } 
      else {
        console.error('Error: Unable to retrieve webUrl');
        alert('Error: Failed 1 to copy template.');
      }
    } catch (error) {
        console.error('Error copying template document:', error.message, error);
      alert('Error: Failed 2 to copy template.');
    }
  };

//   // Function to build the Word Online URL for editing
//   const buildWordOnlineUrl = (documentId, documentName) => {
//     const tenantDomain = 'creativelabs147-my.sharepoint.com'; // Your SharePoint tenant domain
//     // const userPath = 'personal/your_user_onmicrosoft_com'; // Your OneDrive user path
//     const userPath = 'personal/creativelab1_creativelabs147_onmicrosoft_com'; // Your OneDrive user path

//     // return 'https://creativelabs147-my.sharepoint.com/personal/creativelab1_creativelabs147_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BAF0EADD8-0BDF-4EB3-8E38-95610B3C261D%7D&file=UserTemplate.docx&action=default&mobileredirect=true';
   
//     return `https://${tenantDomain}/:w:/r/${userPath}/_layouts/15/Doc.aspx?sourcedoc=%7B${documentId}%7D&file=${documentName}&action=edit&mobileredirect=true`;
//   };

  const getFileIdByName = async (graphClient, fileName, directoryPath) => {
    try {
      const response = await graphClient
        .api(`${directoryPath}:/children`)
        .get();
      
      // Find the file by name in the directory listing
      const file = response.value.find((item) => item.name === fileName);
      
      if (file) {
        return file.webUrl;
      } else {
        console.error(`File ${fileName} not found in ${directoryPath}`);
        return null;
      }
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
