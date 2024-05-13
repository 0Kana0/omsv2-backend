const axios = require('axios');
const crypto = require('crypto');

const logistic_provider_id = "b7edd0488644c8c4e1e99a42850092fd"
const msg_type = "TPS_LOGISTICS_PICKUPORDER_CREATION"
const to_code = "TPS-LAZADA"
const appSecret = "WN834224gkzEd9U2121Y5458887t474F"
const url = "http://link.cainiao.com/gateway/link.do"
const logistics_interface = {"pickUpOrderCode":"PUO231109000021001","bizOrderCodeList":["IOCN001","IOCN002"],"senderInfo":{"country":"China","province":"Beijing","city":"Beijing","county":"Haidian","street":"Xueyuan Road","address":"1234","name":"John","phone":"12345678911"},"expectPickUpTime":"2024-04-09T00:00:00","timeZone":"Asia/Shanghai","weight":10,"volume":2,"packageCount":3,"receiverInfo":{"country":"China","province":"Shanghai","city":"Shanghai","county":"Pudong","street":"Century Avenue","address":"5678","name":"Jane","phone":"98765432111"},"toWarehouseCode":"STB","uniqueCode":"PUO231109000021001-CREATE","attributes":{}}

const doSign = (content, charset, appSecret) => {
  const toSignContent = content + appSecret;
  const hash = crypto.createHash('md5').update(toSignContent, charset).digest();
  return hash.toString('base64');
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
    params.append('[receive.charset]', encodeURIComponent('utf-8'));

    const headers = {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    };
    console.log(params.data_digest);

    axios.post(url, params, {headers})
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