// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var mongoose = require('mongoose')
var util = require('util')

var app = { factory: {}, models: {}, libs: {} }
require('../models/user.js')(app)
require('../factory/users.js')(app)
require('../lib/hash.js')(app)

mongoose.connect('mongodb://localhost/chaosups')

if (process.argv.length <= 2) {
  console.log('Usage: nodejs adduser.js [username]')
  return process.exit(0)
}

var name = process.argv[2]
var type = process.argv[3] || 0
app.factory.users.exists(name, function(exists) {
  if (exists) {
    console.log(util.format("The user '%s' already exists", name))
    return process.exit(0)
  }

  app.factory.users.add(name, function(userEntity) {
    userEntity.type = type
    userEntity.save(function(err) {
      if (type == 0) {
        console.log(util.format("The user '%s' was created", name))
      } else if (type == 1) {
        console.log(util.format("The gatekeeper '%s' was created", name))
      } else if (type == 2) {
        console.log(util.format("The admin '%s' was created", name))
      }
    })
  })
})
