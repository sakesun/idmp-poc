module.exports = (app) => {

  const DEFAULT_COOKIE_MAXAGE  = (1000 * 60 * 60 * 24 * 365 * 10);
  const DEFAULT_COOKIE_EXPIRES = new Date(Number(new Date()) + DEFAULT_COOKIE_MAXAGE);
  const DEFAULT_COOKIE_OPTIONS = {
    expires: DEFAULT_COOKIE_EXPIRES,
    maxAge:  DEFAULT_COOKIE_MAXAGE,
    httpOnly: false };

  function setCookie(res, name, value, options) {
    if (options == null) options = DEFAULT_COOKIE_OPTIONS;
    console.log(options);
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
    let timestamp = new Date().toISOString();
    let line = `${timestamp}: [send-id] REF_ID=${REF_ID}, AD_ID=${AD_ID}\n`;
    console.log(line);
    require('fs').appendFile(LOG_FILE, line, function() {});
    res.sendStatus(200);
  });

  app.post('/mobile/login-start', (req, res) => {
    let REF_ID = req.body.REF_ID;
    let AD_ID  = req.body.AD_ID;
    let timestamp = new Date().toISOString();
    let line = `${timestamp}: [login-start] REF_ID=${REF_ID}, AD_ID=${AD_ID}\n`;
    console.log(line);
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
