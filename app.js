const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(express.static('public'));

server.listen(3000, () => {
  console.log('Serveur HTTP écoutant sur le port 3000.');
});
