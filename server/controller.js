var inspect = require('util').inspect
		,	fs = require('fs')

//--- HOME/DASHBOARD --------------------------------------------------------------------------------------------------------------

var home = function(pathInfo, res) {
		fs.createReadStream('./server/map.html', {
			flags: 'r',
			mode: 0666
		}).on('error',function(err){
			console.log('Error loading html')
		}).pipe(res)
}

//--- OTHER --------------------------------------------------------------------------------------------------------------

var staticFile = function(pathInfo, res) {
	var path = pathInfo.path
		,	cacheReset = 600

	fs.stat(app.ROOT + path, function(err, stats){

			fs.createReadStream(app.ROOT + path,{
				flags: 'r',
				mode: 0666}
			).on('error', function(err){
				console.log('Error loading static content: ' + path)
			}).pipe(res)
	})

}

//--- EXPORTS --------------------------------------------------------------------------------------------------------------



var control = {}
control['static'] = staticFile
control['/'] = home
control['/home'] = home

exports.control = control