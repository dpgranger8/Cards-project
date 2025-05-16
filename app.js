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

const cardsJSON = './cards.json'

const rawData = JSON.parse(fs.readFileSync(cardsJSON, 'utf-8'))
let cards = rawData.cards

passport.use(new LocalStrategy((username, password, done) => {
    const users = JSON.parse(fs.readFileSync(cardsJSON))
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
        return done(null, user)
    } else {
        return done(null, false, { message: "Invalid credentials" })
    }
}))

app.post('/getToken', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Authentication failed' })
        }

        const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' })
        res.json({ token });
    })(req, res, next)
})

app.get('/cards', (req, res) => {
    const filters = req.query
    const filteredCards = cards.filter(card => {
        // Check if all filters match the card fields
        return Object.entries(filters).every(([key, value]) => {
            return card[key] === value;
        })
    })

    res.json(filteredCards);
})

app.post('/cards/create', (req, res) => {
    const newCard = req.body
    console.log(newCard)
    cards.forEach(element => {
        if (element.id === newCard.id) {
            return res.status(400).json({ message: 'Card'})
        }
    });
    cards.push(newCard)
    fs.writeFileSync(cardsJSON, JSON.stringify(cards), 'utf-8')

    res.status(201).json({
        message: 'Card added successfully',
        card: newCard
    })
})

app.listen(process.env.PORT, () => {
    console.log("Listening on port " + process.env.PORT)
})

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/')
}