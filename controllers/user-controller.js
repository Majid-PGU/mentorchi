const UserModel = require("../models/user-model");
const Joi = require("joi")
const _ = require("lodash")
const bcrypt = require ("bcrypt")


const register = async (req , res , next) => {
    const {email, name, password} = req.body
    const schema = {
        name : Joi.string().min(3).max(50).required(),
        email : Joi.string().required(),
        password : Joi.string().min(5).max(50).required()
    }
    const validateResault = Joi.object(schema).validate({email, name, password})

    if (validateResault.err)
      return res.send(validateResault.err.details[0].message)

    const hashPassword = await bcrypt.hash(password , 10)
    
    console.log({email, name, password: hashPassword});
    
    //email ghablan boodeh ya na?
    const user = await UserModel.getUserByEmail(email)
    console.log(user);
    
    if(user) return res.status(400).send("user already exists")


        
    const resault = await UserModel.insertUser(
        name ,
        email ,
        hashPassword
        );
    console.log(resault)

    const newUser = await UserModel.getUserByEmail(req.body.email)


    res.send(_.pick(newUser , ["id" , "name" , "email"]))
};

const login = async (req , res , next) => {

    const schema = {
        
        email : Joi.string().email().required(),
        password : Joi.string().min(5).max(50).required()
    }
    const validateResault = Joi.object(schema).validate(req.body)
    if (validateResault.err)
      return res.send(validateResault.err.details[0].message)

    const user = await UserModel.getUserByEmail(req.body.email)
    if (!user) return res.status(400).send("email or password is invalid")

    const validPassword = await bcrypt.compare(req.body.password , user.password)
    if(!validPassword) return res.status(400).send("the user or password is invalid")

    res.send({
        message:"",
        data:{
            // token
        }
    })
};


module.exports = { register , login }