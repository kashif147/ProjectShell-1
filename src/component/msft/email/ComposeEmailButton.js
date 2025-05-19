function ComposeEmailButton() {
  const handleClick = () => {
    const to = 'user@organization.com';       // change as needed
    const subject = 'Your Subject Here';
    const body = 'Body content goes here.';

    const url = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(url, '_blank');
  };

  return <button onClick={handleClick}>Compose New Email</button>;
}

export default ComposeEmailButton;
