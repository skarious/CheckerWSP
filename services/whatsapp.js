const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

let qrCodeImage = null;
let isClientReady = false;
let sessionInfo = null;
let client = null;
let retryCount = 0;
const MAX_RETRIES = 3;

async function cleanSession() {
    try {
        // Asegurarse de que el cliente esté completamente destruido
        if (client) {
            try {
                await client.destroy();
                client = null;
            } catch (error) {
                console.log('Error al destruir el cliente:', error);
            }
        }

        // Esperar a que se liberen los recursos
        await new Promise(resolve => setTimeout(resolve, 2000));

        const authFolder = path.join(process.cwd(), '.wwebjs_auth');
        const cacheFolder = path.join(process.cwd(), '.wwebjs_cache');

        // Intentar eliminar los archivos de sesión
        try {
            if (fs.existsSync(authFolder)) {
                const files = await fsPromises.readdir(authFolder);
                for (const file of files) {
                    const filePath = path.join(authFolder, file);
                    try {
                        await fsPromises.rm(filePath, { recursive: true, force: true });
                    } catch (e) {
                        console.log(`No se pudo eliminar ${filePath}:`, e);
                    }
                }
            }
            if (fs.existsSync(cacheFolder)) {
                await fsPromises.rm(cacheFolder, { recursive: true, force: true });
            }
            console.log('Sesión anterior limpiada correctamente');
        } catch (error) {
            console.log('Error al eliminar archivos de sesión:', error);
            // Si no podemos limpiar, intentamos renombrar
            try {
                const timestamp = Date.now();
                if (fs.existsSync(authFolder)) {
                    await fsPromises.rename(authFolder, `${authFolder}_old_${timestamp}`);
                }
                if (fs.existsSync(cacheFolder)) {
                    await fsPromises.rename(cacheFolder, `${cacheFolder}_old_${timestamp}`);
                }
                console.log('Archivos de sesión renombrados');
            } catch (renameError) {
                console.log('Error al renombrar archivos:', renameError);
            }
        }

        // Resetear variables de estado
        qrCodeImage = null;
        isClientReady = false;
        sessionInfo = null;
        retryCount = 0;
    } catch (error) {
        console.log('Error durante la limpieza de sesión:', error);
    }
}

async function initializeClient() {
    const puppeteerOptions = {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: null
    };

    client = new Client({
        authStrategy: new LocalAuth({
            clientId: 'whatsapp-checker',
            dataPath: '.wwebjs_auth'
        }),
        puppeteer: puppeteerOptions,
        qrMaxRetries: 3,
        restartOnAuthFail: true
    });

    client.on('qr', (qr) => {
        console.log('QR generado. Escanea este código QR para iniciar sesión.');
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Error al generar el QR:', err);
            } else {
                qrCodeImage = url;
                sessionInfo = null;
            }
        });
    });

    client.on('ready', async () => {
        console.log('Cliente de WhatsApp listo.');
        isClientReady = true;
        qrCodeImage = null;
        retryCount = 0;
        
        try {
            const info = await client.info;
            sessionInfo = {
                name: info.pushname,
                number: info.wid.user,
                platform: info.platform
            };
            console.log('Información de sesión:', sessionInfo);
        } catch (error) {
            console.error('Error al obtener información de la sesión:', error);
        }
    });

    client.on('authenticated', () => {
        console.log('Cliente autenticado.');
        retryCount = 0;
    });

    client.on('auth_failure', async () => {
        console.log('Fallo de autenticación, limpiando sesión...');
        await cleanSession();
        await initializeClient();
    });

    client.on('disconnected', async () => {
        console.log('Cliente desconectado, limpiando sesión...');
        isClientReady = false;
        sessionInfo = null;
        qrCodeImage = null;
        
        try {
            await cleanSession();
            console.log('Reiniciando cliente...');
            await initializeClient();
        } catch (error) {
            console.error('Error durante la reconexión:', error);
        }
    });

    try {
        await client.initialize();
    } catch (error) {
        console.error('Error al inicializar el cliente:', error);
        // Si hay error al inicializar, limpiar y reintentar una vez
        await cleanSession();
        if (retryCount < 1) {
            retryCount++;
            console.log('Reintentando inicialización...');
            await initializeClient();
        }
    }
}

// Verificar y limpiar sesión anterior al inicio
cleanSession().then(() => {
    console.log('Iniciando cliente nuevo...');
    initializeClient().catch(console.error);
}).catch(console.error);

module.exports = {
    getQrCode: () => qrCodeImage,
    isClientReady: () => isClientReady,
    getSessionInfo: () => sessionInfo,
    verifyNumber: async (number) => {
        if (!client || !isClientReady) {
            throw new Error('Cliente no inicializado o no está listo');
        }
        try {
            const formattedNumber = `${number}@c.us`;
            return await client.isRegisteredUser(formattedNumber);
        } catch (error) {
            console.error('Error al verificar número:', error);
            throw error;
        }
    }
};
