const express = require('express');
const cors = require('cors');
const sql = require('mssql'); // Módulo correcto para Azure SQL
const path = require('path');

const app = express();

// Configuración de la conexión a la base de datos
const config = {
    user: 'vcenr',
    password: 'vce.nr1212',
    server: 'proyecz.database.windows.net',
    database: 'proyecto',
    options: {
        encrypt: true, // Azure requiere conexiones encriptadas
        trustServerCertificate: false
    },
};

// Establecer el puerto (puedes cambiarlo según sea necesario)
const PORT = process.env.PORT || 3000; // Usa el puerto del entorno o 3000 por defecto
app.set("port", PORT);

app.use(cors());
app.use(express.json()); // para analizar application/json
app.use(express.urlencoded({ extended: true })); // para analizar application/x-www-form-urlencoded

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Asegúrate de que el archivo index.html está en la misma carpeta
});

// Conectar a la base de datos
sql.connect(config)
    .then(() => {
        console.log('Conexión exitosa a la base de datos de Azure SQL.');
        app.listen(app.get("port"), () => {
            console.log("Server on port", app.get("port"));
        });
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1); // Salir si hay un error en la conexión
    });

// Ejemplo de un endpoint que consulta la base de datos
app.get('/usuarios', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT * FROM dbo.usuarios');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta a la base de datos');
    }
});
app.post('/usuarios', async (req, res) => {
    const { nombre, email } = req.body; // Recibir datos del usuario desde la solicitud POST
    if (!nombre || !email) {
        return res.status(400).send('Faltan datos requeridos: nombre y email');
    }

    try {
        const request = new sql.Request();
        const query = `INSERT INTO dbo.usuarios (nombre, email) VALUES (@nombre, @email)`;
        
        // Parámetros para evitar inyección SQL
        request.input('nombre', sql.NVarChar, nombre);
        request.input('email', sql.NVarChar, email);
        
        await request.query(query);
        res.status(201).send('Usuario agregado exitosamente');
    } catch (error) {
        console.error('Error al agregar el usuario:', error);
        res.status(500).send('Error al agregar el usuario en la base de datos');
    }
});