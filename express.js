const express = require("express")
require('dotenv').config()

const app = express()
/*app.get()
app.post()
app.put()
app.delete()
*/


app.get("/" , (req , res) =>{
    res.send("hello")
})

app.get("/api/courses" , (req , res) => {
    res.send(['html' , 'css' , 'java'])
})


app.get("/api/courses/:id/:name?" , (req , res)=>{
    res.send([req.params.id , req.params.name])
})

const port = process.env.APP_PORT || 3000
app.listen(port, () => {
    console.log(`listening port ${port}`)
})

