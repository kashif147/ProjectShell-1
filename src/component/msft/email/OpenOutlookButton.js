import React from 'react';

const OpenOutlookButton = () => {
  const openOutlookWeb = () => {
    window.open('https://outlook.office.com/mail/', '_blank'); // Opens Outlook in a new tab
  };

  return (
    <button onClick={openOutlookWeb}>
      Open Outlook Web
    </button>
  );
};

export default OpenOutlookButton;
