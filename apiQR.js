const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const port = process.env.PORT6; 
const app = express();
app.use(bodyParser.json());
app.use(cors());

function verificarToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(req.token, 'clave_secreta', (err, authData) => {
      if (err) {
        console.log('Error al verificar el token:', err);
        res.sendStatus(403);
      } else {
        console.log('Token verificado exitosamente:', authData);
        req.authData = authData;
        next();
      }
    });
  } else {
    console.log('No se proporcionó ningún token');
    res.sendStatus(403);
  }
}

app.post('/generarQR', verificarToken, async (req, res) => {
  const { texto } = req.body;

  try {
    const response = await axios.get(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${texto}`);
    res.send(response.data);
  } catch (error) {
    console.error('Error al generar el código QR:', error);
    res.status(500).send('Error al generar el código QR');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
