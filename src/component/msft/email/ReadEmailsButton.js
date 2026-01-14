import { useMsal } from '@azure/msal-react';

const ReadEmailsButton = () => {
  const { instance, accounts } = useMsal();


  const fetchEmails = async (accessToken) => {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me/messages", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      
      // You can now display the emails in your UI
    } catch (error) {
      
    }
  };
  
  
  const handleReadEmails = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["Mail.Read"],
      });
      const accessToken = response.accessToken;

      // Call the Graph API to get emails
      fetchEmails(accessToken);
    } catch (error) {
      
    }
  };

  return <button onClick={handleReadEmails}>Read Emails</button>;
};

export default ReadEmailsButton;