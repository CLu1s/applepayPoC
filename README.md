# Apple Pay PoC

Proyecto de prueba para implementar Apple Pay.

## Requisitos
- Node.js ^20

## Instalación
```bash
  npm install
```

## Ejecución
```bash
  npm run dev
```

## Notas
Para recibir notificaciones de pago, se debe configurar un endpoint en el servidor que maneje las notificaciones de Apple Pay. Este endpoint debe ser capaz de recibir y procesar los datos del pago.
remplazar `https://example.com/notify` por la URL del servidor.
```js
   // Configurar el request para Apple Pay
            const paymentRequest = {
                countryCode: 'MX',
                currencyCode: 'MXN',
                supportedNetworks: ['visa', 'masterCard', 'amex'],
                merchantCapabilities: ['supports3DS'],
                total: {
                    label: 'DEUNA Payment',
                    amount: amount
                },
                tokenNotificationURL: "https://example.com/notify", // URL de nuestro server para recibir notificaciones de pago
            };
```

