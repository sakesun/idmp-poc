function resetCookie() {
  location.replace('/reset');
}

const IDMP_COOKIES = ['consent', 'etbID', 'adID'];

function cookieContent() {
  var lines = [];
  var pairs = document.cookie.split(';');
  if (document.cookie == null || document.cookie == '') {
    lines.push('<div style="color: brown">&lt;No cookie&gt;</div>');
  } else {
    lines.push('<div style="color: brown;">');
    lines.push('<button onclick="resetCookie();">Reset Cookie</button>');
    lines.push('<table cellpadding="3" border="1" style="border: 1px brown; border-collapse: collapse; font-family: monospace">');
    lines.push('<tr><th>Name</th><th>Value</th></tr>');
    for (var i=0; i<pairs.length; i++){
      var pair = pairs[i].split("=");
      var key = (pair[0]+'').trim();
      if (IDMP_COOKIES.indexOf(key) < 0) continue;
      var value = unescape(pair.slice(1).join('='));
      lines.push('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
    }
    lines.push('</table>');
    lines.push('</div>');
  }
  return lines.join('\n');
}

document.write(cookieContent());
