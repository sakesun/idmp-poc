function lotameInsertScript(src, onload) {
  let script = document.createElement('script');
  script.onload = onload;
  script.src = src;
  document.body.appendChild(script);
  console.log('Script tag inserted');
}

var lotameExtractProfile_done = false;
var lotameExtractProfile_onLoadProfile = null;
function lotameExtractProfile_callback(profile) {
  var onLoadProfile = lotameExtractProfile_onLoadProfile;
  lotameExtractProfile_done = true;
  lotameExtractProfile_onLoadProfile = null;
  if (onLoadProfile == null) return;
  onLoadProfile(profile);
}
function lotameExtractProfile(onLoadProfile) {
  if (lotameExtractProfile_done) return;
  lotameExtractProfile_onLoadProfile = onLoadProfile;
  let src = 'https://ad.crwdcntrl.net/5/c=221/pe=y/callback=lotameExtractProfile_callback';
  lotameInsertScript(src);
}

var lotameBcpTag_done = false;
function lotameBcpTag(onLoadBcp) {
  if (lotameBcpTag_done) return;
  lotameInsertScript('https://tags.crwdcntrl.net/c/14487/cc.js?ns=_cc14487', function() {
    lotameBcpTag_done = true;
    onLoadBcp(window._cc14487);
  });
}

function showLotameProfile(profile) {
  if (profile.pid == "") {
    lotameExtractProfile_done = false;
    lotameBcpTag(function(bcp) {
      bcp.bcp();
      window.setTimeout(extractAndShowLotameProfile, 2000);
    });
    return;
  }
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
  lotameExtractProfile(showLotameProfile);
}

function activateIfGotConsent() {
  if (document.cookie == null || document.cookie == '') return;
  extractAndShowLotameProfile();
}

activateIfGotConsent();
