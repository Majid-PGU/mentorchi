const UserModel = require("../models/user-model");
const Joi = require("joi")
const _ = require("lodash")
const bcrypt = require ("bcrypt")


const register = async (req , res , next) => {
    const {email, name, password} = req.body;
    const schema = Joi.object({
        name : Joi.string().min(3).max(50).required(),
        email : Joi.string().email({tlds : {allow : false}}).required(),
        password : Joi.string().min(5).max(50).required()
    });
    const validateResault = schema.validate({email, name, password});

    if (validateResault.error) {
        return res.status(400).send({
            message: "Invalid email format: Please enter a valid email address.",
            details: validateResault.error.details[0].message
        });
    }
    
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
    console.log(req.body);
    const schema = {
        
        email : Joi.string().email().required(),
        password : Joi.string().min(5).max(50).required()
    }
    const validateResault = Joi.object(schema).validate(req.body)
    if (validateResault.err)
      return res.send(validateResault.err.details[0].message)

    const user = await UserModel.getUserByEmail(req.body.email)
    if (!user) return res.status(400).send({
        message: "email or password is invalid"
    })

    const validPassword = await bcrypt.compare(req.body.password , user.password)
    if(!validPassword) return res.status(400).send({
        message: "the user or password is invalid"
    })
    console.log("success");
    res.send({
        message:"sucessfully",
        data:{
            // token
        }
    })
};


module.exports = { register , login }
