function lotameLog(log) { console.log(log); }

function lotameInsertScript(src, onload) {
  let script = document.createElement('script');
  script.onload = function() {
    lotameLog('Script loaded');
    onload();
  };
  script.src = src;
  document.body.appendChild(script);
  lotameLog('Script tag inserted');
  return script;
}

function LotameProfileLoader(account, onProfile) {
  var i = this.constructor.instances || 0;
  this.instanceId = i;
  this.constructor.instances = i + 1;
  var n = this.constructor.name + 'Callback' + i;
  window[n] = function (p) { this.onProfile(p); };
  if (account == null || account == '') account = 221;
  this.src = 'https://ad.crwdcntrl.net/5/c=' + account + '/pe=y/callback=' + n;
  this.onProfile = onProfile;
}

LotameProfileLoader.prototype.callback = function(p) {
  lotameLog('Lotame profile callback: ' + JSON.stringify(p));
  if (this.onProfile != null) this.onProfile(p);
  if (this.script     != null) this.script.remove();
};

LotameProfileLoader.prototype.load = function() {
  if (this.script != null) return;
  this.script = lotameInsertScript(this.src, function(p) { this.callback(p); });
};

function tryLoadProfile(account, onProfile) {
  var loader = new LotameProfileLoader(account, onProfile);
  loader.load();
}

function lotameLoadProfile(account, onProfile) {
  tryLoadProfile(account, function(p) {
    if (p.pid != "") {
      onProfile(p);
    } else {
      var MILLISECONDS_AFTER_BCP = 1000;
      lotameBcp(account, function(bcp) {
        bcp.bcp();
        window.setTimeout(function() {
          lotameLoadProfile(account, onProfile);
        }, MILLISECONDS_AFTER_BCP);
      });
    }
  });
}

function lotameBcp(account, onBcp) {
  var name = '_cc' + account;
  var src = 'https://tags.crwdcntrl.net/c/' + account + '/cc.js?ns=' + name;
  lotameInsertScript(src, function() {
    var bcp = window[name];
    onBcp(bcp);
  });
}

function showLotameProfile(profile) {
  let FirstPartyAudience = profile.Profile.Audiences.Audience || [];
  let ThirdPartyAudience = profile.Profile.Audiences.ThirdPartyAudience || [];
  let AllAudiences = FirstPartyAudience.concat(ThirdPartyAudience);
  let place = document.getElementById('lotame');
  if (AllAudiences.length == 0) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode('<NONE>'));
    place.appendChild(div);
  } else {
    let ul = document.createElement('ul');
    let audiences = ThirdPartyAudience.map(aud => aud.name).sort();
    for (let aud of audiences) {
      let li = document.createElement('li');
      li.appendChild(document.createTextNode(aud));
      ul.appendChild(li);
    }
    place.appendChild(ul);
  }
}

function extractAndShowLotameProfile() {
  lotameLoadProfile('221', showLotameProfile);
}

function activateIfGotConsent() {
  if (document.cookie == null || document.cookie == '') return;
  extractAndShowLotameProfile();
}

activateIfGotConsent();
