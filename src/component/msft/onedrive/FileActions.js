import React from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const FileActions = ({ itemId, itemName, onDelete }) => {
  const { instance, accounts } = useMsal();

  const deleteFile = async () => {
    const graphClient = getGraphClient(instance, accounts);
    try {
      await graphClient.api(`/me/drive/items/${itemId}`).delete();
      // alert('File deleted successfully.');
      onDelete(); // Call the refresh function after deletion
    } catch (error) {
      
      // alert('Error: Failed to delete file.');
    }
  };

  return (
    <button onClick={deleteFile}>Delete</button>
  );
};

export default FileActions;
