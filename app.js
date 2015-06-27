var geoip 			= require('geoip-lite'),
	countrynames 	= require('countrynames'),
	mongo			= require('mongodb'),
	config			= require('config.json')('./settings.json');

var _dbServer 		= new mongo.Server(config.mongodb.host, config.mongodb.port),
	_db 			= new mongo.Db(config.mongodb.db, _dbServer);

			
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

function updateQuestion(collection, question) {
	
	var geo = geoip.lookup(question.ipaddr);
						
	var _location = "";
	
	if(!geo) {
		return;
	}
	
	if(geo.country == "US") {
		if(!geo.city) {
			_location = "United States";
		} else {
			_location = geo.city.toTitleCase() + ", " + geo.region;
		}
	} else {
		if(geo.city) {
			_location = geo.city.toTitleCase() + ", " + countrynames.getName(geo.country).toTitleCase();
		} else {
			_location = countrynames.getName(geo.country).toTitleCase();
		}
	}
					
	console.log(_location);
	
	
    var query 	= {_id:question._id};
    var update 	= {$set: {loc:_location, locationString:_location}};
	
    collection.update(query, update, {safe:true}, function(err, result) {
        if(err) {
			console.log('error updating question.');
		} else {
			console.log('question updated');
		}
    });

	
};

function listQuestions(db) {

	db.collection('questions', function(err, questions) {
		
		if(!err) {
			console.log('listing questions ... ');
			
			var cursor = questions.find({type:'question'}).sort({created:-1}).limit(4);
			
			cursor.each(function(err, question) {
				
				if(question) {
					
					if(!question.loc || !question.locationString) {
						console.log('no question');
						return;
					}
				
					if(question.mobileType === 'ios') {
						console.log('*** mobile question location:', question.locationString);
						return;
					} else {
						console.log('question location:', question.locationString, question.ipaddr);
					}	
					
					updateQuestion(questions, question);


				} else {
					process.exit(0);
				}
			});
			
		}
		
	});
	
};


_db.open(function(err, db) {
	
	if(!err) {
		console.log('Database opened');
		listQuestions(db);
	}
});

/*
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
}*/
