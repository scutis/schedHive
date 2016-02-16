var session = require('express-session')({
    secret: "secret",
    resave: true,
    saveUninitialized: true
});

module.exports = session;