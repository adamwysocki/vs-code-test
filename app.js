var geoip = require('geoip-lite');
var countrynames = require('countrynames');

var addrs = ["24.56.254.31",
			"139.194.193.125",
			"208.54.37.234",
			"2.25.6.244",
			"50.38.54.176",
			"73.25.30.62",
			"82.110.64.14",
			"24.173.36.194",
			"101.170.42.141",
			"74.177.96.226"];
			
String.prototype.toTitleCase = function() {
  var i, j, str, lowers, uppers;
  str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless 
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
      function(txt) {
        return txt.toLowerCase();
      });

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), 
      uppers[i].toUpperCase());

  return str;
}


for(var x = 0; x < addrs.length; x++) {
	var geo = geoip.lookup(addrs[x]);
	
	if(geo.country == "US") {
		if(!geo.city) {
			//console.log('GEO:', JSON.stringify(geo, null, 2));	
			console.log('United States');
		} else {
			console.log(geo.city.toTitleCase(),",",geo.region.toTitleCase());
		}
	} else {
		console.log(geo.city.toTitleCase(),",",countrynames.getName(geo.country).toTitleCase());
	}
}
