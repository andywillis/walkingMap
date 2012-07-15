var _ = require('underscore')._

var route = function(url, req, res) {
//	req.addListener('end', function(){
		var pathInfo = returnPathInfo(url)
		// Static file control
		if (pathInfo.file) app.control['static'](pathInfo, res)
		else if (typeof app.control[pathInfo.rest.control] === 'function') {
			// If the control is for the post form
			if (pathInfo.rest.page === 'addPost') app.control[pathInfo.rest.control](pathInfo, req, res)
			// otherwise
			else {
				app.control[pathInfo.rest.control](pathInfo, res)
			}
		}
		// If all fails, generate a 404.
		else app.control['error'](pathInfo, res)
//	})
}

var returnPathInfo = function(reqUrl) {
	var querystring = require('querystring')
		,	url = require('url')
		,	path = url.parse(reqUrl).pathname
		,	query = url.parse(reqUrl).query || ''
		,	pathArray = _.compact(path.split('/'))
		,	pathInfo = {}
		,	lastElement = pathArray[pathArray.length-1] || []
			
	pathInfo.path = path
	if (lastElement.indexOf('.') !== -1) {
		pathInfo.file = {}
		pathInfo.file.name = lastElement.split('.')[0]
		pathInfo.file.ext = _.last(lastElement.split('.'))
		pathInfo.file.contentType = app.contentTypes[pathInfo.file.ext] || ''
		if (pathInfo.file.contentType === '') console.log(('Missing content type for ' + pathInfo.file.ext).warn)
		pathInfo.file.cache = app.contentTypes[pathInfo.file.ext[1]] || 'nocache'
	}
	else {
		pathInfo.rest = {}
		pathInfo.rest.page = pathArray[0] || 'home'
		pathInfo.rest.control = '/' + (pathArray[0] || '')
		pathInfo.rest.type = pathArray[1] || ''
		pathInfo.rest.item = pathArray[2] || null
		pathInfo.rest.title = pathArray[3] || ''
	}
	;(query !== '')
		? pathInfo.query = querystring.parse(query)
		: pathInfo.query = {}

	return pathInfo
}

exports.route = route