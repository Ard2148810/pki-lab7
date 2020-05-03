var express = require('express');
var app = express();


app.use(express.static('static'));

CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(process.env.PORT, function () {
    console.log('Example app listening on port: ' + process.env.PORT);
    console.log('Google OAuth data:\n' + CLIENT_ID + '\n' + CLIENT_SECRET + '\n' + REDIRECT_URL);
});