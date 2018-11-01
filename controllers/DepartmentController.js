const express = require("express");
const app = express();
const isEmpty = require('lodash/isEmpty');

//import schema
const Departments = require("../models/Departments");
const Clients = require("../models/Clients");

//validate input
function validateInput(data){
    var errors = {};

    if(isEmpty(data.depart_name)){
        errors.depart_name = 'Department name is required'
    }
    return {
        errors,
        isValid : isEmpty(errors)
    }
}

//create department
app.post("/create_department", function (req, res, next) {
    const {errors,isValid} = validateInput(req.body);
    if (!isValid){
        res.status(400).json(errors)
    }else {
        Departments.create({
            client: req.body.clientID,
            depart_name: req.body.depart_name,
        }).then(depart => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: depart
            })
        }).catch(next);
    }
});

app.get("/getDepartments", function (req, res, next) {
    Departments.find({}).then(depart => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: depart
        })
    }).catch(next);
});

app.post("/getMyDepartments", function (req, res, next) {
    var departs = [];
    for (var i=0; i< req.body.accountDepartments.length; i++){
        departs.push(req.body.accountDepartments[i]._id)
    }
    Departments.find({_id: {$in: departs}}).then(depart => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: depart
        })
    }).catch(next);
});

app.get("/departmentByID", function (req, res, next) {
    if (req.query.departmentID !== 'all'){
        Departments.findOne({
            _id: req.query.departmentID
        }).then(depart => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: depart
            })
        }).catch(next);
    }
});

app.delete("/delete_department/:id", function (req, res, next) {
    Departments.findByIdAndRemove({
        _id: req.params.id
    }).then(depart => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: []
        })
    }).catch(next);
});

module.exports = app;