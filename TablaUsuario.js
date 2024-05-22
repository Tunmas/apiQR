// En el lado del servidor (Node.js)

const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const port = process.env.PORT6;
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

app.get('/usuarios_qr', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM usuarios_qr');
        const usuarios = result.rows;
        res.json(usuarios);   
    } catch (err) {
        console.error('Error al obtener los usuarios', err);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
