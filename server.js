const express = require('express')
const app = express()

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.post('/new-register', function (req, res) {
    res.send('h')
})

app.listen(3000)