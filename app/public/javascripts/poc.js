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
