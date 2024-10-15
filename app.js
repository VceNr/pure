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

// Conectar a la base de datos
let pool;

sql.connect(config).then(p => {
    pool = p; // Almacenar el pool de conexión
    console.log('Conectado a la base de datos');
    
    // Definir la ruta '/usuarios'
    app.get('/usuarios', (req, res) => {
        pool.request().query('SELECT id, nombre, correo FROM usuarios', (err, result) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({ error: 'Database query failed' });
                return;
            }
            res.json(result.recordset);  // Enviar los resultados de la consulta
        });
    });

    // Iniciar el servidor
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
});
