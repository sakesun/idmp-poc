const request = require('request');

const reqWCAHost      = "https://api7.ibmmarketingcloud.com/XMLAPI";
const reqWCAAuthHost  = "https://api7.ibmmarketingcloud.com/oauth/token";
const wcaClientId     = '894b6479-a151-42a2-a20e-a5b2c289b3ea';
const wcaClientSecret = '223b0729-f310-47d5-bf23-bf661f59363c';
const wcaRefreshToken = 'rUI5NJ-8tWArMkvS6o38KwBvgWc1LKpFoJ3VdeJVZLGMS1';

const sakeUserId      = 'OFzJQSRbaA8WnY76';
const testContentId   = '83e1888c-ac07-4d79-a550-2b82d0694df7';
const testCampaignName = 'campaign.pocLogin';

const TEMPLATE_DEFAULT       = 'default';
const TEMPLATE_TOP_BANNER    = TEMPLATE_DEFAULT; // 'Top Banner Template';
const TEMPLATE_BOTTOM_BANNER = TEMPLATE_DEFAULT; // 'Bottom Banner Template';
const TEMPLATE_IMAGE         = 'image'; //'Image Template';
const TEMPLATE_VIDEO         = 'video'; //Video Template';

const DURATION_DEFAULT = 60 * 60 * 24;

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode.toString().length == 3 &&  res.statusCode.toString().startsWith('2')) {
        resolve(body);
      } else {
        reject(res);
      }
    });
  });
}

function wcaAction(type, value) { return { type, value }; }
function wcaUrlAction(url) { return wcaAction('url', url); }

function wcaDefaultContent(mainImage, title, text, color, icon, action, duration) {
  duration = duration || DURATION_DEFAULT;
  return {mainImage, title, text, color, icon, action};
}

function wcaImageContent(title, text, image, icon, action, duration) {
  duration = duration || DURATION_DEFAULT;
  return {title, text, image, icon, action, duration};
}

function wcaVideoContent(title, text, video,  action) {
  return {title, text, video, action};
}

function wcaDefaultPayload(rules, maxViews, content) {
  let detail = {
    rules,
    template: TEMPLATE_DEFAULT,
    maxViews,
    content };
  return { "gcm": detail, "apns": detail };
}

function wcaTopBannerPayload(rules, maxViews, content) {
  let detail = {
    duration: 300,
    rules,
    template: TEMPLATE_TOP_BANNER,
    maxViews,
    content };
  return { "gcm": detail, "apns": detail };
}

function wcaBottomBannerPayload(rules, maxViews, content) {
  let detail = {
    duration: 300,
    rules,
    template: TEMPLATE_BOTTOM_BANNER,
    maxViews,
    content };
  return { "gcm": detail, "apns": detail };
}

function wcaImagePayload(rules, maxViews, content) {
  let detail = {
    rules,
    template: TEMPLATE_IMAGE,
    maxViews,
    content };
  return { "gcm": detail, "apns": detail };
}

function wcaVideoPayload(rules, maxViews, content) {
  let detail = {
    rules,
    template: TEMPLATE_VIDEO,
    maxViews,
    content };
  return { "gcm": detail, "apns": detail };
}

function wcaContactByMobileUserId(muId) {
  return {lookupKeyFields: [{name: 'Mobile User Id', value: muId}]};
}

async function wcaPostInAppContentPayload(token, payload) {
  const endpoint = 'https://api7.silverpop.com/rest/channels/push/inappcontent';
  let options = {
    method: 'POST',
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({payload})
  };
  return await doRequest(options);
}

async function wcaPushInApp(token, appKeys, expirationDate, maxViews, inAppContentId, contacts) {
  const endpoint = 'https://api7.silverpop.com/rest/channels/push/sends';
  let payload = {
    campaignName: 'C' + Math.random().toString(),
    // channelQualifiers: appKeys,
    appKeys: appKeys,
    content: { inAppMessage: { expirationDate, maxViews, inAppContentId } },
    contacts };
  let options = {
    method: 'POST',
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  };
  return await doRequest(options);
}

// WCA
async function wcaGenToken(auth, client, secret, refresh) {
  auth = auth || reqWCAAuthHost;
  client = client || wcaClientId;
  secret = secret || wcaClientSecret;
  refresh = refresh || wcaRefreshToken;
  let result;
  try {
    var wcaOptions = {
      method: 'POST',
      url: auth,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: {
        'grant_type': 'refresh_token',
        'client_id': client,
        'client_secret': secret,
        'refresh_token': refresh
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
      body: `
        <Envelope>
          <Body>
            <SendMailing>
              <MailingId>${paramMailingId}</MailingId>
              <RecipientEmail>${paramReceiver}</RecipientEmail>
            </SendMailing>
          </Body>
        </Envelope>`
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

const CONFIG_TMB = {
  HOST: reqWCAHost,
  AUTH: reqWCAAuthHost,
  CLIENT: wcaClientId,
  SECRET: wcaClientSecret,
  REFRESH: wcaRefreshToken,
  APP_KEYS: ['apGxZWReXb', 'gcqqPL7cYI', 'gc8m81N7AU', 'apnctBDxQR', 'gc8NgHDn0s']
};

function WcaClient(config) {
  this.config = config || CONFIG_TMB;
  this.token = null;
}

WcaClient.prototype.prepareToken = async function() {
  if (this.token != null) return;
  console.info('Preparing token');
  this.token = (await wcaGenToken(this.config.AUTH, this.config.CLIENT_ID, this.SECRET, this.REFRESH)).data;
  console.info('  token: ' + JSON.stringify(this.token));
};

WcaClient.prototype.tokenPrepared = async function(run) {
  await this.prepareToken();
  console.info('  using token: ' + JSON.stringify(this.token));
  try {
    return await run();
  } catch (e) {
    console.error(e);
    console.error(JSON.stringify(e));
    this.token = null;
    try {
      await this.prepareToekn();
      return await run();
    } catch (e) {
      console.error(e);
      console.error(JSON.stringify(e));
      this.token = null;
      throw e;
    }
  }
};

WcaClient.prototype.postContentDefault = async function(rules, orientation, mainImage, title, text, color, icon, action) {
  return this.tokenPrepared(async () => {
    let content = wcaDefaultContent(mainImage, title, text, color, icon, action, DURATION_DEFAULT);
    content.orientation = orientation;
    let payload = wcaDefaultPayload(rules, 1,content);
    return await wcaPostInAppContentPayload(this.token.access_token, payload);
  });
};

WcaClient.prototype.postContentImage = async function(rules, title, text, image, icon, action) {
  return this.tokenPrepared(async () => {
    let content = wcaImageContent(title, text, image, icon, action);
    let payload = wcaImagePayload(rules, 1, content);
    return await wcaPostInAppContentPayload(this.token.access_token, payload);
  });
};

WcaClient.prototype.postContentVideo = async function(rules, title, text, video, action) {
  return this.tokenPrepared(async () => {
    let content = wcaVideoContent(title, text, video, action);
    let payload = wcaVideoPayload(rules, 1, content);
    return await wcaPostInAppContentPayload(this.token.access_token, payload);
  });
};

WcaClient.prototype.pushDefault = async function(contacts, rules, orientation, mainImage, title, text, color, icon, action) {
  return this.tokenPrepared(async () => {
    let content = await this.postContentDefault(rules, orientation, mainImage, title, text, color, icon, action);
    let contentId = JSON.parse(content).data.id;
    let expiration = new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString();
    return await wcaPushInApp(this.token.access_token, this.config.APP_KEYS, expiration, 1, contentId, contacts);
  });
};

WcaClient.prototype.pushTop = async function(contacts, rules, mainImage, title, text, color, icon, action) {
  return await this.pushDefault(contacts, rules, 'top', mainImage, title, text, color, icon, action);
};

WcaClient.prototype.pushBottom = async function(contacts, rules, mainImage, title, text, color, icon, action) {
  return await this.pushDefault(contacts, rules, 'bottom', mainImage, title, text, color, icon, action);
};

WcaClient.prototype.pushImage = async function(contacts, rules, title, text, image, icon, action) {
  return this.tokenPrepared(async () => {
    let content = await this.postContentImage(rules, title, text, image, icon, action);
    let contentId = JSON.parse(content).data.id;
    let expiration = new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString();
    return await wcaPushInApp(this.token.access_token, this.config.APP_KEYS, expiration, 1, contentId, contacts);
  });
};

WcaClient.prototype.pushVideo = async function(contacts, rules, title, text, video, action) {
  return this.tokenPrepared(async () => {
    let content = await this.postContentVideo(rules, title, text, video, action);
    let contentId = JSON.parse(content).data.id;
    let expiration = new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString();
    return await wcaPushInApp(this.token.access_token, this.config.APP_KEYS, expiration, 1, contentId, contacts);
  });
};

async function test() {
  try {
    let c = new WcaClient();
    let contacts = [wcaContactByMobileUserId(sakeUserId)];
    // let img = 'https://via.placeholder.com/150/0000FF/808080';
    let img = 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/181c6f8177149.560b89435d434.png';
    let mp4 = 'https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_1mb.mp4';
    let act = wcaUrlAction('https://www.tmbbank.com/home');
    // await c.pushTop(contacts, ['all'], img, 'test', 'text','#909090', 'note', act);
    // await c.pushBottom(contacts, ['all'], img, 'test', 'text','#909090', 'note', act);
    // await c.pushImage(contacts, ['all'], 'the title', 'the text', img, 'note', act);
    await c.pushVideo(contacts, ['all'], 'the title', 'the text', mp4, act);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  wcaAction, wcaUrlAction,
  wcaContactByMobileUserId,
  CONFIG_TMB,
  WcaClient
};

// test();
