const axios = require('axios');
const crypto = require('crypto');

const logistic_provider_id = "b7edd0488644c8c4e1e99a42850092fd"
const msg_type = "TPS_LOGISTICS_PICKUPORDER_STATUS_UPDATE"
const to_code = "TPS-LAZADA"
const appSecret = "WN834224gkzEd9U2121Y5458887t474F"
const url = "http://link.cainiao.com/gateway/link.do"
const logistics_interface = {'actualArriveTime': '2023-08-15', 'fulfillPickUpOrderCode': 'PUO231110000022001', 'operateTime': '2023-08-15', 'truckInfo': {'carNumber': 'carNo001', 'driverName': 'carDriver001', 'driverPhone': 'carTel001'}, 'actualWeight': 11, 'actualPackageCount': 12, 'pickUpOrderCode': 'PUO231110000022001', 'actualVolume': 13, 'operateStoreCode': 'RMCW-WISE-TEST-01', 'pickUpOrderStatus': 'RECEIVED'}

function doSign(content, charset, appSecret) {
  const toSignContent = content + appSecret;
  const inputBuffer = Buffer.from(toSignContent, charset);
  const hashBuffer = crypto.createHash('md5').update(inputBuffer).digest();
  const base64Encoded = hashBuffer.toString('base64');
  return base64Encoded;
}

exports.lazada_test = async () => {
  try {
    const data_digest = doSign(JSON.stringify(logistics_interface), "utf-8", appSecret)

    const params = new URLSearchParams();
    params.append('logistics_interface', logistics_interface);
    params.append('logistic_provider_id', logistic_provider_id);
    params.append('data_digest', data_digest);
    params.append('msg_type', msg_type);
    params.append('to_code', to_code);

    console.log({
      'logistics_interface': logistics_interface,
      'logistic_provider_id': logistic_provider_id,
      'data_digest': data_digest,
      'msg_type': msg_type,
      'to_code': to_code,
    });

    axios.post(url, params)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });

  } catch (error) {
    console.log(error);
  }
}