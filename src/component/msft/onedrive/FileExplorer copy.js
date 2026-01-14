import React, { useState } from 'react';
import FileList from './FileList';

const FileExplorer = () => {
  const [path, setPath] = useState('/projectShell');  // Default to root directory

  const handleFolderClick = (newPath) => {
    console.log("Navigating to path:", newPath);  // Debugging log
    setPath(newPath);
  };

  return (
    <div>
      <FileList path={path} onFolderClick={handleFolderClick} />
    </div>
  );
};

export default FileExplorer;
