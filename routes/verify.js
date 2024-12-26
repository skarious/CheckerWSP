const express = require('express');
const { isClientReady, verifyNumber } = require('../services/whatsapp');

const router = express.Router();

router.get('/:number', async (req, res) => {
    try {
        if (!isClientReady()) {
            return res.status(503).json({
                success: false,
                message: 'El servicio de WhatsApp no está listo. Por favor, escanea el código QR primero.',
                status: 'not_ready'
            });
        }

        const number = req.params.number;
        
        // Validar el formato del número
        if (!/^\d+$/.test(number)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de número inválido. Use solo números, sin espacios ni caracteres especiales.',
                status: 'invalid_format'
            });
        }

        const isRegistered = await verifyNumber(number);
        
        res.json({
            success: true,
            message: isRegistered ? 'El número tiene WhatsApp.' : 'El número no tiene WhatsApp.',
            status: isRegistered ? 'registered' : 'not_registered',
            number: number
        });
    } catch (error) {
        console.error('Error al verificar el número:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al verificar el número. Por favor, inténtalo de nuevo.',
            status: 'error'
        });
    }
});

module.exports = router;
