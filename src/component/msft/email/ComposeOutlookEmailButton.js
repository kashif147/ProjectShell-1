import { useMsal } from '@azure/msal-react';

const ComposeOutlookEmailButton = () => {
  const { instance, accounts } = useMsal();

  const handleClick = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ['Mail.Send', 'Mail.ReadWrite','User.Read'],
      });

      // Use the access token in the email compose URL
      const token = response.accessToken;
      // const mailUrl = `https://outlook.office.com/mail/deeplink/compose?access_token=${token}`;
      // window.open(mailUrl, '_blank');
      
      const mailUrl = `https://outlook.office.com/mail/deeplink/compose?access_token=${encodeURIComponent(token)}`;
      window.open(mailUrl, '_blank');

    } catch (error) {
      

      // If token acquisition fails, fall back to interactive login
      try {
        const interactiveResponse = await instance.acquireTokenPopup({
          scopes: ['Mail.Send', 'Mail.ReadWrite', 'User.Read'],
        });
        const token = interactiveResponse.accessToken;
        const mailUrl = `https://outlook.office.com/mail/deeplink/compose?access_token=${token}`;
        window.open(mailUrl, '_blank');
      } catch (interactiveError) {
        
      }
    }
  };

  return <button onClick={handleClick}>Compose New Email in Outlook</button>;
};

export default ComposeOutlookEmailButton;
