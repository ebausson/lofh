var DB=require('../DBacces.js');
file=require(process.argv[2])
for(type in file){
	for(name in file[type]){
		result={
			'type':type
			,'name':name
			,'data':file[type][name]
		}
		DB.collection('ressources').save(result,function(err,data){console.log(data)});
	}
}