const express = require("express");
const app = express();
const validator = require("validator");
const isEmpty = require('lodash/isEmpty');
var nodemailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;
var templateDir = __dirname + '/userTemplate';

//import schema
const Accounts = require("../models/Accounts");
const Departments = require("../models/Departments");
const Clients = require("../models/Clients");

var sender = 'smtps://kibugenzad%40gmail.com';
var password = 'uwiteka123@';
var transporter = nodemailer.createTransport(sender + ':' + password + '@smtp.gmail.com');

var testMailTemplate = new EmailTemplate(templateDir);

//validate input
function validateInput(data){
    var errors = {};

    if(isEmpty(data.names)){
        errors.names = 'Your name is required'
    }

    if(isEmpty(data.email)){
        errors.email = 'Email address is required'
    }else if (!validator.isEmail(data.email)){
        errors.email = 'Invalid Email address'
    }

    if(isEmpty(data.username)){
        errors.username = 'Invalid username'
    }

    if(data.username.length < 6){
        errors.username = 'Username is too short'
    }

    if(data.password.length < 6) {
        errors.password = "Error: Password should have at least six characters!";
    }
    if(data.password === data.username) {//or username
        errors.password = "Error: Password should be different from the username!";
    }

    return {
        errors,
        isValid : isEmpty(errors)
    }
}

function sendEmail(to, subject, names, email, username, password) {

    var locals = {
        names: names,
        email: email,
        username: username,
        password: password,
    };

    testMailTemplate.render(locals, function (err, temp) {
        if (err) {
            console.log("error", err);

        } else {
            transporter.sendMail({
                from: 'contact@rssb.rw',
                to: to,
                subject: subject,
                text: temp.text,
                html: temp.html
            }, function (error, info) {
                if (error) {

                    console.log(error);
                }
                console.log('Message sent: ' + info.response);

            });
        }

    });
}

//create account
app.post("/create_account", function (req, res, next) {
    const {errors,isValid} = validateInput(req.body);
    if (!isValid){
        res.status(400).json(errors)
    }else {
        Accounts.create(req.body).then(account => {

            //send email
            //sendEmail(account.email, "Welcome to RSSB RISK PORTAL [Your credentials]", account.names, account.email, account.username, req.body.password);

            //send
            res.status(200).json({
                Success: true,
                ErrorMessage: '',
                Data: account
            });
        }).catch(next);

    }
});

//list all account
app.post("/getAccounts", function (req, res, next) {
    Accounts.find({client: req.body.clientID, departments: req.body.selectedDepartID})
        .sort({timestamps: 'descending'})
        .populate({path: 'client', model: Clients})
        .populate({path: 'departments', model: Departments})
        .then(account => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: account
        })
    }).catch(next);
});

//list account by id
app.get("/getAccountByID", function (req, res, next) {
    Accounts.findOne({_id: req.query.accountID})
        .populate({path: 'client', model: Clients})
        .populate({path: 'departments', model: Departments})
        .then(account => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: account
            })
        }).catch(next);
});

//update account
app.put("/update_account/:accountID", function (req, res, next) {
    var departments = JSON.parse(req.body.departments);
    Accounts.findByIdAndUpdate({_id: req.params.accountID},{
        names: req.body.names,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        departments: departments
    }).then(acc => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true
        })
    }).catch(next)
});

//delete account
app.delete("/delete_account/:accountID", function (req, res, next) {
    Accounts.findByIdAndRemove({_id: req.params.accountID}).then(acc => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true
        })
    })
});

module.exports = app;