// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var async = require('async'),
  mongoose = require('mongoose')

module.exports = function(app) {
  var Schema = mongoose.Schema
  var itemSchema = new Schema(
    {
      state: Number,
      name: String,
      zone: String,
      minimumBid: Number,
      currentBid: { type: Schema.Types.ObjectId, ref: 'Bid' },
      previousBids: [app.models.bid],
      date: { type: Date, default: Date.now }
    },
    { strict: false }
  )

  itemSchema.pre('remove', function(next) {
    // cascade delete to currentBid and previousBids

    var previousBids = this.previousBids
    if (this.currentBid) {
      this.currentBid.remove(function(err) {
        async.forEach(
          previousBids,
          function(bid, callback) {
            bid.remove(function(err) {
              callback()
            })
          },
          function(err) {
            next()
          }
        )
      })
    } else {
      if (this.previousBids) {
        async.forEach(
          previousBids,
          function(bid, callback) {
            bid.remove(function(err) {
              callback()
            })
          },
          function(err) {
            next()
          }
        )
      } else {
        next()
      }
    }
  })

  app.models.item = itemSchema
}
