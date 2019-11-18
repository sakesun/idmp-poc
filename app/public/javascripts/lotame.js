var MILLISECONDS_AFTER_BCP = 200;

function lotameLog(log) { console.log(log); }

function lotameInsertScript(id, src, onload) {
  var script = document.createElement('script');
  script.onload = function() {
    lotameLog('Script loaded');
    if (onload != null) onload();
  };
  script.src = src;
  if (id != null) { script.setAttribute('id', id); }
  document.body.appendChild(script);
  lotameLog('Script tag inserted');
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
  lotameLog('Lotame profile jsonpCallback: ' + JSON.stringify(data));
  if (this.onProfile != null) {
    if (data == null) this.onProfile(null);
    this.onProfile(data.Profile);
  }
  if (this.script != null) this.script.remove();
};

LotameProfileLoader.prototype.load = function() {
  if (this.script != null) return;
  this.script = lotameInsertScript(null, this.src);
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
  var id = 'LOTCC_' + account;
  var name = '_cc' + account;
  var src = 'https://tags.crwdcntrl.net/c/' + account + '/cc.js?ns=' + name;
  lotameInsertScript(id, src, function() {
    var bcp = window[name];
    onBcp(bcp);
  });
}

function showLotameProfile(profile) {
  var FirstPartyAudience = profile.Audiences.Audience || [];
  var ThirdPartyAudience = profile.Audiences.ThirdPartyAudience || [];
  var AllAudiences = FirstPartyAudience.concat(ThirdPartyAudience);
  var place = document.getElementById('lotame');
  if (AllAudiences.length == 0) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('<NONE>'));
    place.appendChild(div);
  } else {
    var ul = document.createElement('ul');
    function getAudText(aud) { return aud.name || aud.abbr; }
    var audiences = AllAudiences.map(getAudText).sort();
    for (var aud of audiences) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(aud));
      ul.appendChild(li);
    }
    place.appendChild(ul);
  }
}

function extractAndShowLotameProfile() {
  lotameLoadProfile('14488', showLotameProfile);
}

function activateIfGotConsent() {
  if (document.cookie == null || document.cookie == '') return;
  extractAndShowLotameProfile();
}

activateIfGotConsent();
