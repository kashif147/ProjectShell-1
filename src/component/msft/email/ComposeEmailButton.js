function ComposeEmailButton() {
  const handleClick = () => {
    // window.open('mailto:someone@example.com?subject=Hello&body=This%20is%20the%20email%20body', '_blank');
    window.open('https://outlook.office.com/mail/deeplink/compose', '_blank'); // 

  };

  return <button onClick={handleClick}>Compose New Email</button>;
}


  export default ComposeEmailButton

  