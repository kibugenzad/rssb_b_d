const express = require("express");
const app = express();
const bcrypt = require('bcrypt'),SALT_WORK_FACTOR = 10;
const isEmpty = require('lodash/isEmpty');

//import schema
const Accounts = require("../models/Accounts");

//validate input
function validateInput(data){
    var errors = {};


    if(isEmpty(data.email_r)){
        errors.email_r = 'Email address or Username field is required'
    }
    if(data.email_r.length < 6){
        errors.email_r = 'Email address or Username is too short'
    }
    return {
        errors,
        isValid : isEmpty(errors)
    }
}

//search account
app.post("/searchAccount", function (req, res, next) {
    const {errors,isValid} = validateInput(req.body);
    if (!isValid){
        res.status(400).json(errors)
    }else{
        // fetch user
        Accounts.findOne({ $or: [{email: req.body.email_r}, {username: req.body.email_r}] }, function(err, user) {
            if (err) throw err;
            if (user !== null){
                return res.status(200).json({
                    success: false,
                    Data:user,
                    ErrorMessage:""
                });
            }else{
                return res.status(400).json({
                    success: false,
                    Data:[],
                    ErrorMessage:"Account does not exist"
                });
            }
        }).catch(next);
    }
});

//search old password
app.post("/searchOldPassword", function (req, res, next) {
    Accounts.findOne({$or: [{email: req.body.email_r}, {username: req.body.email_r}]}, function(err, user) {
        if (err) throw err;
        if (user !== null){
            bcrypt.compare(req.body.old_password, user.password, function(err, isMatch) {
                if (err){
                    return res.status(400).json({error: err})
                }
                if (isMatch){
                    return res.status(200).json({
                        success: isMatch,
                        Data: user,
                        ErrorMessage: ''
                    });
                }
                else{
                    return res.status(400).json({
                        success: isMatch,
                        Data: user,
                        ErrorMessage: 'Old password not found, try again'
                    });
                }
            });
        }else{
            return res.status(400).json({
                success: false,
                Data:[],
                ErrorMessage:"Account does not exist"
            });
        }
    }).catch(next);
});


//reset password password
app.post("/resetPasswordData", function (req, res, next) {
    //check account exist
    Accounts.findOne({$or: [{email: req.body.email_r}, {username: req.body.email_r}]}, function(err, user) {
        if (err) throw err;
        if (user !== null){
            //update password
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err) return next(err);

                // hash the password using our new salt
                bcrypt.hash(req.body.new_password, salt, function(err, hash) {
                    if (err) return next(err);
                    Accounts.findByIdAndUpdate({_id: user._id}, {
                        password: hash
                    }).then(account => {
                        Accounts.findOne({_id: user._id}).then(account => {
                            res.status(200).json({
                                ErrorMessage: '',
                                Success: true,
                                Data: account
                            });
                        })
                    })
                });
            });
        }else{
            return res.status(400).json({
                success: false,
                Data:[],
                ErrorMessage:"Account does not exist"
            });
        }
    }).catch(next);
});

module.exports = app;