// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

module.exports = function(app) {
  app.libs.addSessionUser = function(req, user, rememberMe, fn) {
    if (!fn) {
      fn = rememberMe
      rememberMe = false
    }

    var expiry = false
    if (rememberMe) {
      expiry = 15 * 60 * 60 * 24 * 1000
    }

    req.session.regenerate(function() {
      // expire on browser close
      if (expiry) {
        req.session.cookie.expires = new Date(Date.now() + expiry)
      }

      req.session.cookie.maxAge = expiry

      var sessionUser = {
        name: user.name,
        points: user.points,
        id: user._id,
        state: user.state,
        isAdmin: user.type == 2 ? true : false,
        alts: user.alts
      }

      req.session.user = sessionUser
      fn(sessionUser)
    })
  }
}
