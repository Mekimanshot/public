const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host: 'node31440-mekimantest.app.ruk-com.cloud',
    user: 'root',
    password:"TTAkcd93119",
    database:"project"
}).promise()
module.exports = dbConnection;