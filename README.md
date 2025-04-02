# Apple Pay PoC

Proyecto de prueba para implementar Apple Pay.

## Requisitos
- Node.js ^20
- Safari 11 en MacOS 10.13 o superior
- Tener una tarjeta de pago en el Wallet de Apple Pay

## Instalación
```bash
  npm install
```

## Ejecución
```bash
  npm run dev
```

 
## Notas:
Esta es la parte del código que se encarga de la validación del merchant.

Más información en:
- [documentación oficial](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778021-onvalidatemerchant).
- [ejemplo de Apple](https://applepaydemo.apple.com/apple-pay-js-api#requirements).

```js
 // Evento: validación del merchant
            session.onvalidatemerchant = (event) => {
                console.log('Validation URL:', event.validationURL);
                //https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778021-onvalidatemerchant
                // NOTA: Esto NO funcionará en producción, solo para simular el flujo
                setTimeout(() => {
                    try {
                        session.completeMerchantValidation({});
                    } catch (e) {
                        console.error('Error en merchant validation:', e);
                    }
                }, 1000);
            };
```