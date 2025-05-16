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
    const users = JSON.parse(fs.readFileSync('./users.json'))
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
        return done(null, user)
    } else {
        return done(null, false, { message: "Invalid credentials" })
    }
}))

app.post('/getToken', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        console.log(err)
        console.log(user)
        if (err || !user) {
            return res.status(401).json({ message: 'Authentication failed' })
        }

        const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1d' })
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

app.post('/cards/create', isLoggedIn, (req, res) => {
    const newCard = req.body
    newCard.id = cards.reduce((maxId, card) => Math.max(maxId, card.id), 0) + 1;
    cards.push(newCard)
    fs.writeFileSync(cardsJSON, JSON.stringify({cards}, null, 2), 'utf-8')

    res.status(201).json({
        message: 'Card added successfully',
        card: newCard
    })
})

app.put('/cards/:id', isLoggedIn, (req, res) => {
    const id = parseInt(req.params.id)
    const cardEdit = req.body
    let maxID = cards.reduce((maxId, card) => Math.max(maxId, card.id), 0) + 1;
    const index = cards.findIndex(card => card.id === id)
    if (index === -1) {
        res.status(400).json({
            message: 'This Card ID does not exist. Please try again',
        })
    } else {
        cardEdit.id = id
        cards[index] = cardEdit
        fs.writeFileSync(cardsJSON, JSON.stringify({cards}, null, 2), 'utf-8')
        res.status(201).json({
            message: 'Card edited successfully',
            card: cardEdit
        })
    }
})

app.delete('/cards/:id', isLoggedIn, (req, res) => {
    const id = parseInt(req.params.id)
    const index = cards.findIndex(card => card.id === id)
    if (index === -1) {
        res.status(400).json({
            message: 'This Card ID does not exist. Please try again',
        })
    } else {
        let deletedCard = cards.splice(index, 1)
        fs.writeFileSync(cardsJSON, JSON.stringify({cards}, null, 2), 'utf-8')
        res.status(201).json({
            message: 'Card deleted successfully',
            card: deletedCard
        })
    }
})

app.listen(process.env.PORT, () => {
    console.log("Listening on port " + process.env.PORT)
})

function isLoggedIn(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'Token missing or malformed' })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' })
    }
}