const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host: 'node31559-endows.app.ruk-com.cloud',
    user: 'root',
    password:"MHYvsi76415",
    database:"project"
}).promise()
module.exports = dbConnection;