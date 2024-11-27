const UserModel = require("../models/user-model");
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require ("bcrypt");
const nodemailer = require('nodemailer');
const db = require("../utilities/mysql_database");
const crypto = require("crypto");


//Registering...
const register = async (req, res, next) => {
    const { email, name, password } = req.body;

    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            "string.base": "Name must be a string.",
            "string.empty": "Name is required.",
            "string.min": "Name should have at least 3 characters.",
            "string.max": "Name should not exceed 50 characters.",
            "any.required": "Name is required."
        }),
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            "string.email": "Invalid email format.",
            "string.empty": "Email is required.",
            "any.required": "Email is required."
        }),
        password: Joi.string().min(3).max(50).required().messages({
            "string.base": "Password must be a string.",
            "string.empty": "Password is required.",
            "string.min": "Password should have at least 3 characters.",
            "string.max": "Password should not exceed 50 characters.",
            "any.required": "Password is required."
        })
    });

    const validateResult = schema.validate({ email, name, password }, { abortEarly: false });

    if (validateResult.error) {
        
        const errorDetails = validateResult.error.details.map(err => ({
            field: err.context.key,
            message: err.message
        }));

        
        return res.status(400).send({
            message: "Validation errors occurred.",
            errors: errorDetails
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    console.log({ email, name, password: hashPassword });

    const user = await UserModel.getUserByEmail(email);
    console.log(user);

    if (user) return res.status(400).send("User already exists");

    const result = await UserModel.insertUser(name, email, hashPassword);
    console.log(result);

    const newUser = await UserModel.getUserByEmail(req.body.email);

    res.send(_.pick(newUser, ["id", "name", "email"]));
};

//Register finished




//login

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

//end of login






//Questions
const analyzeAnswers = (req, res) => {
    const { answers } = req.body; // دریافت ورودی‌ها

    // بررسی ورودی‌ها
    if (!answers || !Array.isArray(answers) || answers.length !== 10) {
        return res.status(400).send({
            message: "Invalid input. Please provide an array of 10 answers.",
        });
    }

    // تحلیل ورودی‌ها
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

    // scores
    let result = "";
    let header = "";

    if (uiUxScore > frontEndScore && uiUxScore > backEndScore) {
        result = "به دنیای طراحی UI/UX خوش آمدید! اینجا جایی است که خلاقیت و درک نیازهای کاربران به هم می‌رسند تا تجربه‌های دیجیتال به‌یادماندنی خلق شود. طراحی UI/UX شامل ساخت رابط‌هایی است که هم جذاب و زیبا باشند و هم استفاده از آن‌ها آسان باشد. با تمرکز بر کاربر و جزئیات، می‌توانید محصولاتی بسازید که نیازهای واقعی کاربران را برآورده کنند. اگر به خلاقیت و همدلی علاقه دارید و می‌خواهید مشکلات را به راه‌حل‌های هوشمندانه تبدیل کنید، این مسیر پر از فرصت برای ساخت تجربه‌های بهتر است. آماده‌اید طراحی را شروع کنید؟ بیایید قدم برداریم!";
        header = "UI/UX طراحی"
    } else if (frontEndScore > backEndScore && frontEndScore > uiUxScore) {
        result = "به دنیای توسعه فرانت‌اند خوش آمدید! جایی که خلاقیت و ساختار در کنار هم قرار می‌گیرند و به شما امکان می‌دهند طراحی‌های بصری را زنده کنید و تجربیات وب تعاملی و کاربرپسند بسازید. با ابزارهایی مانند HTML، CSS و JavaScript، می‌توانید طرح‌بندی‌ها را شکل دهید، انیمیشن اضافه کنید و وب‌سایت‌هایی بسازید که استفاده از آن‌ها ساده و جذاب باشد. این یک مسیر شغلی پر از خلاقیت، حل مسئله و فرصتی برای خلق تجربیات دیجیتالی به‌یادماندنی است. آماده‌اید ایده‌ها را به واقعیت تبدیل کنید؟ شروع کنیم!";
        header = "توسعه فرانت‌اند"
    } else if (backEndScore > frontEndScore && backEndScore > uiUxScore) {
        result = "به دنیای توسعه بک‌اند خوش آمدید! اگر از حل مسائل منطقی و ساخت سیستم‌های کارآمد لذت می‌برید، این مسیر مناسب شماست. توسعه بک‌اند شامل مدیریت سرورها، پایگاه‌های داده و منطق پشت صحنه است که عملکرد نرم‌افزارها را ممکن می‌سازد. با مهارت‌هایی مانند کار با پایگاه‌ داده و برنامه‌نویسی سمت سرور، می‌توانید سیستم‌هایی بسازید که روان و قابل اعتماد کار کنند. این یک فرصت عالی برای کسانی است که به دنبال چالش‌های فنی و ساخت پایه‌های قوی برای اپلیکیشن‌ها هستند. آماده‌اید پشت صحنه تکنولوژی بدرخشید؟ شروع کنیم";
        header = "توسعه بک‌اند"
    } else {
        // olaviat bandy
        if (uiUxScore === frontEndScore && uiUxScore === backEndScore) {
            result = "به دنیای طراحی UI/UX خوش آمدید! اینجا جایی است که خلاقیت و درک نیازهای کاربران به هم می‌رسند تا تجربه‌های دیجیتال به‌یادماندنی خلق شود. طراحی UI/UX شامل ساخت رابط‌هایی است که هم جذاب و زیبا باشند و هم استفاده از آن‌ها آسان باشد. با تمرکز بر کاربر و جزئیات، می‌توانید محصولاتی بسازید که نیازهای واقعی کاربران را برآورده کنند. اگر به خلاقیت و همدلی علاقه دارید و می‌خواهید مشکلات را به راه‌حل‌های هوشمندانه تبدیل کنید، این مسیر پر از فرصت برای ساخت تجربه‌های بهتر است. آماده‌اید طراحی را شروع کنید؟ بیایید قدم برداریم!";
            header = "UI/UX طراحی"
        } else if (uiUxScore === frontEndScore && uiUxScore > backEndScore) {
            result = "به دنیای طراحی UI/UX خوش آمدید! اینجا جایی است که خلاقیت و درک نیازهای کاربران به هم می‌رسند تا تجربه‌های دیجیتال به‌یادماندنی خلق شود. طراحی UI/UX شامل ساخت رابط‌هایی است که هم جذاب و زیبا باشند و هم استفاده از آن‌ها آسان باشد. با تمرکز بر کاربر و جزئیات، می‌توانید محصولاتی بسازید که نیازهای واقعی کاربران را برآورده کنند. اگر به خلاقیت و همدلی علاقه دارید و می‌خواهید مشکلات را به راه‌حل‌های هوشمندانه تبدیل کنید، این مسیر پر از فرصت برای ساخت تجربه‌های بهتر است. آماده‌اید طراحی را شروع کنید؟ بیایید قدم برداریم!";
            header = "UI/UX طراحی"
        } else if (uiUxScore === backEndScore && uiUxScore > frontEndScore) {
            result = "به دنیای طراحی UI/UX خوش آمدید! اینجا جایی است که خلاقیت و درک نیازهای کاربران به هم می‌رسند تا تجربه‌های دیجیتال به‌یادماندنی خلق شود. طراحی UI/UX شامل ساخت رابط‌هایی است که هم جذاب و زیبا باشند و هم استفاده از آن‌ها آسان باشد. با تمرکز بر کاربر و جزئیات، می‌توانید محصولاتی بسازید که نیازهای واقعی کاربران را برآورده کنند. اگر به خلاقیت و همدلی علاقه دارید و می‌خواهید مشکلات را به راه‌حل‌های هوشمندانه تبدیل کنید، این مسیر پر از فرصت برای ساخت تجربه‌های بهتر است. آماده‌اید طراحی را شروع کنید؟ بیایید قدم برداریم!";
            header = "UI/UX طراحی"
        } else if (frontEndScore === backEndScore && frontEndScore > uiUxScore) {
            result = "به دنیای توسعه فرانت‌اند خوش آمدید! جایی که خلاقیت و ساختار در کنار هم قرار می‌گیرند و به شما امکان می‌دهند طراحی‌های بصری را زنده کنید و تجربیات وب تعاملی و کاربرپسند بسازید. با ابزارهایی مانند HTML، CSS و JavaScript، می‌توانید طرح‌بندی‌ها را شکل دهید، انیمیشن اضافه کنید و وب‌سایت‌هایی بسازید که استفاده از آن‌ها ساده و جذاب باشد. این یک مسیر شغلی پر از خلاقیت، حل مسئله و فرصتی برای خلق تجربیات دیجیتالی به‌یادماندنی است. آماده‌اید ایده‌ها را به واقعیت تبدیل کنید؟ شروع کنیم!";
            header = "توسعه فرانت‌اند"
        } else {
            result = "!!!";
        }
    }

    // send resault
    res.send({
        message: "Analysis Complete",
        data: {
          header,
          result,
        },
    });
};









//Forget Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // email validation
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
  });

  const { error } = schema.validate({ email });
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    // check database
    const [user] = await db.execute("SELECT id, email FROM persons WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(404).send({ message: "User with this email does not exist." });
    }

    // token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // expire
    await db.execute(
      "UPDATE persons SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [hashedToken, Date.now() + 3600000, email] // انقضا: 1 ساعت
    );

    res.send({
      message: "Password reset token generated successfully.",
      resetToken, 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "An error occurred while processing the request." });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(5).max(50).required(),
  });

  const { error } = schema.validate({ token, newPassword });
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const [user] = await db.execute("SELECT * FROM persons WHERE reset_token IS NOT NULL");
    if (
      user.length === 0 ||
      !(await bcrypt.compare(token, user[0].reset_token))
    ) {
      return res.status(400).send({ message: "Invalid or expired reset token." });
    }

    if (user[0].reset_token_expiry < Date.now()) {
      return res.status(400).send({ message: "Reset token has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE persons SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user[0].id]
    );

    res.send({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "An error occurred while resetting the password." });
  }
};


module.exports = { register, login, analyzeAnswers , forgotPassword, resetPassword, };