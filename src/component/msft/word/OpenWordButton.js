function OpenWordButton() {
    const handleClick = () => {
      window.open('https://office.live.com/start/Word.aspx', '_blank');
    };
  
    return <button onClick={handleClick}>Open Word for Web</button>;
  }
  
  export default OpenWordButton


