const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const dbConnection = require('./database');
const con = require('./database2');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const app = express();
const { redirect } = require('express/lib/response');

/*const con = mysql.createPool({
    host: "node31559-endows.app.ruk-com.cloud",
    user: "root",
    password: "MHYvsi76415",
    database: "project"
  });*/


app.use(express.urlencoded({ extended: false }));

// SET OUR VIEWS AND VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//img
app.use(express.static(path.join(__dirname, '/public')))
// APPLY COOKIE SESSION MIDDLEWARE
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 3600 * 1000 // 1hr
}));

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('index');
    }
    next();
}
const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/home');
    }
    next();
}

// END OF CUSTOM MIDDLEWARE
// ROOT PAGE
app.get('/', ifNotLoggedin, (req, res, next) => {
    con.query("SELECT `name` FROM `users` WHERE `id`=?", [req.session.userID], (err, result) => {
        res.render('home', {
            name: result[0].name

        });
    })



});// END OF ROOT PAGE
// ROOT PAGE
app.get('/register', (req, res, next) => {
    res.render('register')
})
app.get('/admin', (req, res, next) => {
    res.render('admin')
})


app.get('/pro', (req, res, next) => {
    res.render('pro', { name: req.session.user_name })
})

app.get("/showproduct", (req, res) => {

    con.query("SELECT * FROM product", (err, result) => {
        if (err) return res.status(200).send(err);
        else return res.status(200).send(result);
    })

})





// REGISTER PAGE
app.post('/register', ifLoggedin,
    // post data validation(using express-validator)
    [
        body('user_email', 'Invalid email address!').isEmail().custom((value) => {
            return dbConnection.execute('SELECT `email` FROM `users` WHERE `email`=?', [value])
                .then(([rows]) => {
                    if (rows.length > 0) {
                        return Promise.reject('This E-mail already in use!');
                    }
                    return true;
                });
        }),
        body('user_name', 'Username is Empty!').trim().not().isEmpty(),
        body('user_user', 'Student Id is Empty!').trim().not().isEmpty(),
        body('user_pass', 'The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
    ],// end of post data validation
    (req, res, next) => {

        const validation_result = validationResult(req);
        const { user_name, user_pass, user_user, user_email } = req.body;
        // IF validation_result HAS NO ERROR

        // password encryption (using bcryptjs)
        bcrypt.hash(user_pass, 12).then((hash_pass) => {
            // INSERTING USER INTO DATABASE
            dbConnection.execute("INSERT INTO `users`(`user_id`, `name`, `email`, `password`) VALUES (?,?,?,?)", [user_user, user_name, user_email, hash_pass])
            res.send(`<a href="/">Go to Home</a>`);
        })
            .catch(err => {
                // THROW HASING ERROR'S
                if (err) throw err;
            })

    });// END OF REGISTER PAGE


// LOGIN PAGE
app.post('/', ifLoggedin, [
    body('user_email').custom((value) => {
        return dbConnection.execute('SELECT email FROM users WHERE email=?', [value])
            .then(([rows]) => {
                if (rows.length == 1) {
                    return true;

                }
                return Promise.reject('Invalid Email Address!');

            });
    }),
    body('user_pass', 'Password is empty!').trim().not().isEmpty(),
], (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;
    console.log(user_email, user_pass);


    con.query('SELECT * FROM users WHERE email=?', [user_email], (err, rows) => {
        console.log(rows[0].name);


        bcrypt.compare(user_pass, rows[0].password).then((result) => {
            if (rows[0].rank == "admin") {
                req.session.status = rows[0].rank;
                req.session.userID = rows[0].id;
                req.session.user_name = rows[0].name;
                return res.render('admin', { name: req.session.user_name });
            }
            if (result) {
                console.log('yes')
                req.session.isLoggedIn = true;
                req.session.userID = rows[0].id;
                req.session.user_name = rows[0].name;
                res.redirect('/');
            }
            console.log(rows);
        })
            .catch(err => {
                if (err) throw err;
            })
    }
    )




})

app.get('/user', (req, res) => {
    if (req.session.status == "admin") {
        console.log('yes')

        con.query("SELECT * FROM users",(err,rows)=>{
        
            console.log(rows);
            res.render('user', {
                name: req.session.user_name,
                result: rows
            });
        })
           
        

    }
    console.log('no')
})
// END OF LOGIN PAGE

// LOGOUT
app.get('/logout', (req, res) => {
    //session destroy
    req.session = null;
    res.redirect('/');
});
app.get('/index', (req, res) => {
    //session destroy
    req.session = null;
    res.redirect('/');
});
// END OF LOGOUT

app.use('/', (req, res) => {
    res.status(404).send('<h1>404 Page Not Found!</h1>');
});

app.get("/showuser", (req, res) => {
    con.query("SELECT * FROM users", (err, result) => {
        if (err) return res.status(200).send(err);
        else return res.status(200).send(result);
    })

})


app.listen(11341, () => console.log("Server is Running..."));