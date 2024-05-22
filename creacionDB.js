const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
async function creacionTabla() {
  const query = `
    DROP TABLE IF EXISTS usuarios_qr;
    DROP TABLE IF EXISTS habilitado;
    DROP TABLE IF EXISTS tipo_usuario;

    CREATE TABLE habilitado (
      id SERIAL PRIMARY KEY,
      estado BOOLEAN NOT NULL
    );

    CREATE TABLE tipo_usuario (
      id SERIAL PRIMARY KEY,
      tipo varchar(15) NOT NULL
    );

    CREATE TABLE usuarios_qr (
      usuario_id SERIAL PRIMARY KEY,
      usuario_name varchar(15) NOT NULL,
      usuario_password varchar(15) NOT NULL,
      habilitado_id INT REFERENCES habilitado(id),
      tipo_usuario_id INT REFERENCES tipo_usuario(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    INSERT INTO habilitado (id, estado) VALUES (0, false), (1, true);
    INSERT INTO tipo_usuario (id, tipo) VALUES (1, 'ADMIN'), (2, 'Comun');
  `;

  try {
    await client.connect();
    const res = await client.query(query);
    console.log('Tablas creadas exitosamente');
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
  } finally {
    await client.end();
  }
}

creacionTabla();
