const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const port = process.env.PORT3;
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
  
  app.get('/obtenerusuarios', verificarToken, async (req, res) => {
    const query = `
      SELECT usuarios_qr.usuario_id, usuarios_qr.usuario_name, usuarios_qr.usuario_password, habilitado.estado, tipo_usuario.tipo, usuarios_qr.created_at
      FROM usuarios_qr
      INNER JOIN habilitado ON usuarios_qr.habilitado_id = habilitado.id
      INNER JOIN tipo_usuario ON usuarios_qr.tipo_usuario_id = tipo_usuario.id
      order by usuarios_qr.usuario_id
    `;
  
    try {
      console.log('Ejecutando la consulta:', query);
      const response = await client.query(query);
      console.log('Respuesta de la base de datos:', response.rows);
  
      if (response.rowCount > 0) {
        res.send(response.rows);
      } else {
        console.error('Error obteniendo los usuarios:', response);
        res.status(500).send('Error obteniendo los usuarios');
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error al ejecutar la consulta: ' + error.message);
    }
  });

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
