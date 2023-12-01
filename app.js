const bby = require('bestbuy')('EyQcLwSjZwmJ9D3qIsGViKiQ');
const cron = require('node-cron');
const Twilio = require('twilio');

require('dotenv').config();

// Twilio
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE;
const myPhone = process.env.MYPHONE;


const client = new Twilio(accountSid, authToken);

// PS Portal SKU
const sku = '6562576';

// PS5 SKU
// const sku = '6523167';

let isApiCallInProgress = false;

function checkStock() {
  if (isApiCallInProgress) {
    console.log("Skipped API call, previous call still in progress");
    return;
  }

  isApiCallInProgress = true;

  // Set time to show to console
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  bby.products(`sku=${sku}`, { show: 'onlineAvailability,url' })
    .then(function (data) {
      if (data.products.length > 0) {
        if (data.products[0].onlineAvailability) {
          console.log(true);
          sendTextAlert(data.products[0].url);
          process.exit();
        }
      } else {
        console.log("false", formattedTime);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      isApiCallInProgress = false;
    });
}

// Function to send text message from Twilio
function sendTextAlert(message) {
  client.messages.create({
    body: message,
    from: twilioPhoneNumber,
    to: myPhone
  })
  .then(message => {
    console.log('Text alert sent:', message.sid);
  })
  .catch(error => console.error('Error sending text alert:', error.message));
}

// Cron to run function every 25 seconds
cron.schedule('*/10 * * * * *', checkStock);





