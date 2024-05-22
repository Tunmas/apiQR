const express = require('express');
const { Client } = require('pg'); // Requiere el módulo pg
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT1;
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
app.post('/crearusuario', async (req, res) => {
  const { usuario, contrasena } = req.body;

  const query = `
    INSERT INTO usuarios_qr (usuario_name, usuario_password, habilitado_id, tipo_usuario_id)
    VALUES ('${usuario}', '${contrasena}', 1, 2)
  `;

  try {
    console.log('Ejecutando la consulta:', query);
    const response = await client.query(query);
    console.log('Respuesta de la base de datos:', response.rows);

    if (response.rowCount > 0) {
      res.send('Usuario creado exitosamente');
    } else {
      console.error('Error creando el usuario:', response);
      res.status(500).send('Error creando el usuario');
    }
  }  catch (error) {
  console.error('Error al ejecutar la consulta:', error);
  res.status(500).send('Error al ejecutar la consulta: ' + error.message);
}
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
