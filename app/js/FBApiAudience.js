/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 */

const bizSdk = require("facebook-nodejs-business-sdk");
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const CustomAudience = bizSdk.CustomAudience;
const AdSet = bizSdk.AdSet;
const AdCreative = bizSdk.AdCreative;
const Ad = bizSdk.Ad;
const AdPreview = bizSdk.AdPreview;

let access_token =
  "EAAHtZBJkb64sBAE8uYvbQEQWy5MtD2P9PI3Ao3LdqEhd2uSKIyFN6k3XyQeyv1lgtuf8WOujdS3QL3JunPZBYosqx8YnegIN7Y2AfVw0QV00Nti7irSDZBFEnfDk3ZCBG19Bv1E7hPNweQO7KHZBZBQO6AiwseBq7xKsv4Q4r8znkEdrwFaoC7";
let app_secret = "dff2b902f828a30b399610d1806a5ffd";
let ad_account_id = "act_1689758037821114";
let audience_name = "TEST Custom";
let audience_retention_days = "30";
let pixel_id = "939910843008877000";
let app_id = "543126953126795";

app_secret = 'e87fbf03b5b6dec644497d5353a530b6';
const IDMP_POC_AD_ACCOUNT_ID   = '2134852799952649';
ad_account_id = `act_${IDMP_POC_AD_ACCOUNT_ID}`;
app_id = '508080669826610';
const IDMP_POC_USER_TOKEN       = [
  'EAAHOGLZCXnjIBALoZCSGzYlA777lLUJbLyJX00n7wTxIZBOHlJyCfss0CGu',
  'BiOFI0yX8OkV1jS82lCSbSzHUZAOwPLmBUZCskAl0CQov7ZA2vSZCSLcFHqA',
  'PAuQB8NlZBRzMM6JTZBUT7y1BAe74vbhsgDNm2nQUcgVvAVv7vLSbuOgZDZD'
].join('');
//access_token = IDMP_POC_USER_TOKEN;

// const access_token =
//   "EAAijcZC8eELwBALMm88mZAC4ipgmYXai3mGVhv8h5kbZBeLLsncKH8QVStd5nqIf25AQHp9voL5Ws7UZB4o34ZAiCrHrNqjyac2ZA6UWcu8Jdfo3ZBFU1o58kGEMlmgm8dwxPm7vO1mndMrRQcsjChFzXkKLQZAwpjRqFKIOIRBkAc0j0UmCZB82mLXpRAf9K8S4ZD";
// const app_secret = "728a0e8ca60fba7592a7e4d8514abd60";
// const app_id = "386396045368752";
// const ad_account_id = "act_2156106508046184";

const api = bizSdk.FacebookAdsApi.init(access_token);
const account = new AdAccount(ad_account_id);
const showDebugingInfo = true; // Setting this to true shows more debugging info.
if (showDebugingInfo) {
  api.setDebug(true);
}

let campaign;
// let campaign_id;
// let custom_audience;
// let custom_audience_id;
// let ad_set;
// let ad_set_id;
// let creative;
// let creative_id;
// let ad;
// let ad_id;
// let adpreview;
// let adpreview_id;

const logApiCallResult = (apiCallName, data) => {
  console.log(apiCallName);
  if (showDebugingInfo) {
    console.log("Data:" + JSON.stringify(data));
  }
};
let fields, params;

// Create new blank custom audience
// fields = [];
// params = {
//   name: "My new Custom Audience 101",
//   subtype: "CUSTOM",
//   description: "People who purchased on my website",
//   customer_file_source: "USER_PROVIDED_ONLY"
// };

// campaign = new AdAccount(ad_account_id).createCustomAudience(fields, params);
// campaign
//   .then(result => {
//     logApiCallResult("campaign api call complete.", result);
//     return true;
//   })
//   .catch(error => {
//     console.log(error);
//   });

// // Get Custom Audience Information
// fields = ["name", "rule", "id"];
// params = {};

// campaign = new AdAccount(ad_account_id).getCustomAudiences(fields, params);
// campaign
//   .then(result => {
//     logApiCallResult("campaign api call complete.", result);
//     return true;
//   })
//   .catch(error => {
//     console.log(error);
//   });

// // Add user to specific custom audience group
fields = [];
params = {
  payload: {
    schema: ["MADID", "EMAIL"],
    data: [
      [
        "9b431636bd164765d63c573c346708846af4f68fe3701a77a3bdd7e7e5166254",
        "test1@gmail.com"
      ],
      [
        "8cc62c145cd0c6dc444168eaeb1b61b351f9b1809a579cc9b4c9e9d7213a39ee",
        "test2@gmail.com"
      ],
      [
        "4eaf70b1f7a797962b9d2a533f122c8039012b31e0a52b34a426729319cb792a",
        "test3@gmail.com"
      ],
      [
        "98df8d46f118f8bef552b0ec0a3d729466a912577830212a844b73960777ac56",
        "test4@gmail.com"
      ]
    ]
  }
};
const users = new CustomAudience("23843724262000046").createUser(
  fields,
  params
);
users
  .then(result => {
    logApiCallResult("campaign api call complete.", result);
    return true;
  })
  .catch(error => {
    console.log(error);
  });


///// Not use - For reference /////

// const fields = [];
// const params = {
//   objective: "LINK_CLICKS",
//   status: "PAUSED",
//   buying_type: "AUCTION",
//   name: "My Campaign"
// };
// campaign = new AdAccount(ad_account_id).createCampaign(fields, params);
// campaign
//   .then(result => {
//     logApiCallResult("campaign api call complete.", result);
//     // campaign_id = result.id;
//     // const fields = [];
//     // const params = {
//     //   name: "My new Custom Audience",
//     //   subtype: "CUSTOM",
//     //   description: "People who purchased on my website",
//     //   customer_file_source: "USER_PROVIDED_ONLY"
//     // };
//     return true;
//     //return new AdAccount(ad_account_id).createCustomAudience(fields, params);
//   })
// .then(result => {
//   logApiCallResult("custom_audience api call complete.", result);
//   custom_audience_id = result.id;
//   const fields = [];
//   const params = {
//     status: "PAUSED",
//     targeting: {
//       custom_audiences: [{ id: custom_audience_id }],
//       geo_locations: { countries: ["US"] }
//     },
//     name: "My AdSet",
//     billing_event: "IMPRESSIONS",
//     bid_amount: "20",
//     campaign_id: campaign_id,
//     optimization_goal: "REACH",
//     daily_budget: "1000"
//   };
//   return new AdAccount(ad_account_id).createAdSet(fields, params);
// })
// .then(result => {
//   logApiCallResult("ad_set api call complete.", result);
//   ad_set_id = result.id;
//   const fields = [];
//   const params = {
//     body: "Like My Page",
//     name: "My Creative",
//     title: "My Page Like Ad",
//     object_url: "www.facebook.com",
//     link_url: "www.facebook.com",
//     image_url:
//       "http://www.facebookmarketingdevelopers.com/static/images/resource_1.jpg"
//   };
//   return new AdAccount(ad_account_id).createAdCreative(fields, params);
// })
// .then(result => {
//   logApiCallResult("creative api call complete.", result);
//   creative_id = result.id;
//   const fields = [];
//   const params = {
//     status: "PAUSED",
//     adset_id: ad_set_id,
//     name: "My Ad",
//     creative: { creative_id: creative_id }
//   };
//   return new AdAccount(ad_account_id).createAd(fields, params);
// })
// .then(result => {
//   logApiCallResult("ad api call complete.", result);
//   ad_id = result.id;
//   const fields = [];
//   const params = {
//     ad_format: "DESKTOP_FEED_STANDARD"
//   };
//   return new Ad(ad_id).getPreviews(fields, params);
// })
// .then(result => {
//   logApiCallResult("adpreview api call complete.", result);
//   adpreview_id = result[0].id;
// })
// .catch(error => {
//   console.log(error);
// });
