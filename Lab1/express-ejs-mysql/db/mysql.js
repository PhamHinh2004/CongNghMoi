const mysql = require('mysql2');


// create Connection Pool 
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '123456',
    database: 'shopdb',
    waitForConnections: true, 
    connectionLimit: 10, 
    queueLimit: 0
})


// export type of promise to use async/await to optimise 
module.exports = pool.promise();