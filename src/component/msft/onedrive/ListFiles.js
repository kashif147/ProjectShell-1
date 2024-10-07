import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';

const ListFiles = () => {
  const { instance, accounts } = useMsal();
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [error, setError] = useState(null);

  // Function to list files in the user's OneDrive
  const listFiles = async () => {
    const graphClient = getGraphClient(instance, accounts);
    
    try {
      const response = await graphClient.api('/me/drive/root/children').get();
      console.log('Files:', response.value);
      setFiles(response.value);
    } catch (error) {
      console.error('Error listing files:', error);
      setError('Error listing files');
    }
  };

  // Function to read the content of a specific file
  const readFileContent = async (fileId) => {
    const graphClient = getGraphClient(instance, accounts);
    
    try {
      const response = await graphClient.api(`/me/drive/items/${fileId}/content`).get();
      const reader = new FileReader();
      reader.onload = () => {
        setFileContent(reader.result); // Display the content
      };
      reader.readAsText(response);
    } catch (error) {
      console.error('Error reading file content:', error);
      setError('Error reading file content');
    }
  };

  // Load files when the component is mounted
  useEffect(() => {
    listFiles();
  }, []);

  return (
    <div>
      <h2>List of Files</h2>
      {error && <p>{error}</p>}
      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.name} <button onClick={() => readFileContent(file.id)}>Read File</button>
          </li>
        ))}
      </ul>

      {fileContent && (
        <div>
          <h3>File Content</h3>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default ListFiles;
