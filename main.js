const mysql = require('mysql2') //library installed

// object for database
const pool = mysql.createPool({ 
    host: 'localhost',
    user:'root',
    password: '$Majid3510$',
    database: 'user_account'
}).promise();

// Read the database
const getCourses = async () => {
    const [resault] = await pool.query(' select * from user_account.users')
    return resault
}

//show resault
const data = getCourses().then((resault) => {
    console.log(resault)
});


//insrt data
const insertCourse = async (user_name, user_password) => {
    const [resault] = await pool.query(`insert into users (user_name , user_password) values (?,?) `,
        [user_name, user_password])
    console.log(resault.insertId)
 return resault
}

const input = insertCourse('hamid', '351065566').then((resault) => {
    console.log(resault)
})