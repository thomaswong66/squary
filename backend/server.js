const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const squareConnect = require('square-connect');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
dotenv.config();
const app = express();
const port = 4000;
var cors = require('cors');
app.use(cors())
// Set the Access Token
const accessToken = process.env.ACCESS_TOKEN

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// Set Square Connect credentials and environment
const defaultClient = squareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = accessToken;

// Set 'basePath' to switch between sandbox env and production env
// sandbox: https://connect.squareupsandbox.com
// production: https://connect.squareup.com
defaultClient.basePath = 'https://connect.squareupsandbox.com';

var temporaryCart = new Map();

app.post('/process-payment', async (req, res) => {
  const request_params = req.body;

  // length of idempotency_key should be less than 45
  const idempotency_key = uuidv4();
  console.log(idempotency_key);
  // Charge the customer's card
  const payments_api = new squareConnect.PaymentsApi();
  const request_body = {
    source_id: request_params.nonce,
    amount_money: {
      amount: 100,
      currency: 'CAD'
    },
    idempotency_key: idempotency_key
  };

  try {
    const response = await payments_api.createPayment(request_body);
    res.status(200).json({
      'title': 'Payment Successful',
      'result': response
    });
  } catch(error) {
    res.status(500).json({
      'title': 'Payment Failure',
      'result': error.response.text
    });
  }
});

app.get('/list-catalog', async(req, res) => {
  var apiInstance = new squareConnect.CatalogApi();
  try{
    const response = await apiInstance.listCatalog();
    res.status(200).json({
      'title': 'Order',
      'result': response
    });
  } catch(error) {
    res.status(500).json({
      'title': 'Payment Failure',
      'result': error.response.text
    });
  }
});

app.post('/create-checkout', async(req, res) => {
  var apiInstance = new squareConnect.CheckoutApi();
  var locationId = "GH6BA9AEDGTMW";
  var body = {
      redirect_url: `http://localhost:3000/order-summary/${req.body.cartID}`,
      //redirect_url: 'https://facebook.com/',
      idempotency_key: uuidv4(),
      
      order: {
        idempotency_key: uuidv4(),
        order: req.body.order
      },
      merchant_support_email: "support@squary.com"
  }
  try {
    const response = await apiInstance.createCheckout(locationId, body);
    res.status(200).json({
      'title': 'Checkout Created',
      'result': response
    })
  } catch (error) {
    res.status(500).json({
      'title': 'Checkout Creation Failed',
      'result': error.response.text
    })
  }
})

app.post('/create-an-order', async(req, res) => {
  var apiInstance = new squareConnect.OrdersApi();
  var locationId = "GH6BA9AEDGTMW";
  var key = uuidv4();
  console.log(key);
  var body = {
    order: {
      location_id: locationId
    },
    idempotency_key: uuidv4()
  }
  
  try {
      const response = await apiInstance.createOrder(locationId, body);
      res.status(200).json({
        'title': 'Order Created',
        'result': response
      });
  } catch (error) {
      res.status(500).json({
      'title': 'Order Creation Failure',
      'result': error.response.text
    });
  }
});

app.post('/add-item-to-cart', async(req, res) => {
  var item = req.body.item;
  var count = Number(0);
  var inCartItem = temporaryCart.get(item.id);

  try {
    if(inCartItem != null)
      count = Number(inCartItem.count);

    count = Number(count + 1);

    temporaryCart.set(item.id, {
      'detail': item,
      'count': count
    });

    res.status(200).json({
      'title': 'Add Item to Card',
      'result': item,
      'cart': JSON.stringify(Array.from(temporaryCart.entries())),
    });
  } catch (error) {
      res.status(500).json({
      'title': 'Add Item to Card Failed',
      'result': item,
      'cart': JSON.stringify(Array.from(temporaryCart.entries())),
    });
  }
});

app.post('/update-item-in-cart', async(req, res) => {
  var id = req.body.itemID;
  var count = Number(req.body.count);

  var inCartItem = temporaryCart.get(id);
  inCartItem.count = Number(count);

  if(count != 0)
    temporaryCart.set(id,inCartItem);
  else
    temporaryCart.delete(id);

  res.status(200).json({
    'title': 'Add Item to Card',
    'result': id,
    'cart': JSON.stringify(Array.from(temporaryCart.entries())),
  });
});

app.get('/get-cart', async(req, res) => {

  res.status(200).json({
    'title': 'Add Item to Card',
    'cart': JSON.stringify(Array.from(temporaryCart.entries())),
  });
});

app.post('/create-customer', async(req, res) => {
  const customers_api = new squareConnect.CustomersApi();
  // length of idempotency_key should be less than 45
  const idempotency_key = uuidv4();
  
  var customer_email = req.body.email_address;
  var customer_phone_number = req.body.phone_number;

  const request_body = {
    email_address: customer_email,
    phone_number: customer_phone_number,
    idempotency_key: idempotency_key
  }

  console.log(request_body);
  try {
    const response = await customers_api.createCustomer(request_body);
    res.status(200).json({
      'title': 'Customer Creation Successful',
      'result': response
    });
  } catch(error) {
    res.status(500).json({
      'title': 'Customer Creation Failure',
      'result': error.response.text
    });
  }
})

app.listen(
  port,
  () => console.log(`listening on - http://localhost:${port}`)
);