const request = require('request');

const reqWCAHost      = "https://api7.ibmmarketingcloud.com/XMLAPI";
const reqWCAAuthHost  = "https://api7.ibmmarketingcloud.com/oauth/token";
const wcaClientId     = '894b6479-a151-42a2-a20e-a5b2c289b3ea';
const wcaClientSecret = '223b0729-f310-47d5-bf23-bf661f59363c';
const wcaRefreshToken = 'rUI5NJ-8tWArMkvS6o38KwBvgWc1LKpFoJ3VdeJVZLGMS1';

const DeliveryName    = 'delivery.pocLogin';
const Apps            = 'TMB POC Android';
const CampaignName    = 'campaign.pocLogin';
const ChannelId       = '5Xw78bG7';
const ContentId       = '83e1888c-ac07-4d79-a550-2b82d0694df7';


// {     "expirationDate": "2100-01-01T00:00:00.000+00:00",
//       "maxViews": 4,
//       "inAppContentId": "83e1888c-ac07-4d79-a550-2b82d0694df7"
// }

// #Region utility
function doRequest(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}
// #endregion

// WCA
async function wcaGenToken() {
    let result;
    try {
        var wcaOptions = {
            method: 'POST',
            url: reqWCAAuthHost,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            form: {
                'grant_type': 'refresh_token',
                'client_id': wcaClientId,
                'client_secret': wcaClientSecret,
                'refresh_token': wcaRefreshToken
            }
        };
      var genTokenResult = await doRequest(wcaOptions);
      result = {
          isSuccess: true,
            data: JSON.parse(genTokenResult),
            errorMessage: null
        };
    } catch (err) {
        console.error(err.message);
        result = {
            isSuccess: false,
            data: null,
            errorMessage: err.message
        };
    }
    return result;
}

async function wcaPushMessage() {
  let payload =  { InAppMessage: {

expirationDate (Date): InApp message expiration date represented in a String as per RFC 3339 ('1970-01-01T00:00:00.000+00:00'),
maxViews (Integer): Maximum number of views on the InApp message,
inAppContentId (InAppContentId): InApp message content id
}


}

async function wcaSendMail(paramMailingId, paramReceiver, paramList = []) {
    let result;

    var tokenResult = await wcaGenToken();
    let tokenString = tokenResult.data.access_token;

    try {
        var wcaOptions = {
            method: 'POST',
            url: reqWCAHost,
            headers: {
              'Content-Type': 'text/xml',
              'Authorization': `Bearer ${tokenString}`
            },
            body: `<Envelope>\n    <Body>\n        <SendMailing>\n            <MailingId>${paramMailingId}</MailingId>\n            <RecipientEmail>${paramReceiver}</RecipientEmail>\n        </SendMailing>\n    </Body>\n</Envelope>`

          };
        var sendMailResult = await doRequest(wcaOptions);
        var resultJson = await convertXMLToJson(sendMailResult);
        var reqResult = resultJson.Envelope.Body[0].RESULT[0].SUCCESS[0];

        if (reqResult == true){
            result = {
                isSuccess: true,
                data: resultJson,
                errorMessage: null
            };
        } else {
            result = {
                isSuccess: false,
                data: resultJson,
                errorMessage: resultJson.Envelope.Body[0].Fault[0].FaultString[0]
            };
        }

    } catch (err) {
        console.error(err.message);
        result = {
            isSuccess: false,
            data: null,
            errorMessage: err.message
        };
    }
    return result;
}
//

wcaGenToken().then(r => console.log(r));
