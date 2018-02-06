// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var util = require('util'),
  async = require('async')

module.exports = function(app) {
  app.get('/run', app.libs.restrict, function(req, res) {
    res.redirect('/run/list')
  })

  app.get('/run/edit/:id', app.libs.restrict, function(req, res) {
    var runId = req.params.id
    var user = req.session.user

    app.factory.runs.getById(runId, function(run) {
      console.log(run)

      // check if the logged in user is an admin or the run leader
      if (user.isAdmin || (run.leader._id.equals(user.id) && run.state == 1)) {
        res.render('run/edit', { run: run })
      } else {
        res.redirect('/')
      }
    })
  })

  app.post('/run/edit/:id', app.libs.restrict, function(req, res) {
    var runId = req.params.id
    var user = req.session.user
    var players = req.body.players
    var items = req.body.items
    var approveRun = req.body.approveRun
    var tmpRun = {}

    tmpRun.runUsers = []
    tmpRun.runPoints = []
    tmpRun.runItems = []

    console.log(players)
    console.log(items)

    app.factory.runs.getById(runId, function(runEntity) {
      tmpRun.zone = runEntity.zone

      // check if the logged in user is an admin or the run leader
      if (
        user.isAdmin ||
        (runEntity.leader._id.equals(user.id) && run.state == 1)
      ) {
        // remove all points and items from the run
        async.forEach(
          runEntity.points,
          function(point, callback) {
            point.remove(function(err) {
              callback()
            })
          },
          function(err) {
            async.forEach(
              runEntity.items,
              function(item, callback) {
                item.remove(function(err) {
                  callback()
                })
              },
              function(err) {
                _addUsersAndPoints(tmpRun, players, function(tmpRun) {
                  _addItems(tmpRun, items, function(tmpRun) {
                    if (approveRun) {
                      tmpRun.state = 0
                    }

                    runEntity.items = tmpRun.runItems
                    runEntity.points = tmpRun.runPoints

                    runEntity.save(function(err) {
                      res.redirect('/')
                    })
                  })
                })
              }
            )
          }
        )
      } else {
        res.redirect('/')
      }
    })
  })

  app.get('/run/list', app.libs.restrict, function(req, res) {
    app.factory.runs.getAll(function(runs) {
      var approved = runs.filter(function(run) {
        return run.state == 0
      })

      var unapproved = runs.filter(function(run) {
        return run.state == 1
      })

      res.render('run/list', { approved: approved, unapproved: unapproved })
    })
  })

  app.get('/run/detail/:id', app.libs.restrict, function(req, res) {
    var runId = req.params.id

    app.factory.runs.getById(runId, function(run) {
      res.render('run/detail', { run: run })
    })
  })

  app.get('/run/create', app.libs.restrict, function(req, res) {
    var zones = app.factory.zones
    var users = app.factory.users.getAll(function(users) {
      var userNames = []
      async.forEach(
        users,
        function(user, callback) {
          userNames.push(user.name)
          callback()
        },
        function(err) {
          res.render('run/create', { zones: zones, users: userNames })
        }
      )
    })
  })

  app.post('/run/create', app.libs.restrict, function(req, res) {
    var zone = req.body.zone,
      tmpDays = req.body.days.toString(),
      users = req.body.users.toString(),
      items = req.body.items,
      points = 0,
      days = []

    // format days into an array of objects
    tmpDays = tmpDays.split(',')
    tmpDays.forEach(function(day) {
      day = day.toString().split('|')
      days.push({ name: day[0], amount: day[1] })
      points += Number(day[1])
    })

    // format users into array
    users = users.split(',')

    // construct the temp run
    var run = {
      zone: zone,
      days: days,
      users: users,
      items: items.split('\n').map(item => {
        return {
          item: item.replace(/\r/gi, '')
        }
      }),
      points: points
    }

    // save the temp run to the session
    req.session.run = run

    // redirect to run/confrim
    res.redirect('/run/confirm')
  })

  app.get('/run/confirm', app.libs.restrict, async function(req, res) {
    // load the temp run from the session
    var run = req.session.run

    var { items } = run
    for (var i in items) {
      // check if we are refreshing the page or something where items is already an array of objects
      if (typeof items[i] === 'object') {
        console.log(items[i])
        items[i] = items[i].item
      }

      var name = items[i].split(' - ')[0]
      var similarItems = await app.factory.items.getByName(name)
      items[i] = {
        item: items[i].replace(/\r/gi, ''),
        similarItems
      }
    }

    run.items = items

    if (run !== undefined) {
      res.render('run/confirm', { run: run })
    } else {
      res.redirect('/run/create')
    }
  })

  app.post('/run/confirm', app.libs.restrict, function(req, res) {
    run = req.session.run
    run.users = req.body.user || []
    run.items = req.body.item || []
    run.leader = req.session.user.name

    run.runDays = req.days
    run.runUsers = []
    run.runItems = []
    run.runPoints = []

    _addUsersAndPoints(run, run.users, function(run) {
      _addItems(run, run.items, function(run) {
        _addRun(run, function(entity) {
          res.redirect('/')
        })
      })
    })
  })

  app.get('/run/approve/:id', app.libs.restrictAdmin, function(req, res) {
    var runId = req.params.id

    _updateRunState(runId, 0, function() {
      res.redirect('back')
    })
  })

  app.get('/run/unapprove/:id', app.libs.restrictAdmin, function(req, res) {
    var runId = req.params.id

    _updateRunState(runId, 1, function() {
      res.redirect('back')
    })
  })

  app.get('/run/delete/:id', app.libs.restrict, function(req, res) {
    var runId = req.params.id
    var user = req.session.user

    app.factory.runs.getById(runId, function(run) {
      if (user.isAdmin || (run.leader._id.equals(user.id) && run.state == 1)) {
        app.factory.runs.delete(runId, function() {
          res.redirect('/')
        })
      } else {
        res.redirect('back')
      }
    })
  })

  _updateRunState = function(runId, state, fn) {
    // get the run in all its detail
    app.factory.runs.getById(runId, function(run) {
      var itemsDone = false
      var pointsDone = false

      // update the run state
      run.state = state
      run.save(function(err) {
        if (err) {
          console.log(
            util.format('/run/approve/%s run update ERROR: %s', runId, err)
          )
        }

        // iterate over items
        async.forEach(
          run.items,
          function(item, callback) {
            // update item state
            item.state = state
            item.save(function(err) {
              if (err) {
                console.log(
                  util.format(
                    '/run/approve/%s item update ERROR: %s',
                    runId,
                    err
                  )
                )
              }

              callback()
            })
          },
          function(err) {
            // iterate over points
            async.forEach(
              run.points,
              function(point, callback) {
                // update point state
                point.state = state
                point.save(function(err) {
                  if (err) {
                    console.log(
                      util.format(
                        '/run/approve/%s point update ERROR: %s',
                        runId,
                        err
                      )
                    )
                  }

                  callback()
                })
              },
              function(err) {
                fn()
              }
            )
          }
        )
      })
    })
  }

  _addUsersAndPoints = function(run, users, fn) {
    // iterate over each user and if they don't exist - create them
    async.forEach(
      users,
      function(user, callback) {
        user.name = user.name.trim()
        app.factory.users.getByNameOrAltName(user.name, function(userEntity) {
          if (userEntity !== null) {
            // add the user to the run
            run.runUsers.push(userEntity)

            // add points to the user
            app.factory.points.add(userEntity, run.zone, user.points, function(
              pointEntity
            ) {
              if (pointEntity !== null) {
                run.runPoints.push(pointEntity)
              }

              callback()
            })
          } else {
            app.factory.users.add(user.name, function(userEntity) {
              // add the user to the run
              if (userEntity !== null) {
                run.runUsers.push(userEntity)

                // add points to the user
                app.factory.points.add(
                  userEntity,
                  run.zone,
                  user.points,
                  function(pointEntity) {
                    if (pointEntity !== null) {
                      run.runPoints.push(pointEntity)
                    }

                    callback()
                  }
                )
              } else {
                callback()
              }
            })
          }
        })
      },
      function(err) {
        // continue process
        fn(run)
      }
    )
  }

  _addItems = function(run, items, fn) {
    // iterate over all the items, adding them
    async.forEach(
      items,
      function(item, callback) {
        app.factory.items.add(item.name, item.value, run.zone, function(
          itemEntity
        ) {
          if (itemEntity !== null) {
            run.runItems.push(itemEntity)
          }

          callback()
        })
      },
      function(err) {
        fn(run)
      }
    )
  }

  _addRun = function(run, fn) {
    // get the leader
    app.factory.users.getByName(run.leader, function(userEntity) {
      // add the run
      app.factory.runs.add(
        userEntity,
        run.runUsers,
        run.runPoints,
        run.runItems,
        run.zone,
        run.runDays,
        function(runEntity) {
          fn(runEntity)
        }
      )
    })
  }
}
