const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host: 'node31559-endows.app.ruk-com.cloud',
    user: 'root',
    password:"MHYvsi76415",
    database:"project",
    //port:"11346"
}).promise()
module.exports = dbConnection;