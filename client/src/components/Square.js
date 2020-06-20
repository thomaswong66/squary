import React from 'react';
import config from '../utils/PaymentForm';

const Square = ({ paymentForm }) => {

    paymentForm = new paymentForm(config);
    paymentForm.build();
    const requestCardNonce = () =>{
        paymentForm.requestCardNonce();
    }
 
    return (
        <div id="form-container">
            <div id="sq-card-number"></div>
            <div className="third" id="sq-expiration-date"></div>
            <div className="third" id="sq-cvv"></div>
            <div className="third" id="sq-postal-code"></div>
            <button id="sq-creditcard" className="button-credit-card" onClick={requestCardNonce}> Pay CAD 1.00</button>
        </div>
      
    )
}

export default Square;