const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.use(cookieParser());


const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};


app.get('/', (req, res) => {
    res.send("Hello!")
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n")
});


function generateRandomString() {
    let randomString = '';
    for (let i = 0; i < 6; i++){
        let randomNumber = Math.floor((Math.random() * (122 - 97) + 97));
        randomString += String.fromCharCode(randomNumber)
    }
    return randomString;
}



app.get('/urls', (req, res) => {
    let templateVars = {
        username: req.cookies["username"],
        urls: urlDatabase
    };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: req.cookies["username"]
    };
    res.render('urls_new', templateVars)
});

app.get('/urls/register', (req, res) => {
    res.clearCookie('username');

    let templateVars = {
        username : false
    };
    res.render('user_register',templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
    let templateVars = {
        username: req.cookies["username"],
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL]
    };
    res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
    shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL
    res.redirect('/urls/'+ shortURL);
});

app.post('/urls/:shortURL', (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect('/urls')
});

app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls')
});

app.post('/login', (req, res) => {
    res.cookie('username', req.body.username);
    res.redirect('/urls');
});

app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('/urls');
});


app.post('/register', (req, res) => {
    res.cookie('username', req.body.email);
    //res.cookie('password', req.body.password);
    res.redirect('/urls', );
});


app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});