import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';
import FileActions from './FileActions';

const FileList = ({ path = '/', onFolderClick }) => {
  const { instance, accounts } = useMsal();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!path) {
      console.error("Path is undefined or empty");  // Debugging
      return;
    }
    
    console.log("Fetching items from path:", path);  // Debugging log

    setLoading(true);
    try {
      const graphClient = getGraphClient(instance, accounts);
      const formattedPath = path.endsWith('/') ? path.slice(0, -1) : path;  // Remove trailing slash
      const response = await graphClient.api(`/me/drive/root:${formattedPath}:/children`).get();
      setItems(response.value);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [path]);

  const handleFolderClick = (folderPath) => {
    const newPath = `${path}/${folderPath}`;
    console.log("Folder clicked, new path:", newPath);  // Debugging log
    onFolderClick(newPath);
  };

  const handleBackClick = () => {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    console.log("Navigating back to path:", parentPath);  // Debugging log
    onFolderClick(parentPath);
  };

  const refreshItems = () => {
    fetchItems();
  };

  return (
    <div>
      <button onClick={handleBackClick} disabled={path === '/' || path === '/projectShell'}>
        Back
      </button>
      {loading ? (
        <p>Loading items...</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.folder ? (
                <button onClick={() => handleFolderClick(item.name)}>
                  📁 {item.name}
                </button>
              ) : (
                <>
                  📄 {item.name} 
                  <FileActions itemId={item.id} itemName={item.name} onDelete={refreshItems} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;