const { google } = require('googleapis');
const Pool = require('pg').Pool
var path = require('path');
var express = require('express');
var app = express();



const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

app.use(express.static('static'));

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var authed = false;

app.get('/', (req, res) => {
    console.log(__dirname + '/static/index.html');
    res.sendFile(path.join(__dirname + '/static/index.html'));
});

app.get('/logout', (req, res) => {
    console.log('Loggin out');
    authed = false;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    if(!authed) {
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        console.log('Redirecting to: ' + url);
        res.redirect(url);
    } else {
        console.log('Already logged in');
        res.redirect('/');
    }
});

app.get('/profile', (req, res) =>{
   if(!authed) {
       res.send('Not logged in. <a class="btn btn-primary" href="/login">Click here to login</a>');
   } else {
       const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
       oauth2.userinfo.v2.me.get(function (err, result) {
           if(err) {
               console.log('Błąd: ' + err);
           }
           res.send('Logged in: ' + result.data.name +
                    ' <img src="' + result.data.picture +
                    '"height="23" width="23">' +
                    '<br><br><a class="btn btn-primary" href="/logout">Click here to logout</a>');
       });
   }
});

app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/')
            }
        });
    }
});

app.get('/api/users', (request, response) => {
    if(!authed) {
        response.json(null);
    } else {
        pool.query('SELECT * FROM public."users"', (error, res) => {

            if(error) {
                throw error;
            }
            response.json(res);
        })
    }
});


app.listen(process.env.PORT, function () {
    console.log('Example app listening on port: ' + process.env.PORT);
    console.log('Google OAuth data:\n' + CLIENT_ID + '\n' + CLIENT_SECRET + '\n' + REDIRECT_URL);
});