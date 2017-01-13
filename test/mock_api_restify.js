var movies = [{
  title: 'The Prestige',
  director: 'Christopher Nolan',
},{
  title: 'Schindler\'s List',
  director: 'Steven Spielberg'
}]

var instances = []

function MockAPI(expiration, options) {
  var restify = require('restify')
  var apicache = require('../src/apicache').newInstance(options)
  var restifyEtagCache = require('restify-etag-cache');

  var app = restify.createServer();

  instances.push(this)

  this.apicache = apicache
  this.id = instances.length
  this.app = app

  instances.forEach((instance, id) => {
    if (instance.id !== this.id && this.apicache === instance.apicache) {
      console.log('WARNING: SHARED APICACHE INSTANCE', id, this.id, this.apicache.id, instance.apicache.id)
    }
    if (instance.id !== this.id && this.app === instance.app) {
      console.log('WARNING: SHARED EXPRESS INSTANCE', id, this.id)
    }
  })

  app.use(this.apicache.middleware(expiration))

  app.use(function(req, res, next) {
    res.charSet('utf-8');
    next()
  })

  app.use(restifyEtagCache());

  app.get('/api/movies', function(req, res) {
    app.requestsProcessed++

    res.json(movies)
  })

  app.get('/api/writeandend', function(req, res) {
    app.requestsProcessed++

    res.write('a')
    res.write('b')
    res.write('c')

    res.end()
  })

  app.get('/api/testcachegroup', function(req, res) {
    app.requestsProcessed++
    req.apicacheGroup = 'cachegroup'

    res.json(movies)
  })

  app.get('/api/text', function(req, res) {
    app.requestsProcessed++

    res.send('plaintext')
  })

  app.get('/api/html', function(req, res) {
    app.requestsProcessed++

    res.send('<html>')
  })

  app.get('/api/missing', function(req, res) {
    app.requestsProcessed++

    res.json(404, { success: false, message: 'Resource not found' })
  })

  app.get('/api/movies/:index', function(req, res) {
    app.requestsProcessed++

    res.json(movies[index])
  })

  app.apicache = apicache
  app.requestsProcessed = 0

  return app
}

module.exports = {
  create: function(expiration, config) { return new MockAPI(expiration, config) }
};