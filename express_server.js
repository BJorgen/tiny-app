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

const users = { 
    "userRandomID": {
        id: "userRandomID", 
        email: "user@example.com", 
        password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
        id: "user2RandomID", 
        email: "user2@example.com", 
        password: "dishwasher-funk"
    }
  }


app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});


function generateRandomString() {
    let randomString = '';
    for (let i = 0; i < 6; i++){
        let randomNumber = Math.floor((Math.random() * (122 - 97) + 97));
        randomString += String.fromCharCode(randomNumber)
    }
    return randomString;
}

function emailLookup(email){
    for (let userKey in users) {
        if (email === users[userKey].email) {
            return users[userKey];
        }
    }
}

function idLookup(user_id){
    for (let user in users) {
        if (users[user].id === user_id) {
            return users[user];
        }
    }
}

//=======================================================
//                  GET REQUESTS
//=======================================================

// --- GET REQUESTS - URL Creation, Summary and Edits ---

app.get('/urls', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    if (user) {
        let templateVars = {
            user : user,
            urls : urlDatabase
        };
        res.render('urls_index', templateVars);
    } else {
        res.redirect('/login')
    }
});


app.get('/urls/new', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    let templateVars = {
        user : user
    };
    res.render('urls_new', templateVars)
});

app.get('/urls/:shortURL', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    let templateVars = {
        user : user,
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL]
    };
    res.render('urls_show', templateVars);
});


// --- GET REQUESTS - Link to long URL ---

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});


// --- GET REQUESTS - User Login and Registration ---

app.get('/register', (req, res) => {
    res.clearCookie('user_id')
    let templateVars = {
        user : null
    };
    res.render('user_register',templateVars);
});

app.get('/login', (req, res) => {
    res.clearCookie('user_id')
    let templateVars = {
        user : null
    };
    res.render('user_login',templateVars);
});


//=======================================================
//                  POST REQUESTS
//=======================================================

// --- POST REQUESTS - URL Creation, Summary and Edits/Delete ---

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


// --- POST REQUESTS - User Login and Registration ---

app.post('/register', (req, res) => {
    let user = emailLookup(req.body.email);
    if ( user === undefined && req.body.email && req.body.password) {
        let newId = generateRandomString();
        users[newId] = {
            id: newId, 
            email: req.body.email,
            password: req.body.password
        }
        user = users[newId];
        res.cookie('user_id', user.id);
        res.redirect('/urls');
    } else {
        console.log("User Already Exists or empty email or password.");
        res.status(400).send('Bad Request - Email used already has associated account');
    }
});

app.post('/login', (req, res) => {
    let user = emailLookup(req.body.email);
    if (user && user.password === req.body.password) {
        res.cookie('user_id', user.id)
        res.redirect('/urls');
    } else if (user){
        console.log("User Password is Wrong.");
        res.status(404).send('Incorrect Password');
    } else {
        console.log("User Email not found in Database.");
        res.status(404).send('Incorrect Login Email');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
});



//=======================================================

app.listen(PORT, () => {
    console.log(`Tiny App listening on port ${PORT}`);
});