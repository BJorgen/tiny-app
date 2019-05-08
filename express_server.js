const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    res.render('urls_new')
});

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render('urls_show', templateVars);
});

function generateRandomString() {
    let randomString = '';
    for (let i = 0; i < 6; i++){
        let randomNumber = Math.floor((Math.random() * (122 - 97) + 97));
        randomString += String.fromCharCode(randomNumber)
    }
    return randomString;
}

app.post('/urls', (req, res) => {
    shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL
    console.log(`
    Long URL: ${urlDatabase[shortURL]}
    Short URL: ${shortURL}
    urlDatabase:
    `);
    console.log(urlDatabase)
    res.redirect('/urls/'+ shortURL);
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});