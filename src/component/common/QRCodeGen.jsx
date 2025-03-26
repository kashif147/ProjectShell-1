import React, { useState, useRef } from 'react';


const QRCodeDownloader = () => {
 

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>QR Code Generator and Downloader</h2>
      <div ref={qrRef} style={{ display: 'inline-block', background: 'white', padding: '16px' }}>
        <QRCode value={qrValue} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={downloadSVG}>Download QR Code</button>
      </div>
    </div>
  );
};

export default QRCodeDownloader;
