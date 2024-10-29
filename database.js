const sql = require('mssql')

const pool = sql.createPool({
    host: 'localhost',
    user: 'root',
    password: '$Majid3510$',
    database: 'user_account'
}).promise()