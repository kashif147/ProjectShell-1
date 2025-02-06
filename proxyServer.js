const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5001;

app.get('/getDocument', async (req, res) => {
  const documentUrl = req.query.url;

  if (!documentUrl) {
    return res.status(400).send('Document URL is required');
  }

  const accessToken = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer authorization header

  if (!accessToken) {
    return res.status(401).send('Access token is required');
  }

  try {
    const response = await axios.get(documentUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'arraybuffer',
    });

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching document:', error.message);
    res.status(500).send('Error fetching document');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
