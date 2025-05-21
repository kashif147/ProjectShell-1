import React from 'react';
import { MdWidthFull } from 'react-icons/md';

const NotDesign = ({ message = "This section is not yet designed." }) => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
    //   border: '2px dashed #ccc',
      backgroundColor: '#fefefe',
      borderRadius: '8px',
      color: '#888',
      fontSize: '18px',
      fontStyle: 'italic',
      marginTop: '20px',
      width:'93vw',

    },
  };

  return (
    <div style={styles.container}>
      🚧 This page is under development. Please check back soon!
    </div>
  );
};

export default NotDesign;
