module.exports = (app) => {

  const DEFAULT_COOKIE_MAXAGE  = (1000 * 60 * 60 * 24 * 365 * 10);
  const DEFAULT_COOKIE_EXPIRES = new Date(Number(new Date()) + DEFAULT_COOKIE_MAXAGE);
  const DEFAULT_COOKIE_OPTIONS = {
    expires: DEFAULT_COOKIE_EXPIRES,
    maxAge:  DEFAULT_COOKIE_MAXAGE,
    httpOnly: false };

  const ACCOUNT_SUMMARY             = "ACCOUNT_SUMMARY";     // This wil be shown after login in our understanding
  const TRANSFER_COMPLETE           = "TRANSFER_COMPLETE";
  const BILL_PAYMENT_COMPLETE       = "BILL_PAYMENT_COMPLETE";
  const CHECK_SAVING_ACCOUNT_DETAIL = "CHECK_SAVING_ACCOUNT_DETAIL";
  const CHECK_CARD_ACCOUNT_DETAIL   = "CHECK_CARD_ACCOUNT_DETAIL";

  function setCookie(res, name, value, options) {
    if (options == null) options = DEFAULT_COOKIE_OPTIONS;
    res.cookie(name, value, options);
  }

  app.get('/uuid', (req, res) => {
    let uuid = require('uuid');
    res.send(uuid());
  });

  app.get('/reset', (req, res) => {
    let url = req.originalUrl;
    let target = req.headers.referer;
    let q = url.indexOf('?');
    if (q >= 0) target = url.substr(q + 1);
    for (let c of Object.keys(req.cookies)) res.clearCookie(c);
    res.redirect(target);
  });

  app.get('/consent/start', (req, res) => {
    if (req.cookies.consent == 'accepted') {
      res.redirect('/consent/already');
      return;
    }
    let url = req.originalUrl;
    let startQuery = url.lastIndexOf("?");
    let plusSign = url.lastIndexOf("+");
    let refId = url.substring(startQuery + 1, plusSign);
    let adId = url.substring(plusSign + 1);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <script>
            localStorage.setItem('etbID', '${refId}');
            localStorage.setItem('adID',  '${adId}');
            location.replace('/consent/form');
          </script>
        </body>
      </html>
    `);
  });

  app.post('/consent/accept', (req, res) => {
    setCookie(res, 'consent', 'accepted');
    setCookie(res, 'etbID',   req.body.etbID);
    setCookie(res, 'adID',    req.body.adID);
    res.redirect('/mobile/accepted');
  });

  app.post('/consent/reject', (req, res) => {
    setCookie(res, 'consent', 'rejected');
    res.redirect('/mobile/rejected');
  });

  const LOG_FILE = require('path').join(__dirname, '..', 'public', 'log-file.txt');

  app.get('/mobile/send-id', (req, res) => {
    res.send('hi');
  });

  app.post('/mobile/send-id', (req, res) => {
    let REF_ID = req.body.REF_ID;
    let AD_ID  = req.body.AD_ID;
    let MU_ID  = req.body.MU_ID || "";
    let wca = require('./wca');
    let c = new wca.WcaClient();
    if (MU_ID != null && MU_ID != '') {
      let contacts = [wca.wcaContactByMobileUserId(MU_ID)];
      let img = 'https://picsum.photos/1024/1800.jpg';
      let act = wca.wcaUrlAction('https://www.tmbbank.com');
      c.pushImage(contacts, [ACCOUNT_SUMMARY], 'Title for Account Summary', 'Text for Account Summary', img, 'note', act);
    }
    let timestamp = new Date().toISOString();
    let line = `${timestamp}: [send-id] REF_ID=${REF_ID}, AD_ID=${AD_ID}, MU_ID=${MU_ID}\n`;
    require('fs').appendFile(LOG_FILE, line, function() {});
    res.sendStatus(200);
  });

  app.post('/mobile/login-start', (req, res) => {
    let REF_ID = req.body.REF_ID;
    let AD_ID  = req.body.AD_ID;
    let MU_ID  = req.body.MU_ID || "";
    let wca = require('./wca');
    let c = new wca.WcaClient();
    if (MU_ID != null && MU_ID != '') {
      let contacts = [wca.wcaContactByMobileUserId(MU_ID)];
      let img = 'https://www.earticleblog.com/wp-content/uploads/2016/08/airtel-hanset-special-offers.png';
      let act = wca.wcaUrlAction('https://uat.carpool.co.th/consent/form');
      let rules = [
        ACCOUNT_SUMMARY,
        TRANSFER_COMPLETE,
        BILL_PAYMENT_COMPLETE,
        CHECK_SAVING_ACCOUNT_DETAIL,
        CHECK_CARD_ACCOUNT_DETAIL ];
      c.pushImage(contacts, rules, 'Title for Any page', 'Text for Any page', img, 'note', act);
    }
    let timestamp = new Date().toISOString();
    let line = `${timestamp}: [login-start] REF_ID=${REF_ID}, AD_ID=${AD_ID}, MU_ID=${MU_ID}\n`;
    require('fs').appendFile(LOG_FILE, line, function() {});
    res.sendStatus(200);
  });

  function serveSwaggerPage(app, path, doc) {
    const swaggerUi = require('swagger-ui-express');
    const html = swaggerUi.generateHTML(doc);
    app.use(path, swaggerUi.serveFiles(doc));
    app.get(path, (req, res) => { res.send(html); });
  }

  function serveSwaggerYamlFile(app, path, filename) {
    const yamljs = require('yamljs');
    const doc = yamljs.load(filename);
    serveSwaggerPage(app, path, doc);
  }

  serveSwaggerYamlFile(app, '/docs/poc', require('path').join(__dirname, 'poc.yaml'));

  app.get('/:parent/:child', (req, res) => {
    let parent = req.params.parent;
    let child  = req.params.child;
    let name = `${parent}-${child}`;
    res.render(name, {title: name});
  });

  app.get('/:name', (req, res) => {
    let name = req.params.name;
    res.render(name, {title: name});
  });

};
