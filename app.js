const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
    user: 'vcenr',
    password: 'vce.nr1212',
    server: 'proyecz.database.windows.net',
    database: 'proyecto',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Conectar a la base de datos y usar la conexión para realizar consultas
sql.connect(config).then(pool => {
    console.log('Conectado a la base de datos');

    // Endpoint para obtener los usuarios
    app.get('/usuarios', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT id, nombre, correo FROM usuarios');
            res.json(result.recordset); // Devuelve los usuarios como JSON
        } catch (err) {
            console.error('Error al obtener los usuarios:', err);
            res.status(500).send({ error: 'Error al obtener los usuarios' });
        }
    });

    // Iniciar el servidor después de conectar a la base de datos
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
});
