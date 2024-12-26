const express = require('express');
const qrRoutes = require('./routes/qr');
const verifyRoutes = require('./routes/verify');

const app = express();
const port = 3001;

// Montar rutas
app.use('/qr', qrRoutes);
app.use('/verify', verifyRoutes);

// Iniciar el servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor API ejecutándose en http://0.0.0.0:${port}`);
    console.log(`Escanea el QR en http://<tu-ip>:${port}/qr`);
});
