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
                countryCode: 'US',
                currencyCode: 'USD',
                supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
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
                    const response = await fetch('/wallet/credentials/c1e0fe58-4f03-4a65-ac97-5be93b263a4e/payment-session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Merchant-id': '896e48e5-d8d9-4bb6-857b-85ed5455e15f',
                            'X-Store-Code': 'all'
                        },
                        body: JSON.stringify({ validation_url: event.validationURL, domain: "main.d15age3ucwnxjs.amplifyapp.com" })
                    });

                    if (!response.ok) {
                        throw new Error(`Error validando: ${response.status}`);
                    }

                    const merchantSession = await response.json();
                    session.completeMerchantValidation(merchantSession);
                } catch (error) {
                    console.error('Error validando merchant:', error);
                    session.abort();
                }
            };

            // Evento: pago autorizado
            session.onpaymentauthorized = async (event:any) => {
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
                try {
                    // Llamar al endpoint local
                    let createCardPayload = {
                        credential_source: "apple_pay",
                        apple_pay: event.payment
                    }
                    const responsePayment = await fetch('/users/a35851b1-b60b-419c-98c9-ef54e5625ae7/cards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IlZOUDlOVGM2SWdxVDhhYVRqYlFnOTRPa2wzZHgtLWZfQjdNdXdTNmYzdmMiLCJ0eXAiOiJKV1QifQ.eyJhY3QiOiJyZWFkIiwiYXVkIjpbIjg5NmU0OGU1LWQ4ZDktNGJiNi04NTdiLTg1ZWQ1NDU1ZTE1ZiJdLCJleHAiOjE3NzYwMjA4ODAsImV4dGVybmFsIjp0cnVlLCJpYXQiOjE3NzU3NjE2ODAsImlzcyI6Ijg5NmU0OGU1LWQ4ZDktNGJiNi04NTdiLTg1ZWQ1NDU1ZTE1ZiIsIm5ldHdvcmtfaWQiOiI2ZmU5NWI5My0wMDg3LTQxMzctYmI3Ni03ZjM5OWYwNjgxMmYiLCJzdWIiOiJhMzU4NTFiMS1iNjBiLTQxOWMtOThjOS1lZjU0ZTU2MjVhZTciLCJ1c2VyX3JvbGUiOiJleHRlcm5hbCJ9.YK0SlvFpzJBO5ih4ekK8gGWEcBwi54G3yVVtsbhoOWEx36w-c1TvK0v0Ocs-kYMk3Co2-MbiBfyH76-HfDoaDMqy6V8RJXCyRExDkjytwD4Oowk8wjM1dVbqmI3DkaEKHPVdkrIvHXBTBIS9_ogFrEEqP_UURY0OrWRNEFVFu5SHjWv7YxPYd9nvUe1CuvHZIeQ4v6wa6241J2MNgjgFZ7pdUk5K8m7a4-2hlgosrZES5I8ZhHb7aU1tCxLgTriAk8MdtM_b6VAziyZ8DSaXgqFsCjlJVIBoOejVrYx3XlUpmGzdydIi4hrBWeVWuohxW4PaS2RTLz3qOuFL4oJpXG2aB_acHwF9QQ1nCtlMwxBzLe9yV1qSM3ek8HNylXRz4DOt9R7kY0DU_CTp75XhNBKliA-56bFiHRPZaeup2hWcPEF8oMkjvmyzoK9culIVBNTjdj2qASMHt4hIJ3t1s7jjrz54IWrBuNu9y1RTv75P_CNhnLFMRkjGaEsk2z21DokVVegULpkGHP1o_AnAGPk373LaMYpNrgFuj6JVtWUmwAYcl5FsA_atc8uA9i5TBDm_p_Ww1CjTzes8d_RmG9xCjWAd_fEU1ZOUdkPyKae4yoAOWlzewBlKowFKRHKtjRwEDWmkXkcMNRFjk8j9OKDmws8MBnb7hdBzXCfg4pg' },
                        body: JSON.stringify(createCardPayload)
                    });

                    if (!responsePayment.ok) {
                        throw new Error(`Error validando: ${responsePayment.status}`);
                    }

                    const paymentResult = await responsePayment.json();

                    console.log("decrypted_data:", paymentResult);
                    // Completar el pago como exitoso para el PoC
                    session.completePayment(result);
                } catch (error) {
                    console.error('Error validando merchant:', error);
                    session.abort();
                }

                
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