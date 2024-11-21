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
        result = "Front-End Development" + "\n" + "به دنیای توسعه فرانت‌اند خوش آمدید! جایی که خلاقیت و ساختار در کنار هم قرار می‌گیرند و به شما امکان می‌دهند طراحی‌های بصری را زنده کنید و تجربیات وب تعاملی و کاربرپسند بسازید. با ابزارهایی مانند HTML، CSS و JavaScript، می‌توانید طرح‌بندی‌ها را شکل دهید، انیمیشن اضافه کنید و وب‌سایت‌هایی بسازید که استفاده از آن‌ها ساده و جذاب باشد. این یک مسیر شغلی پر از خلاقیت، حل مسئله و فرصتی برای خلق تجربیات دیجیتالی به‌یادماندنی است. آماده‌اید ایده‌ها را به واقعیت تبدیل کنید؟ شروع کنیم!";
    } else if (backEndScore > frontEndScore && backEndScore > uiUxScore) {
        result = "Back-End Development" + "\n" + "به دنیای توسعه بک‌اند خوش آمدید! اگر از حل مسائل منطقی و ساخت سیستم‌های کارآمد لذت می‌برید، این مسیر مناسب شماست. توسعه بک‌اند شامل مدیریت سرورها، پایگاه‌های داده و منطق پشت صحنه است که عملکرد نرم‌افزارها را ممکن می‌سازد. با مهارت‌هایی مانند کار با پایگاه‌ داده و برنامه‌نویسی سمت سرور، می‌توانید سیستم‌هایی بسازید که روان و قابل اعتماد کار کنند. این یک فرصت عالی برای کسانی است که به دنبال چالش‌های فنی و ساخت پایه‌های قوی برای اپلیکیشن‌ها هستند. آماده‌اید پشت صحنه تکنولوژی بدرخشید؟ شروع کنیم ";
    } else if (uiUxScore > frontEndScore && uiUxScore > backEndScore) {
        result = "UI/UX Design" + "\n" + " به دنیای طراحی UI/UX خوش آمدید! اینجا جایی است که خلاقیت و درک نیازهای کاربران به هم می‌رسند تا تجربه‌های دیجیتال به‌یادماندنی خلق شود. طراحی UI/UX شامل ساخت رابط‌هایی است که هم جذاب و زیبا باشند و هم استفاده از آن‌ها آسان باشد. با تمرکز بر کاربر و جزئیات، می‌توانید محصولاتی بسازید که نیازهای واقعی کاربران را برآورده کنند. اگر به خلاقیت و همدلی علاقه دارید و می‌خواهید مشکلات را به راه‌حل‌های هوشمندانه تبدیل کنید، این مسیر پر از فرصت برای ساخت تجربه‌های بهتر است. آماده‌اید طراحی را شروع کنید؟ بیایید قدم برداریم!";
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
