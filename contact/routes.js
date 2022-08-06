const router = require('express').Router();
var nodemailer = require('nodemailer');

const { email, emailpassword } = process.env

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtp.gmail.com",
    auth: {
          user: `${email}`,
          pass: `${emailpassword}`,
      },
  secure: true,
});


router.get('/',  
  (req, res, next)=>{
    res.render("contact")
});

router.post('/',
  (req, res, next)=>{
    const {subject, text, senderEmail, senderFirstName, senderLastName} = req.body;

    const mailData = {
      from: 'emma9wise@gmail.com',  // sender address
        to: 'emma9wise@gmail.com',   // list of receivers
        subject: subject,
        html: `<p> ${text} <br /> sent from ${senderFirstName} ${senderLastName} at ${senderEmail} via Note Taking Application</p>`,
      };

    transporter.sendMail(mailData, (error, info)=>{
      if (error) {
        return console.log(error);
      }
      res.redirect(303, `/contact`)
    })
});

module.exports = router