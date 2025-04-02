import   { useState, useEffect } from 'react';
//more info: https://applepaydemo.apple.com/apple-pay-js-api#requirements

const ApplePayButton = ({ amount = '10.00', merchantIdentifier = 'merchant.test.io.deuna.pay' }) => {
    const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    useEffect(() => {
        // Verificar si Apple Pay está disponible
        if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
            setIsApplePayAvailable(true);
        }
    }, []);

    const handleApplePayButtonClick = () => {
        try {
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
            };

            // Crear sesión de Apple Pay
            const session = new ApplePaySession(6, paymentRequest);

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

            // Evento: pago autorizado
            session.onpaymentauthorized = (event) => {
                console.log('Pago autorizado:', event);

                // Capturar los datos completos del pago
                const paymentData = {
                    token: event.payment.token,
                    billingContact: event.payment.billingContact,
                    shippingContact: event.payment.shippingContact
                };

                // Guardar para mostrar en UI
                setPaymentResult(paymentData);

                // IMPORTANTE: Estos son los datos que necesita el backend
                console.log('--- DATOS PARA BACKEND ---');
                console.log('Payment Data (criptograma):', event.payment.token.paymentData);
                console.log('Payment Method:', event.payment.token.paymentMethod);
                console.log('Transaction ID:', event.payment.token.transactionIdentifier);

                // Completar el pago como exitoso para el PoC
                session.completePayment(ApplePaySession.STATUS_SUCCESS);
            };

            // Evento: cancelación
            session.oncancel = (event) => {
                console.log('Apple Pay sesión cancelada', event);
            };

            // Iniciar la sesión
            session.begin();

        } catch (error) {
            console.error('Error al iniciar Apple Pay:', error);
        }
    };

    if (!isApplePayAvailable) {
        return <div>Apple Pay no está disponible en este dispositivo/navegador</div>;
    }

    return (
        <div className="apple-pay-container">


                <apple-pay-button buttonstyle="black" type="pay" locale="es-MXN"
                                  onclick={handleApplePayButtonClick}
                                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer'
                }}

                ></apple-pay-button>


            {paymentResult && (
                <div className="payment-result">
                    <h3>Datos capturados (para backend):</h3>
                    <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ApplePayButton;