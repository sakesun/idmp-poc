const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const CustomAudience = bizSdk.CustomAudience;
const AdSet = bizSdk.AdSet;
const AdCreative = bizSdk.AdCreative;
const Ad = bizSdk.Ad;
const AdPreview = bizSdk.AdPreview;

function getOngConfig() {
  let access_token = [
    "EAAHtZBJkb64sBAE8uYvbQEQWy5MtD2P9PI3Ao3LdqEhd2uSKIyFN6k3XyQey",
    "v1lgtuf8WOujdS3QL3JunPZBYosqx8YnegIN7Y2AfVw0QV00Nti7irSDZBFEn",
    "fDk3ZCBG19Bv1E7hPNweQO7KHZBZBQO6AiwseBq7xKsv4Q4r8znkEdrwFaoC7"
  ].join('');
  let app_secret = "dff2b902f828a30b399610d1806a5ffd";
  let ad_account_id = "act_1689758037821114";
  let audience_name = "TEST Custom";
  let audience_retention_days = "30";
  let pixel_id = "939910843008877000";
  let app_id = "543126953126795";
  return { access_token, app_secret, ad_account_id, audience_name,
           audience_retention_days, pixel_id, app_id };
}

// https://developers.facebook.com/apps
const IDMP_POC_APP_DISPLAY_NAME = 'TMB IDMP POC';
const IDMP_POC_APP_ID           = '508080669826610';
// https://developers.facebook.com/apps --> Settings --> Basic --> App Secret
const IDMP_POC_APP_SECRET       = 'e87fbf03b5b6dec644497d5353a530b6';
// https://developers.facebook.com/tools/accesstoken
const IDMP_POC_APP_TOKEN        = '508080669826610|lcQHnH72Fo8icK_3bwyzpAOzga0';
const IDMP_POC_USER_TOKEN       = [
  'EAAHOGLZCXnjIBALoZCSGzYlA777lLUJbLyJX00n7wTxIZBOHlJyCfss0CGu',
  'BiOFI0yX8OkV1jS82lCSbSzHUZAOwPLmBUZCskAl0CQov7ZA2vSZCSLcFHqA',
  'PAuQB8NlZBRzMM6JTZBUT7y1BAe74vbhsgDNm2nQUcgVvAVv7vLSbuOgZDZD'
].join('');

// https://developers.facebook.com/apps/508080669826610/marketing-api/tools/?business_id=2424566244288351
// Marketing API --> Tools
const IDMP_POC_MARKETING_API_TOKEN = [
  'EAAHOGLZCXnjIBAFtqXkPaoMhaZClH1CIIXxLXmJuGYhVzJzHX1BHJ0qGM0',
  'cMny0Rw12Kr2IHPYxCNnRigsmCGG32zVAzd38AeD4gOhOTqDVb23aOM54TV',
  'G6wivSxzfZBfKVQIZA6Vwc7y6gNyTwiOlp7TEC4h8SbItVoqWZBZCGwZDZD'
].join('');
const IDMP_POC_AD_ACCOUNT_NAME = 'BM Ad';
const IDMP_POC_AD_ACCOUNT_ID   = '2134852799952649';
// const IDMP_POC_AD_ACCOUNT_ID   = '244533212';

const api = bizSdk.FacebookAdsApi.init(IDMP_POC_MARKETING_API_TOKEN);
const account = new AdAccount(`act_${IDMP_POC_AD_ACCOUNT_ID}`);
const showDebugingInfo = true; // Setting this to true shows more debugging info.
if (showDebugingInfo) {
  api.setDebug(true);
}

const logApiCallResult = (apiCallName, data) => {
  console.log(apiCallName);
  if (showDebugingInfo) {
    console.log("Data:" + JSON.stringify(data));
  }
};

async function addSampleAudience(audienceId) {
  const fields = [];
  const params = {
    payload: {
      schema: ["MADID"],
      data: [
        ["9b431636bd164765d63c573c346708846af4f68fe3701a77a3bdd7e7e5166254"],
        ["8cc62c145cd0c6dc444168eaeb1b61b351f9b1809a579cc9b4c9e9d7213a39ee"],
        ["4eaf70b1f7a797962b9d2a533f122c8039012b31e0a52b34a426729319cb792a"],
        ["98df8d46f118f8bef552b0ec0a3d729466a912577830212a844b73960777ac56"]
      ]
    }
  };
  const aud = new CustomAudience(audienceId);
  try {
    let r = await aud.createUser(fields, params);
    logApiCallResult("campaign api call complete.", r);
  } catch (e) {
    console.log(e);
  }
}

async function createAudience(name) {
  let audience = account.createCustomAudience([], {
    name: name,
    subtype: "CUSTOM",
    description: "My test audience",
    customer_file_source: "USER_PROVIDED_ONLY"
  });
}

//addSampleAudience().then(r => console.log(r));

(async function() {
  try {
    //console.log(await account.getCampaigns());
    // let aud = createAudience("Test Aud");
    // logApiCallResult('create audience', aud);
    const AUDIENCE_ID = '23843800757870550';
    addSampleAudience(AUDIENCE_ID);
  } catch (e) {
    console.log(e);
  }
})();
