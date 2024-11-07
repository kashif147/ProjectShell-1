import React, { useState } from 'react';
import CreateWordDocument from '../word/CreateWordDocument';
import FileList from './FileList';

const FileExplorer = () => {
  const [path, setPath] = useState('/projectShell');

  const handleFolderClick = (newPath) => {
    setPath(newPath);
  };

  const refreshFileList = () => {
    // This will trigger the useEffect in FileList
    setPath((prevPath) => prevPath);
  };

  return (
    <div>
      <CreateWordDocument currentPath={path} refreshFileList={refreshFileList} />
      <FileList path={path} onFolderClick={handleFolderClick} refreshFileList={refreshFileList} />
    </div>
  );
};

export default FileExplorer;
