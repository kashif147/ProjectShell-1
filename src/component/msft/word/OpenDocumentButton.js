function OpenDocumentButton() {
    const handleClick = () => {
      window.open(`https://${process.env.REACT_APP_TENANT_ID}.sharepoint.com/sites/<site>/Shared%20Documents/<document>.docx?web=1`, '_blank');
    };
  
    return <button onClick={handleClick}>Open Document in Word for Web</button>;
  }

  export default OpenDocumentButton