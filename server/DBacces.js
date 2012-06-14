var ready=false;
 var db = require('mongojs').connect('mydb', ['mycollection']);
 exports.launchDB=function(game){
	db.mycollection.find({name:'main'},function(err, docs) {
	if(!docs.length){
		console.log('boot');
		db.mycollection.save({table:game.entities,name:'main'});
	}else{
		console.log('log');
		console.log(game.entities);
		console.log(docs[0].table);
		game.entities=docs[0].table;
	}
	ready=true;
    // docs is an array of all the documents in mycollection
	});
	
 }
 exports.updateDB=function(game){
	if(ready){
		db.mycollection.update({name:'main'},{$set:{table:game.entities}}, {multi:true}, function(err) {
		// the update is complete
		});
	}
 }