// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var async = require('async'),
  mongoose = require('mongoose')

module.exports = function(app) {
  app.libs.bidwatch = function() {
    if (app.factory !== undefined && app.factory.bids !== undefined) {
      app.factory.bids.getAll(function(bids) {
        // iterate over the bids checking the remaining time on each of them
        async.forEach(
          bids,
          function(bid, callback) {
            if (bid.endDate < new Date()) {
              console.log(`CLOSING BID FOR`, bid)

              // close the bid by setting state to 1
              bid.state = 1
              bid.save(function(err) {
                console.log(`saved bid !!!!!`)
                if (err) {
                  console.log('app.libs.bidwatch update bid ERROR: ' + err)
                }

                var Bid = mongoose.model('Bid', app.models.bid)
                var Point = mongoose.model('Point', app.models.point)
                var User = mongoose.model('User', app.models.user)
                var Item = mongoose.model('Item', app.models.item)

                // spend the users points
                var newPoint = new Point({
                  amount: bid.amount,
                  state: 2,
                  user: bid.user,
                  zone: bid.zone
                })

                newPoint.save(function() {
                  console.log(`Saved newPoint`, newPoint)

                  // update the item to state = 2
                  bid.item.state = 2
                  bid.item.save(function(err) {
                    if (err) {
                      console.log('app.libs.bidwatch update item ERROR: ' + err)
                    }

                    callback()
                  })
                })
              })
            } else {
              callback()
            }
          },
          function(err) {}
        )
      })
    }
  }

  // start our timer
  app.timer = {}
  app.timer.bidwatch = setInterval(app.libs.bidwatch, 2000)
}
