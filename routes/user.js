    import express from "express";
    import {
    createUser,
    getUserByEmail,
    getUserById,
    updatePassword,
    updateRandomstringById,
    updateUserRandomstring,
    } from "../services/userdb.js";
    import bcrypt, { compare } from "bcrypt";
    import jwt from "jsonwebtoken";
    import nodemailer from "nodemailer";

    const route = express.Router();

    // Nodemailer email authentication
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
    });
   

    // Details of data to be sent in verification email
    const mailData = {
    from: process.env.EMAIL,
    subject: "Reset your password",
    };

    // Details of data to be sent in verification email
    const mailDataActivate = {
    from: process.env.EMAIL,
    subject: "Activate your account",
    };

    // Message to be sent in the verification email
    let mailMessage = (url) => {
    return `<p>Hi there,<br> You have been requested to reset your password.<br>please click on the link below to reset the password.<br><a href='${url}' target='_blank'>${url}</a><br>Thank you...</p>`;
    };

    // Message to be sent in the verification email while registration
    let mailMessageActivate = (url) => {
    return `<p>Hi there,<br> You have been registered in our website.<br>please click on the link below to activate your account.<br><a href='${url}' target='_blank'>${url}</a><br />If not registered by you do not click this link.<br>Thank you...</p>`;
    };

    async function generateHashedPassword(password) {
    const NO_OF_ROUNDS = 10;
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
    }

    //register user
    route.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    const userInfo = await getUserByEmail(email);

    if (userInfo) {
        res.status(400).send({ msg: "user already exist" });
    } else if (password.length < 8) {
        res.status(400).send({ msg: "please enter password at least 8 character" });
    } else {
        const hashedPassword = await generateHashedPassword(password);
        const data = {
        username: username,
        email: email,
        password: hashedPassword,
        };
        const result = await createUser(data);

        res.send({ msg: "created successfully Login to contiue", result });
    }
    });

    //login user
    route.post("/login", async (req, res) => {
    const { username, email, password } = req.body;
    const userInfo = await getUserByEmail(email);
    if (!userInfo) {
        res.status(401).send({ msg: "Invalid details" });
    } else {
        let existPassword = userInfo.password;
        let compare = await bcrypt.compare(password, existPassword);
        if (compare) {
        // const token=jwt.sign({id:userInfo._id},process.env.SECREATE_KEY)
        res.send({ msg: "user logged in successfully" });
        } else {
        res.status(401).send({ msg: "Invalid details" });
        }
    }
    });

    // This end-point helps the user to generate verification mail to reset the password
    route.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    let random_string = Math.random().toString(36).substring(5).toUpperCase();
    const user = await getUserByEmail(email);
    if (user) {

        const hashvalue=await generateHashedPassword(random_string)
    
        const data = {
        email: email,
        random_string: hashvalue,
        };
        let updaterInfo = await updateUserRandomstring(data);

        let pwResetUrl = `${process.env.PWRESETURL}?id=${user._id}&rps=${hashvalue}`;
        mailData.to = req.body.email;
        mailData.html = mailMessage(pwResetUrl);
        await transporter.sendMail(mailData);
        res.status(200).send({ message: "Password reset link sent to email" });
    } else {
        res.status(403).send({ message: "user is not registered" });
    }
    });

    // This end-point helps to verify the randomly generated string used for changing the password

    route.post("/verify-random-string", async (req, res) => {
    let { id, verificationString } = req.body;
    const user = await getUserById(id);
    let unicodeString = verificationString;
    verificationString =  decodeURIComponent(JSON.parse('"' + unicodeString.replace(/\"/g, '\\"') + '"'));
   
    if (user) {
        if (user.random_string == verificationString) {
        res.send({ code: "verified" ,msg:"verification string done"});
        } else {
        res.status(403).send({ code: "verification string not valid" });
        }
    } else {
        res.status(403).json({ message: "user doesn't exist" });
    }
    });

    // This end-point helps to set a new password only if the conditions are met
    route.put('/reset-password',async(req,res)=>{
        let {id,verificationString,password}=req.body;
        const user = await getUserById(id);
      
        let unicodeString = verificationString
        verificationString = decodeURIComponent(JSON.parse('"' + unicodeString.replace(/\"/g, '\\"') + '"'));
       
        if(user.random_string == verificationString){

            let hashvalue=await generateHashedPassword(password);
            let random_strings = Math.random().toString(36).substring(5).toUpperCase();
            let random_stringupdate=await updateRandomstringById({id:id,random_string: random_strings})
            let updatepassword=await updatePassword({id: id,password: hashvalue});
            res.send({msg:"password changed successfully"})
        }else {
            res.status(403).send({ msg: "user with the id not found" });
          }
    })
    

    export default route;
