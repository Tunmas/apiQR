const express = require('express');
const { Client } = require('pg'); // Requiere el módulo pg
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const port = process.env.PORT2;
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


  app.post('/iniciarsesion', async (req, res) => {
    const { usuario, contrasena } = req.body;
  
    console.log('Recibiendo solicitud de inicio de sesión para el usuario:', usuario);
  
    const query = `
      SELECT * FROM usuarios_qr 
      INNER JOIN habilitado ON usuarios_qr.habilitado_id = habilitado.id
      WHERE usuario_name = '${usuario}' AND habilitado.estado = true
    `;
  
    try {
      console.log('Ejecutando la consulta:', query);
      const response = await client.query(query);
  
      console.log('Respuesta de la base de datos:', response);
  
      if (response.rows.length > 0) {
        const user = response.rows[0];
  
        if (user.usuario_password === contrasena) {
            // Las credenciales son correctas, generar un token JWT
            const token = jwt.sign({ id: user.id }, 'clave_secreta', { expiresIn: '1h' });
          
            console.log('Las credenciales son correctas, enviando token:', token);
          
            // Enviar el token y el tipo de usuario en la respuesta
            res.json({ token, userType: user.tipo_usuario_id });
          } else {
          // La contraseña es incorrecta
          console.log('La contraseña es incorrecta');
          res.status(401).send('Contraseña incorrecta');
        }
      } else {
        // El usuario no existe o está deshabilitado
        console.log('El usuario no existe o está deshabilitado');
        res.status(404).send('Usuario no encontrado o está deshabilitado');
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error al ejecutar la consulta: ' + error.message);
    }
  });  


app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
  