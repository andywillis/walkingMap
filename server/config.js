exports.app = {
	name: 'Deviation'
,	version: 0.9
,	description: 'UWS blog'
,	author: 'UWS <uwsone@gmail.com>'
,	dateOfLastRelease: '18:37 Thu, 22 March 2012.'
,	ssl: false
,	cacheOn: true
,	cacheExceptions: ['js']
,	stack: ['templates', 'markdown', 'database','dropbox','backup']
,	limit: 10
,	security: {
		salt: 'UySMPOQhZwK1Whlb5y2ITHX6MNzOC9A8rFlk3V3a4XMXwTUBt4iMIMIfHmAtuluElBq859aTuVOQgfTMDI0mPSATFSNzzrIbi1viC5lW0Q8VR1Z9LStTXm18iDon8F6H'
	,	salted_sha512: '9023254330b0b549f915dd32c8d7c643766a8577aeb5de1504f855a6991ee4a405d14397d58a5f748415abf38634b3061cb56f5478600a8e42510de43cafac23'
}
,	categories: [
		'Computers and internet'
	,	'Education'
	,	'Food and drink'
	,	'Grab bag'
	,	'Health and fitness'
	,	'Human relations'
	,	'Law and Government'
	,	'Media and Arts'
	,	'Religion and philosophy'
	,	'Science and nature'
	,	'Shopping'
	,	'Society and culture'
	,	'Sports, hobbies and recreation'
	,	'Technology'
	,	'Travel and transportation'
	,	'Work and money'
	,	'Writing and language'
	]
,	dependencies: {
		server: {
    	async: '0.1.18'
		,	cradle: '0.6.2'
		,	colors: '0.6.0-1'
		,	couchar: '0.3.4'
    ,	formidable: '1.0.9'
		,	marked: '0.2.1'
    ,	node_hash: '0.2.0'
		,	underscore: '1.3.1'
		}
	,	client: {
			jquery: '1.7.1'
		}
	}
,	colorTheme: {
		warn: 'red'
	,	ok: 'green'
	,	server: 'cyan'
	,	blog: 'grey'
	,	appName: 'yellow'
	}
,	contentTypes: {
		css:  'text/css'
	,	gif:  'image/gif'
	,	htm:  'text/html'
	,	html: 'text/html'
	,	ico:	'image/vnd.microsoft.icon'
	,	jpg:  'image/jpeg'
	,	js: 	'text/plain'
	,	png:  'image/png'
	,	rss:  'text/plain'
	,	ttf:  'application/x-font-ttf' 
	,	woff: 'application/x-font-woff'
	}
,	dbConn: {
		name: 'deviation'
	,	host: 'http://nodejitsudb5160025668.iriscouch.com'
//	,	host: 'http://localhost'
	,	port: 5984
	,	username: 'Andy'
	,	password: 'ch8rl13'
	}
,	dropbox: {
		consumer_key: 'pwdofruognpkh0i'
	,	consumer_secret: '6w4qsp7f0dai6a5'
	,	access_token: {oauth_token_secret: 'dprtzwucnjucss5', oauth_token: '6uiyqr5qkii1y8e', uid: '80737100'}
	}
}