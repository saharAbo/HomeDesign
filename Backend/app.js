const express = require('express')
const mysql = require('mysql')
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser')
const refreshfunc = require('./myRepository').refresh
app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(express.static('build'));
// const path = require('path');





app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    console.log("inside middleware to call refresh");
    let x = refreshfunc(req, res);
    console.log("refresh returned status = ", x);
    res.myStatusCode = x;
    next();
})

// Handles any requests that don't match the ones above
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build'));
// });

// const root = require('path').join(__dirname, 'build')
// app.use(express.static(root));



// app.get("*", cors(), (req, res) => {
//     res.sendFile('index.html', { root });
// })






app.use('/users', require('./route'));
app.use('/images', require('./route_image'));






//------------------------------------------------
const port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log(`My app is listening on port ${port}`)
})