// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

module.exports = function(app) {
    app.locals.plugins = app.locals.plugins || [];

    app.locals.plugins.push({
        text: "Submit a bug",
        url: "https://github.com/logikaljay/chaosups/issues"
    });
}