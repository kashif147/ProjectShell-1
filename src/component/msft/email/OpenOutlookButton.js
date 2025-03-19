import React from 'react';

/**
 * A simple React component that renders a button.
 * When clicked, the button opens the Outlook web app in a new tab.
 * The URL used for the link is 'https://outlook.office.com/mail/'.
 * This is a published URL by Microsoft for accessing Outlook web.
 * @returns {ReactElement} A button with an "Open Outlook Web" label.
 */
const OpenOutlookButton = () => {
  /**
   * Opens the Outlook web app in a new tab.
   */
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
