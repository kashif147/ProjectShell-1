function ComposeEmailButton() {
  const handleClick = () => {
    // window.open('mailto:someone@example.com?subject=Hello&body=This%20is%20the%20email%20body', '_blank');
    window.open('https://outlook.office.com/mail/deeplink/compose', '_blank'); // 

  };

  return <button onClick={handleClick}>Compose New Email</button>;
}


  export default ComposeEmailButton

  /**
   * This component renders a button that when clicked will open a new compose window for Outlook.
   * The window is opened in a new tab.
   * The URL for the compose window is https://outlook.office.com/mail/deeplink/compose.
   * This URL is an undocumented Microsoft endpoint for opening a new compose window with the Outlook web app.
   * The URL does not require any authentication or authorization to access.
   * The button is rendered with the text "Compose New Email".
   * The button is given an onClick event handler that opens the compose window when clicked.
   */
