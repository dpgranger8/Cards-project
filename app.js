const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const fs = require('fs');
require("dotenv").config()
const app = express()

app.set('views', './views')
app.set('view engine', 'pug')

app.use(passport.initialize())
app.use(bodyParser.json())

app.post('/getToken', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Authentication failed' })
        }

        const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' })
        res.json({ token });
    })(req, res, next)
})

passport.use(new LocalStrategy((username, password, done) => {
    const users = JSON.parse(fs.readFileSync('./users.json'))
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
        return done(null, user)
    } else {
        return done(null, false, { message: "Invalid credentials" })
    }
}))

app.listen(process.env.PORT, () => {
    console.log("Listening on port " + process.env.PORT)
})

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/')
}