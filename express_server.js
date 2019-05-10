//=======================================================
// Project:         TINYAPP
//
// Author:          Britta Jorgenson
// Submitted:       May 10, 2019
// Organization:    Lighthouse Labs
//
//=======================================================
//                 SERVER SETUP
//=======================================================

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt');
const saltRounds = 15;

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.use(cookieParser());


//=======================================================
//                  DATABASES
//=======================================================

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "abc" },
    b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
    Tsm5xK: { longURL: "http://www.youtube.com", userID: "user2RandomID" },
    gsb5aT: { longURL: "http://www.youtube.com", userID: "abc" },
    Msc5xy: { longURL: "https://www.bbc.com", userID: "abc" }

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
    },
    "abc": {
        id: "abc", 
        email: "a@b.com", 
        password: "123"
    }
  }


//=======================================================
//                  FUNCTIONS
//=======================================================

function generateRandomString() {
    let randomString = '';
    for (let i = 0; i < 6; i++){
        let randomNumber = Math.floor((Math.random() * (122 - 97) + 97));
        randomString += String.fromCharCode(randomNumber)
    }
    return randomString;
}

// --- Function to return user object { id: id, email: email, password: password} from email ---
function emailLookup(email){
    for (let userKey in users) {
        if (email === users[userKey].email) {
            return users[userKey];
        }
    }
}

// --- Function to return user object { id: id, email: email, password: password} from user_id ---
function idLookup(user_id){
    for (let user in users) {
        if (users[user].id === user_id) {
            return users[user];
        }
    }
}


// --- Function to return user specific urls object from user_id ---
function urlsForUser(user_id) {
    let urls = {};
    for(let shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === user_id) {
            urls[shortURL] = urlDatabase[shortURL].longURL;
        }
    }
    return urls;
}

// --- Check first 7 characters of longURL for https:/ or http:// prefix, append if it does not have it ---
//      IMPROVEMENT ALERT -> Need to find industry solution for this type of check
function httpCheck(longURL) {
    //HTTPs:/
    let webPrefix = ['http://', 'https:/']
    let subString = longURL.substring(0, 7).toLowerCase();
    if (webPrefix.includes(subString)) {
        return longURL;
    } else {
        return webPrefix[0] + longURL;
    }
    
}

//=======================================================
//                  GET REQUESTS
//=======================================================

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/users.json', (req, res) => {
    res.json(users);
});



// --- GET REQUESTS - URL Creation, Summary and Edits ---

app.get('/urls', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    let userUrls;
    if (user) {
        userUrls = urlsForUser(user.id);
    }
    let templateVars = {
        user : user,
        urls : userUrls
    };
    res.render('urls_index', templateVars);
});


app.get('/urls/new', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    if (user) {
        let templateVars = {
            user : user
        };
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
});

app.get('/urls/:shortURL', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    let shortURL = req.params.shortURL;
    if (user) {
        const userUrls = urlsForUser(user.id);
        if (userUrls[shortURL]) {
            let templateVars = {
                user : user,
                shortURL: shortURL, 
                longURL: userUrls[shortURL]
        };
            res.render('urls_show', templateVars);
        } else {
            res.redirect('/urls');
        };
    } else {
        res.redirect('/login');
    }
});


// --- GET REQUESTS - Link to long URL ---
//      1 - No Security/Login required for this feature
//      2 - If the shortURL is not in the database, redirect /urls
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    if (urlDatabase[shortURL]) {
        let redirectURL = urlDatabase[shortURL].longURL;
        res.redirect(redirectURL);
    } else {
        res.redirect('/urls');
    }
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
    let user = idLookup(req.cookies["user_id"]);
    if(user) {
        shortURL = generateRandomString();
        let longURL = httpCheck(req.body.longURL)
        urlDatabase[shortURL] = { longURL : longURL, userID: user.id },
        res.redirect('/urls/'+ shortURL); 
    } else {
        res.status(400).redirect('/login');
    }
});


app.post('/urls/:shortURL', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);   
    if (user) {
        let shortURL = req.params.shortURL;
        let longURL = httpCheck(req.body.longURL);
        urlDatabase[shortURL].longURL = longURL;
        res.redirect('/urls')
    }else {
        res.status(400).redirect('/login');
    }
});


app.post('/urls/:shortURL/delete', (req, res) => {
    let user = idLookup(req.cookies["user_id"]);
    if (user) {
        let shortURL = req.params.shortURL;
        delete urlDatabase[shortURL];
        res.redirect('/urls')
    } else {
        res.status(400).redirect('/login');
    }
});


// --- POST REQUESTS - User Login and Registration ---

app.post('/register', (req, res) => {
    let email = req.body.email;
    let user = emailLookup(email);
    if ( !user && email && req.body.password) {
        let newId = generateRandomString();

        users[newId] = {
            id: newId, 
            email: email,
            password: bcrypt.hashSync(req.body.password, saltRounds)
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

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
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


//=======================================================
//=======================================================
//                      END
//=======================================================
//=======================================================