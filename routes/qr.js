const express = require('express');
const { getQrCode, isClientReady, getSessionInfo } = require('../services/whatsapp');

const router = express.Router();

router.get('/', (req, res) => {
    const qr = getQrCode();
    const ready = isClientReady();
    const session = getSessionInfo();

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp QR</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #f0f2f5;
                }
                .container {
                    text-align: center;
                    padding: 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .qr-container {
                    margin: 20px 0;
                }
                .status {
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                }
                .status.connected {
                    background-color: #e7f3eb;
                    color: #1e4620;
                }
                .status.waiting {
                    background-color: #fff3cd;
                    color: #856404;
                }
                .user-info {
                    margin: 15px 0;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${ready && session ? `
                    <div class="status connected">
                        <h2>¡Conectado a WhatsApp!</h2>
                        <div class="user-info">
                            <p><strong>Nombre:</strong> ${session.name}</p>
                            <p><strong>Número:</strong> ${session.number}</p>
                            <p><strong>Plataforma:</strong> ${session.platform}</p>
                        </div>
                    </div>
                ` : qr ? `
                    <div class="status waiting">
                        <h2>Escanea el código QR con WhatsApp</h2>
                        <div class="qr-container">
                            <img src="${qr}" alt="QR Code" />
                        </div>
                        <p>La página se actualizará automáticamente...</p>
                    </div>
                ` : `
                    <div class="status waiting">
                        <h2>Generando código QR...</h2>
                        <p>Por favor espera...</p>
                    </div>
                `}
            </div>
            <script>
                function checkStatus() {
                    fetch('/qr/status')
                        .then(response => response.json())
                        .then(data => {
                            if (data.shouldRefresh) {
                                window.location.reload();
                            }
                        })
                        .catch(console.error);
                }

                // Si no está conectado, verificar el estado cada 5 segundos
                ${!ready ? 'setInterval(checkStatus, 5000);' : ''}
            </script>
        </body>
        </html>
    `);
});

router.get('/status', (req, res) => {
    const ready = isClientReady();
    const qr = getQrCode();
    const session = getSessionInfo();
    
    // Indicar si la página debe refrescarse
    const shouldRefresh = !ready || (!session && qr);
    
    res.json({
        ready,
        hasQr: !!qr,
        hasSession: !!session,
        shouldRefresh
    });
});

module.exports = router;
