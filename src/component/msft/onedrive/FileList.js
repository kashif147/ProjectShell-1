import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '../graphClient';
import FileActions from './FileActions';

const FileList = ({ path, onFolderClick, refreshFileList }) => {
  const { instance, accounts } = useMsal();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!path) {
      
      return;
    }

    setLoading(true);
    try {
      const graphClient = getGraphClient(instance, accounts);
      const formattedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      const response = await graphClient.api(`/me/drive/root:${formattedPath}:/children`).get();
      
      
      // Fetching item details including webUrl for files (documents)
      const itemsWithUrls = await Promise.all(
        response.value.map(async (item) => {
          if (!item.folder) {
            const itemDetails = await graphClient.api(`/me/drive/items/${item.id}`).get();
            return { ...item, webUrl: itemDetails.webUrl };
          }
          return item; // Folders don't have a webUrl
        })
      );
      
      setItems(itemsWithUrls);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [path]);

  const handleFolderClick = (folderName) => {
    const newPath = path.endsWith('/') ? `${path}${folderName}` : `${path}/${folderName}`;
    onFolderClick(newPath);
  };

  const handleBackClick = () => {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/projectShell';
    onFolderClick(parentPath);
  };

  return (
    <div>
      <button onClick={handleBackClick} disabled={path === '/projectShell'}>
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
                  📄 
                  <a 
                    href={item.webUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ marginRight: '10px', textDecoration: 'underline', color: 'blue' }}
                  >
                    {item.name}
                  </a>
                  <FileActions itemId={item.id} itemName={item.name} onDelete={refreshFileList} />
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
