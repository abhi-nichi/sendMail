var express = require('express');  // importing express module(middleware)
var app = express();
var mongojs = require('mongojs');
var db = mongojs('Email', ['emailDetails']);  // Email and emailDetails are db and collection respectively
var bodyParser = require('body-parser');
var cron = require('node-cron');
var nodemailer = require('nodemailer');
app.use(express.static("public"));
app.use(bodyParser.json());

app.use(function (req, res, next) {  //  enabling cors in server side
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});



app.post('/createEmail', function (req, res) {   // api request to create and send email

  let mailOptions = {
    from: req.body.emailSender,
    to: req.body.emailReceiver,
    subject: req.body.emailSubject,
    text: req.body.emailText
  };

  let transporter = nodemailer.createTransport({   // mailtrap service configuration
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e3a6793632bee0",
      pass: "b858b6a03acc89"
    }
  });

  // * * * * *  indicates running a task every minute
  cron.schedule('* * * * *', () => {    // cron job(task scheduler) in pure JavaScript for node
    transporter.sendMail(mailOptions, function (error, info) {  // function  to send email
      if (error) {
        console.log(error);
      } else {
        db.emailDetails.insertOne({
          "emailSender": req.body.emailSender, "emailReceiver": req.body.emailReceiver, "emailSubject": req.body.emailSubject, "emailText": req.body.emailText,
        }, function (err, doc) {
          if (err) {

            res.status('401').json({ "err": err });
          }
          else {

            // send response to client-side
            res.status('200').json({ "success": "Email created successfully", "data": doc });
          }

        })
        // email successfully sent and check in mailtrp
        console.log('Email sent: ' + info.response);
      }
    });
  }).start();
});



app.get('/getAllEmail', function (req, res) {   // Read all email 
  db.emailDetails.find({}, function (err, doc) {
    if (err) {

      res.status('401').json({ "err": err });
    }
    else {

      res.status('200').json({ "success": "All Email Listed successfully", "data": doc });
    }

  })

})

app.delete('/deleteEmail', function (req, res)  //  Delete selected email using mongodb Object id
{
  var id = req.body.id;
  console.log(id);
  db.emailDetails.remove({ _id: mongojs.ObjectId(id) }, function (err, docs) {
    if (err) {

      res.status('401').json({ "err": err });
    }
    else {

      res.status('200').json({ "success": "selected Email deleted successfully", "data": docs });
    }

  })
})


app.put('/updateEmail', function (req, res) {  //  Update selected email using mongodb Object id
  db.emailDetails.update({ _id: mongojs.ObjectId(req.body._id) }, { $set: { "emailSubject": req.body.emailSubject, "emailText": req.body.emailText } }, function (err, doc) {
    if (err) {

      res.status('401').json({ "err": err });
    }
    else {

      res.status('200').json({ "success": "selected Email updated successfully", "data": docs });
    }

  });
})


var port = 9000;
app.listen(port);
console.log("server running on " + port);