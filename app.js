const express = require("express");
const session = require("express-session")
const passport = require("passport")
const app = express();
const GoogleStrategy = require("passport-google-oauth2")
require("dotenv").config()

app.set('views', './views')
app.set('view engine', 'pug')

app.use(session({
    secret: 'asdfasdf',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
}))

app.use(passport.initialize());
app.use(passport.session())

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
    //Normally we would use the profile to search a user in our database
    //If an error occurs during that process pass it as the first parameter to done, otherwise pass the looked up user
    done(null, profile)
}))

passport.serializeUser((user, done) => {
    //Takes a user and serializes it down to something smaller that can be used in the future to find the user again
    done(null, user)
})

passport.deserializeUser((user, done) => {
    //Takes whatever was used to serialize the user, and deserializes it back to a user object
    done(null, user)
})

const authRouter = express.Router()

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get('/google/callback', passport.authenticate('google', { successRedirect: '/displayUserDetails', failureRedirect: '/' }))


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/displayUserDetails', isLoggedIn, (req, res) => {
    console.log(req.user)
    res.render('userDetails', { user: req.user })
})

app.get('/logout', async (req, res, next) => {
    req.logout((err) => {
        if (err) next(err)
        res.redirect('/')
    })
})

app.use((err, req, res) => {
    console.log(err.message)
    res.status(500).send('Something broke oops')
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/')
}