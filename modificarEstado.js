const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const port = process.env.PORT4; // Asegúrate de configurar este puerto correctamente
const app = express();
app.use(bodyParser.json());
app.use(cors());

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

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

app.post('/modificarEstado', verificarToken, async (req, res) => {
  const { id } = req.body;

  const query = `
    UPDATE usuarios_qr
    SET habilitado_id = CASE WHEN habilitado_id = 1 THEN 0 ELSE 1 END
    WHERE usuario_id = ${id}
  `;

  try {
    console.log('Ejecutando la consulta:', query);
    const response = await client.query(query);

    if (response.rowCount > 0) {
      res.send('Estado modificado exitosamente');
    } else {
      console.error('Error modificando el estado:', response);
      res.status(500).send('Error modificando el estado');
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
