
module.exports = (app) => {

  function setCookie(res, name, value, options) {
    if (options == null) options = DEFAULT_COOKIE_OPTIONS;
    res.cookie(name, value, options);
  }

  let fs = require('fs');

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

  const DEFAULT_COOKIE_OPTIONS = { maxAge: 900000, httpOnly: false };

  app.post('/consent/accept', (req, res) => {
    setCookie(res, 'consent', 'accepted');
    res.cookie('etbID', req.body.etbID, { maxAge: 900000, httpOnly: false });
    res.cookie('adID',  req.body.adID,  { maxAge: 900000, httpOnly: false });
    res.redirect('/mobile/accepted');
  });

  app.post('/consent/reject', (req, res) => {
    res.cookie('consent', 'accepted',   { maxAge: 900000, httpOnly: true });
      res.redirect('/mobile/rejected');
  });

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
