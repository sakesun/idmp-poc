var MILLISECONDS_AFTER_BCP = 200;
var MAX_LOAD_PROFILE_COUNT = 20;

function idmpLog(log) { console.log(log); }

function idmpInsertScript(id, src, onload) {
  var script = document.createElement('script');
  script.onload = function() {
    idmpLog('Script loaded');
    if (onload != null) onload();
  };
  script.src = src;
  if (id != null) { script.setAttribute('id', id); }
  document.body.appendChild(script);
  idmpLog('Script tag inserted');
  return script;
}

function LotameProfileLoader(account, onProfile) {
  var i = this.constructor.instances || 0;
  this.instanceId = i;
  this.constructor.instances = i + 1;
  var n = this.constructor.name + 'OnProfile' + i;
  var self = this;
  window[n] = function (data) { self.jsonpCallback(data); };
  this.src = 'https://ad.crwdcntrl.net/5/c=' + account + '/pe=y/callback=' + n;
  this.onProfile = onProfile;
}

LotameProfileLoader.prototype.jsonpCallback = function(data) {
  idmpLog('Lotame profile jsonpCallback: ' + JSON.stringify(data));
  if (this.onProfile != null) {
    if (data == null) this.onProfile(null);
    this.onProfile(data.Profile);
  }
  if (this.script != null) this.script.remove();
};

LotameProfileLoader.prototype.load = function() {
  if (this.script != null) return;
  this.script = idmpInsertScript(null, this.src);
};

function tryLoadProfile(account, onProfile) {
  var loader = new LotameProfileLoader(account, onProfile);
  loader.load();
  return loader;
}

function lotameLoadProfile(account, onProfile, counter) {
  counter = counter || 0;
  if (counter >= MAX_LOAD_PROFILE_COUNT) return;
  tryLoadProfile(account, function(p) {
    if (p.pid != "") {
      onProfile(p);
    } else {
      lotameBcp(account, function(bcp) {
        bcp.bcp();
        window.setTimeout(function() {
          lotameLoadProfile(account, onProfile, counter + 1);
        }, MILLISECONDS_AFTER_BCP);
      });
    }
  });
}

function lotameBcp(account, onBcp) {
  var id = 'LOTCC_' + account;
  var name = '_cc' + account;
  var src = 'https://tags.crwdcntrl.net/c/' + account + '/cc.js?ns=' + name;
  idmpInsertScript(id, src, function() {
    var bcp = window[name];
    onBcp(bcp);
  });
}
