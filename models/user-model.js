const pool = require("../utilities/mysql_database");

class UserModel{
    static insertUser = async(name , email , password) =>{
        const [resault] = await pool.query(`insert into user.persons
             (name , email , password)
              values ( ? , ? , ?)` , [name , email , password])
              return resault
    }

    static getUserByEmail = async(email) => {
        const [resault] = await pool.query("select * from user.persons where email = ?" , [email])
        return resault[0]
    }
}

module.exports = UserModel