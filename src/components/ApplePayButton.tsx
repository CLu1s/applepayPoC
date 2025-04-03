import   { useState, useEffect } from 'react';
//more info: https://applepaydemo.apple.com/apple-pay-js-api#requirements

const ApplePayButton = ({ amount = '1.00',  }) => {
    const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
    const [paymentResult, setPaymentResult] = useState<Record<string, string>|null>(null);
    // @ts-expect-error any
    const ApplePaySession = (window as any).ApplePaySession as typeof globalThis.ApplePaySession;
    useEffect(() => {
        const merchantIdentifier = 'merchant.test.io.deuna.pay'
        // Verificar si Apple Pay está disponible
        if (typeof window !== 'undefined' && 'ApplePaySession' in window) {
            const AppleSession = (window as any).ApplePaySession;
            if (AppleSession.canMakePayments()) {
                setIsApplePayAvailable(true);
            }
            // @ts-expect-error any
            AppleSession.canMakePaymentsWithActiveCard(merchantIdentifier).then(function(canMakePayments) {
                console.log("Can make payments:", canMakePayments);
            });
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
            // @ts-expect-error any
            session.onvalidatemerchant = async (event) => {
                console.log('Validation URL:', event.validationURL);
                //https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778021-onvalidatemerchant
                try {
                    // Llamar al endpoint local
                    // const response = await fetch('https://decisive-silken-television.glitch.me/api/validate-apple-pay-merchant', {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({ validationURL: event.validationURL })
                    // });
                    //
                    // if (!response.ok) {
                    //     throw new Error(`Error validando: ${response.status}`);
                    // }
                    //
                    // const merchantSession = await response.json();
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
                    // console.log('Merchant session recibida:', merchantSession);
                    // Completar la validación
                    session.completeMerchantValidation(mockMerchantSession);
                } catch (error) {
                    console.error('Error validando merchant:', error);
                    session.abort();
                }
            };

            // Evento: pago autorizado
            session.onpaymentauthorized = (event:any) => {
                console.log('Pago autorizado:', event);
                const result = {
                    "status": ApplePaySession.STATUS_SUCCESS
                };
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
                session.completePayment(result);
            };

            // Evento: cancelación
            session.oncancel = (event:Record<string, string>) => {
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


            <button
                onClick={handleApplePayButtonClick}
                className="apple-pay-button"
                style={{
                    backgroundColor: 'black',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Pagar con Apple Pay
            </button>


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