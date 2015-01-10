module.exports = function(app) {
    app.get('/run', app.libs.restrict, function(req, res) {
        res.redirect('/run/list');
    });

    app.get('/run/list', app.libs.restrict, function(req, res) {
        // to be implmented
    });

    app.get('/run/create', app.libs.restrict, function(req, res) {
        var zones = [
        {
            name: 'zone1',
            days: [
            {
                name: "1",
                amount: 10
            }]
        },{
            name:'zone2',
            days: [
            {
                name: "1",
                amount: 10
            },{
                name: "2",
                amount: 5
            }, {
                name: "3",
                amount: 7
            }]
        }];

        var users = ['jay', 'bob', 'jim', 'paul', 'smith'];

        res.render('run/create', { zones: zones, users: users });
    });

    app.post('/run/create', app.libs.restrict, function(req, res) {
        // to be implemented
    });
};
