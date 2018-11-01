const express = require("express");
const app = express();
const bcrypt = require('bcrypt'),SALT_WORK_FACTOR = 10;
const isEmpty = require('lodash/isEmpty');

//import schema
const Users = require("../models/Accounts"),
    Clients = require("../models/Clients"),
    Departments = require("../models/Departments");

//validate input
function validateInput(data){
    var errors = {};


    if(isEmpty(data.username)){
        errors.username = 'Invalid username'
    }
    if(data.username.length < 6){
        errors.username = 'Username is too short'
    }

    if(data.password.length < 6) {
        errors.password = "Error: Password should have at least six characters!";
    }
    if(data.password == data.username) {//or username
        errors.password = "Error: Password should be different from the email!";
    }
    let re = /[0-9]/;
    if(!re.test(data.password)) {
        errors.password = "Error: password should have at least one number (0-9)!";
    }
    re = /[a-z]/;
    if(!re.test(data.password)) {
        errors.password = "Error: password should have at least one lowercase letter (a-z)!";
    }
    return {
        errors,
        isValid : isEmpty(errors)
    }
}

//account login
app.post("/login", function (req, res, next) {
    const {errors,isValid} = validateInput(req.body);
    if (!isValid){
        res.status(400).json(errors)
    }else{
        // fetch user and test password verification
        Users.findOne({$or: [{email: req.body.username}, {username: req.body.username}]}, function(err, user) {
            if (err) throw err;
            if (user !== null){
                bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
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
                            ErrorMessage: 'Login failed, try again'
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
        }).populate({path: 'client', model: Clients}).populate({path: 'departments', model: Departments}).catch(next);
    }
});

module.exports = app;