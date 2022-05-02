const mysql = require('mysql');
const dbConnection = mysql.createConnection({
    host: 'node31902-mekiman.app.ruk-com.cloud',
    user: 'root',
    password:"XSIlxb27671",
    database:"project",
    port:'11346'
})
dbConnection.connect(function(err) {
    if (err) throw err;
      console.log("connect success");
});
module.exports = dbConnection;