import express, {   Router } from 'express';
import bodyParser from 'body-parser';
// const cors = require('cors');
const app = express();
const PORT = 9000;

// app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('¡Hola mundo!');
})

app.post('/api/validate-apple-pay-merchant', async (req, res) => {
    try {
        const { validationURL } = req.body;

        if (!validationURL) {
            return res.status(400).json({ error: 'Validation URL is required' });
        }

        console.log('Recibida validationURL:', validationURL);

        // Respuesta simulada
        const mockMerchantSession = {
            "merchantSessionIdentifier": "merchant_session_" + Math.random().toString(36).substring(2),
            "nonce": "nonce_" + Math.random().toString(36).substring(2),
            "merchantIdentifier": "merchant.com.deuna.payments", // Asegúrate que coincida con tu merchant ID
            "domainName": "localhost",
            "displayName": "DEUNA Payments",
            "initiative": "web",
            "initiativeContext": "https://localhost:5173", // URL exacta de tu sitio
            "epoch": Date.now() / 1000 | 0, // Timestamp en segundos (entero)
        };

        console.log('Enviando respuesta simulada:', mockMerchantSession);
        res.json(mockMerchantSession);

    } catch (error) {
        console.error('Error en la validación del merchant:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server Express ejecutándose en http://localhost:${PORT}`);
});