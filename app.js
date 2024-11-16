const express = require("express")
const app = express()
require('dotenv').config()
const userRoute = require('./routes/user-route')
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/api/users' , userRoute)

app.listen(process.env.PORT, ()=>{
    console.log(process.env.PORT);
    
})