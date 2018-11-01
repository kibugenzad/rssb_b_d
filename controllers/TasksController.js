const express = require("express");
const app = express();
const isEmpty = require('lodash/isEmpty');
const async = require('async');

//import schema
const Tasks = require("../models/Tasks");
const Departments = require("../models/Departments");
const Messages = require("../models/Messages");
const Accounts = require("../models/Accounts");

//validate input
function validateInput(data) {
    var errors = {};

    if (isEmpty(data.task)) {
        errors.task = 'Task is required'
    }
    if (!(new Date(data.startDate)).getTime() > 0) {
        errors.startDate = 'Starting Date is required'
    }
    if (!(new Date(data.endDate)).getTime() > 0) {
        errors.endDate = 'End Date is required'
    }

    if (data.priority == 'Select Priority') {
        errors.priority = 'Select Priority'
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

//create department
app.post("/create_task", function (req, res, next) {
    const {errors, isValid} = validateInput(req.body);
    if (!isValid) {
        res.status(400).json(errors)
    } else {
        Tasks.create({
            department: req.body.departID,
            task: req.body.task,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            priority: req.body.priority,
            status: req.body.status,
            message_count: 0,
            risk_count: 0,
            created_by: req.body.created_by
        }).then(task => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: task
            })
        }).catch(next);
    }
});

app.post("/getTaskByDateRange", function (req, res, next) {
    // startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    // endDate = new Date(req.body.endDate).setHours(0, 0, 0, 0);


    // startDate: {
    //     $gte: new Date(startDate)
    // },
    // endDate: {
    //     $lte: new Date(endDate)
    // }

    if (req.body.departID === 'all') {
        var departments = req.body.departments;
        var depart_ids = [];
        for (var i = 0; i < departments.length; i++) {
            depart_ids.push(departments[i]._id)
        }
        Tasks.find({department: {$in: depart_ids}})
            .sort({date_created: 'descending'})
            .populate({path: 'department', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .then(task => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: task
                })
            });
    } else {
        Tasks.find({department: req.body.departID})
            .sort({date_created: 'descending'})
            .populate({path: 'department', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .then(task => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: task
                });
            }).catch(next);
    }
});

app.get("/getTaskByID", function (req, res, next) {
    console.log(req.body)
    if (req.query.taskId === '') {
        res.status(400).json({
            ErrorMessage: "Task does not found",
            Success: false,
            data: []
        })
    } else {
        Tasks.find({
            _id: req.query.taskId,
        }).populate({path: 'department', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .then(task => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: task
                });
            }).catch(next);
    }
});

app.put("/changeTaskStatus/:id", function (req, res, next) {
    Tasks.findByIdAndUpdate({_id: req.params.id}, {
        status: req.body.status
    }).then(task => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: task
        });
    }).catch(next);
});

app.delete("/removeTask/:id", function (req, res, next) {
    Tasks.findByIdAndRemove({_id: req.params.id}, {
        status: req.body.status
    }).then(task => {
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: task
        });
    }).catch(next)
});

module.exports = app;