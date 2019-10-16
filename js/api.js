const request = require("request");
const uuid = require("uuid");

// #region constant variable
const reqHeader = {
  "Cache-Control": "no-cache",
  "Content-Type": "application/json"
};
const reqInteractHost =
  "https://52.163.53.35:9444/interact/servlet/RestServlet";
const reqCiscoHost =
  "https://SDRNCCFIND2.TMBTEST.LOCAL:8443/rest_api/v1/json/post/drop_lead/API_REQUEST_DROP_LEAD";
const resSuccess = "SUCCESS";
const resError = "ERROR";
var resDescription = "";

const interactConnStr =
  "DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-04.services.dal.bluemix.net;PORT=50000;PROTOCOL=TCPIP;UID=hgx33165;PWD=ccfdfv8lx4l80f-x;";
// #endregion

// #region setting

// use for except checking SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// #endregion

// #region main module
async function interactGetData(query) {
  let con, result, rows;
  try {
    con = await ibmdb.open(interactConnStr);
    rows = await con.query(query);
    con.close();
    //result = { employees: rows };
    result = rows;
  } catch (err) {
    console.error(err.message);
    result = { message: err.message };
  }
  return result;
}

async function interactGetOffer(paramRefId, paramPageName, paramNoOfOffer = 5) {
  const sessionId = uuid.v4();
  var resStatus, result;

  var options = {
    method: "POST",
    url: reqInteractHost,
    headers: reqHeader,
    body: {
      sessionId: sessionId,
      commands: [
        {
          audienceID: [{ v: 1, t: "numeric", n: "Indiv_ID" }],
          audienceLevel: "Individual",
          ic: "On_test",
          relyOnExistingSession: false,
          action: "startSession",
          debug: false
        },
        { numberRequested: paramNoOfOffer, action: "getOffers", ip: "All" }
      ]
    },
    json: true
  };

  let offer = await doRequest(options);
  //console.log(offer);

  var resOfferList = [];
  // if (!error) {
  var interactOffers = offer.responses[1].offerLists;
  var idmpOffers = [];

  for (var i = 0; i < interactOffers.length; i++) {
    // get offer information from interact
    var offerInfo = interactOffers[i].offers[0];
    //

    // set offer sttribute
    var attributeList = {};
    for (var y = 0; y < offerInfo.attributes.length; y++) {
      var attrInfo = offerInfo.attributes[y];
      attributeList[attrInfo.n] = attrInfo.v;
    }
    //

    // add offer list with designed structure
    var addOffer = {
      treatment_code: offerInfo.treatmentCode,
      campaign_code: "",
      main_banner_path: "",
      main_link: "",
      name: offerInfo.n,
      description: offerInfo.desc,
      score: offerInfo.score,
      page_name: "",
      offer_attributes: attributeList //offerInfo.attributes
    };

    idmpOffers.push(addOffer);
    //
  }

  resOfferList = idmpOffers;
  resStatus = resSuccess;
  // } else {
  //   //throw new Error(error);
  //   resStatus = resError;
  //   console.log(error);
  // }

  // response result
  result = {
    ref_id: paramRefId,
    offers: resOfferList,
    status_code: resStatus
  };
  //
  //console.log(result);
  return result;
}
// #endregion

// #region utility
function doRequest(url) {
  return new Promise(function(resolve, reject) {
    request(url, function(error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}
// #endregion

// #region function
app.get("/", async (req, res) => {
  // var query = "select * from TEST_IDMP";
  // const data = await interactGetData(query);
  // console.log(data);
  // console.log("555");
  //const offer = await interactGetOffer("111");
  //console.log(offer);
  res.send("IDMP API");
});

app.post("/accept_consent", (req, res) => {
  // declare variable
  var paramRefId, paramStatus, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.status) paramStatus = reqBody.status;
  //

  if (paramRefId && paramStatus) {
    //// save consent process
    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    ref_id: paramRefId,
    status_code: resStatus
  };
  //
  res.send(result);
});

app.post("/test", (req, res) => {
  res.send("ABC");
});

app.post("/req_ads", async (req, res) => {
  // declare variable
  // const sessionId = uuid.v4();
  var paramRefId, paramPageName, paramNoOfOffer, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.page_name) paramPageName = reqBody.page_name;
  if (reqBody.no_of_offer) paramNoOfOffer = reqBody.no_of_offer;
  //

  const result = await interactGetOffer(
    paramRefId,
    paramPageName,
    paramNoOfOffer
  );
  console.log(result);

  res.send(result);
  // var options = {
  //   method: "POST",
  //   url: reqInteractHost,
  //   headers: reqHeader,
  //   body: {
  //     sessionId: sessionId,
  //     commands: [
  //       {
  //         audienceID: [{ v: 1, t: "numeric", n: "Indiv_ID" }],
  //         audienceLevel: "Individual",
  //         ic: "On_test",
  //         relyOnExistingSession: false,
  //         action: "startSession",
  //         debug: false
  //       },
  //       { numberRequested: 5, action: "getOffers", ip: "All" }
  //     ]
  //   },
  //   json: true
  // };

  // request(options, function(error, response, offer) {
  //   var resOfferList = [];
  //   if (!error) {
  //     var interactOffers = offer.responses[1].offerLists;
  //     var idmpOffers = [];

  //     for (var i = 0; i < interactOffers.length; i++) {
  //       // get offer information from interact
  //       var offerInfo = interactOffers[i].offers[0];
  //       //

  //       // set offer sttribute
  //       var attributeList = {};
  //       for (var y = 0; y < offerInfo.attributes.length; y++) {
  //         var attrInfo = offerInfo.attributes[y];
  //         attributeList[attrInfo.n] = attrInfo.v;
  //       }
  //       //

  //       // add offer list with designed structure
  //       var addOffer = {
  //         treatment_code: offerInfo.treatmentCode,
  //         campaign_code: "",
  //         main_banner_path: "",
  //         main_link: "",
  //         name: offerInfo.n,
  //         description: offerInfo.desc,
  //         score: offerInfo.score,
  //         offer_attributes: attributeList //offerInfo.attributes
  //       };

  //       idmpOffers.push(addOffer);
  //       //
  //     }

  //     resOfferList = idmpOffers;
  //     resStatus = resSuccess;
  //   } else {
  //     //throw new Error(error);
  //     resStatus = resError;
  //     console.log(error);
  //   }

  //   // response result
  //   var result = {
  //     ref_id: paramRefId,
  //     offers: resOfferList,
  //     status_code: resStatus
  //   };
  //   //

  //   res.status(200).send(result);
  // });

  //res.json({ requestBody: req.body });
});

app.post("/post_ads_event", (req, res) => {
  // declare variable
  var paramRefId, paramTreatmentCode, paramAction, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.treatment_code) paramTreatmentCode = reqBody.treatment_code;
  if (reqBody.action) paramAction = reqBody.action;
  //

  if (paramRefId && paramTreatmentCode && paramAction) {
    //// save post event to interact process
    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    ref_id: paramRefId,
    treatment_code: paramTreatmentCode,
    status_code: resStatus
  };
  //
  res.send(result);
});

app.post("/drop_lead", (req, res) => {
  // declare variable
  var paramRefId,
    paramTreatmentCode,
    paramCustFName,
    paramCustLName,
    paramCustPhone,
    paramCustAvaiableTime,
    resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.treatment_code) paramTreatmentCode = reqBody.treatment_code;
  if (reqBody.cust_firstname) paramCustFName = reqBody.cust_firstname;
  if (reqBody.cust_lastname) paramCustLName = reqBody.cust_lastname;
  if (reqBody.cust_phone) paramCustPhone = reqBody.cust_phone;
  if (reqBody.cust_available_time)
    paramCustAvaiableTime = reqBody.cust_available_time;
  //

  if (
    paramRefId &&
    paramTreatmentCode &&
    paramCustFName &&
    paramCustLName &&
    paramCustPhone
  ) {
    // drop lead to Cisco telephony
    var reqCisco = {
      request_id: "561790",
      first_name: paramCustFName,
      last_name: paramCustLName,
      product_name: "123456",
      mobile: paramCustPhone,
      campaign: "123456",
      droplead_datetime: paramCustAvaiableTime,
      var_1: paramRefId,
      var_2: paramTreatmentCode,
      var_3: "",
      var_4: "",
      var_5: "",
      var_6: "",
      url_field: "",
      channel_name: "Web",
      required_wrap_up: "true"
    };

    var ciscoOptions = {
      method: "POST",
      url: reqCiscoHost,
      headers: reqHeader,
      body: reqCisco,
      json: true
    };

    request(ciscoOptions, function(error, response, ciscoData) {
      //if (error)
      res.status(200).send("555");
    });

    //

    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    ref_id: paramRefId,
    treatment_code: paramTreatmentCode,
    status_code: resStatus
  };
  //
  res.send(result);
});

app.post("/send_response", (req, res) => {
  // declare variable
  var paramRefId, paramTreatmentCode, paramAction, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.treatment_code) paramTreatmentCode = reqBody.treatment_code;
  if (reqBody.action) paramAction = reqBody.action;
  //

  if (paramRefId && paramTreatmentCode && paramAction) {
    //// save consent process
    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    ref_id: paramRefId,
    treatment_code: paramTreatmentCode,
    status_code: resStatus
  };
  //
  res.send(result);
});

app.post("/sync_campaign", (req, res) => {
  // declare variable
  var paramCampaignCode, paramCampaignAttribute, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.campaign_code) paramCampaignCode = reqBody.campaign_code;
  if (reqBody.campaign_attribute)
    paramCampaignAttribute = reqBody.campaign_attribute;
  //

  if (paramCampaignCode && paramCampaignAttribute) {
    //// save consent process
    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    campaign_code: paramCampaignCode,
    status_code: resStatus
  };
  //
  res.send(result);
});

app.post("/followup_sms", (req, res) => {
  // declare variable
  var paramRefId, paramTreatmentCode, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.treatment_code) paramTreatmentCode = reqBody.treatment_code;
  //

  if (paramRefId && paramTreatmentCode) {
    //// save consent process
    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    ref_id: paramRefId,
    treatment_code: paramTreatmentCode,
    status_code: resStatus
  };
  //
  res.send(result);
});

app.post("/followup_email", (req, res) => {
  // declare variable
  var paramRefId, paramTreatmentCode, resStatus;
  //

  // get request parameter
  const reqBody = req.body;
  if (reqBody.ref_id) paramRefId = reqBody.ref_id;
  if (reqBody.treatment_code) paramTreatmentCode = reqBody.treatment_code;
  //

  if (paramRefId && paramTreatmentCode) {
    //// save consent process
    resStatus = resSuccess;
  } else {
    resStatus = resError;
  }

  // response result
  var result = {
    ref_id: paramRefId,
    treatment_code: paramTreatmentCode,
    status_code: resStatus
  };
  //
  res.send(result);
});

//#endregion

app.listen(3000, () => {
  console.log("Start server at port 3000.");
});
