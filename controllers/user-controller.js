const UserModel = require("../models/user-model");
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require ("bcrypt");
const nodemailer = require('nodemailer');


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


// Email check ...
// it needs Host and Domain and it takes time 
const forget = async(req , res , next)=>{
    try {
        const {email} = req.body

        //email ghablan boodeh ya na?
    const user = await UserModel.getUserByEmail(email)
    console.log(user);
    
    if(!user) return res.status(400).send("user doesnt exists")


        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // true for 465, false for other ports (587 in this case for STARTTLS)
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            },
        
        });

        const mailOptions = {
            from: `"my app" <${process.env.MAIL_FROM}>`, // Sender address
            to: email, // List of receivers
            subject: 'Test Email', // Subject line
            text: 'This is a test email sent from Node.js', // Plain text body
            html: `<b>کد بازیابی رمز شما: ${code}</b>`, // HTML body
            headers: {
              "x-liara-tag": "test_email", // Tags 
            },
        };


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error occurred: ' + error.message);
            }
            console.log('Email sent: ' + info.response);
        });

    } catch (error) {
        next(error)
    }
}
// end of forget


// starting the question analys

const analyzeAnswers = (req, res) => {
    const { answers } = req.body; // Recive Array

    if (!answers || !Array.isArray(answers) || answers.length !== 10) {
        return res.status(400).send({
            message: "Invalid input. Please provide an array of 10 answers.",
        });
    }

    // Analys
    let frontEndScore = 0;
    let backEndScore = 0;
    let uiUxScore = 0;

    answers.forEach((answer, index) => {
        if (![1, 2, 3].includes(answer)) {
            return res.status(400).send({
                message: `Invalid answer at question ${index + 1}. Only 1, 2, or 3 are allowed.`,
            });
        }

        if (answer === 1) frontEndScore++;
        if (answer === 2) backEndScore++;
        if (answer === 3) uiUxScore++;
    });

    // Resault:
    let result = "";
    if (frontEndScore > backEndScore && frontEndScore > uiUxScore) {
        result = "Front-End Development";
    } else if (backEndScore > frontEndScore && backEndScore > uiUxScore) {
        result = "Back-End Development";
    } else if (uiUxScore > frontEndScore && uiUxScore > backEndScore) {
        result = "UI/UX Design";
    } else {
        result = "Mixed interests. You might enjoy exploring multiple fields!";
    }

    // send resault to user
    res.send({
        message: "Analysis Complete",
        data: {
            frontEndScore,
            backEndScore,
            uiUxScore,
            result,
        },
    });
};

// end of analys

module.exports = { register, login, forget, analyzeAnswers };
