const express = require("express");
const app = express();
const isEmpty = require('lodash/isEmpty');
const async = require("async");
const moment = require("moment");

//import schema
const Clients = require("../models/Clients");
const Departments = require("../models/Departments");
const Tasks = require("../models/Tasks");
const Messages = require("../models/Messages");
const Accounts = require("../models/Accounts");
var nodemailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;
var templateDir = __dirname + '/MessageTemplate';
var sender = 'smtps://kibugenzad%40gmail.com';
var password = 'uwiteka123@';
var transporter = nodemailer.createTransport(sender + ':' + password + '@smtp.gmail.com');
var testMailTemplate = new EmailTemplate(templateDir);
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//validate input
function validateInput(data) {
    var errors = {};

    if (isEmpty(data.message)) {
        errors.message = 'Message is required'
    }

    if (isEmpty(data.clientId)) {
        errors.clientId = 'Client is missing'
    }
    if (isEmpty(data.departmentId)) {
        errors.departmentId = 'Department is missing'
    }
    if (isEmpty(data.taskId)) {
        errors.taskId = 'Task is missing'
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

function sendEmail(to, subject, name, department, topic, messages, date_created, clientID, topicID, pageName) {

    var locals = {
        names: name,
        topic: topic,
        messages: messages,
        department,
        date_created,
        clientID,
        topicID,
        pageName
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

//create client account
app.post("/create_message", function (req, res, next) {
    const {errors, isValid} = validateInput(req.body);
    if (!isValid) {
        res.status(400).json(errors)
    } else {
        async.waterfall([
            function (next) {
                Messages.create({
                    client: req.body.clientId,
                    department: req.body.departmentId,
                    task: req.body.taskId,
                    account: req.body.userId,
                    message: req.body.message
                }).then(message => {
                    next(null, message);
                })
            },
            function (message, next) {
                //increment message count
                Tasks.findByIdAndUpdate(
                    {_id: req.body.taskId},
                    { $inc: { message_count: 1 } }
                ).then(task => {
                    Tasks.findOne({_id: req.body.taskId}).then(task => {
                        next(null, {message, task});
                    })
                });
            },function (results, next) {
                var task = results.task;
                var message = results.message;

                Accounts.find({departments: req.body.departmentId}).populate({path: 'departments', model: Departments}).then(user => {
                    for (var i in user){
                        //sendEmail(user[i].email, "New Message from "+user[i].departments[0].depart_name, user[i].names,user[i].departments[0].depart_name,task.task, req.body.message, moment(message.date_created).format("lll"), user[i].client, task._id, 'tasks');
                    }
                    next(null, {message, task});
                });
            }
        ], function (err, data) {
            if (err){
                //send response
                res.status(400).json({
                    ErrorMessage: 'Create message error:'+err,
                    Success: false,
                    Data: []
                })
            }else{
                //send response
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: data.message
                })
            }
        });
    }
});

app.post("/getMessagesByTask", function (req, res, next) {
    if (req.body.taskId === 'all'){
        console.log(req.body)
        Messages.find({department: {$in: req.body.accountDepartments}}).populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'account', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(message => {
                //     var departs = [];
                //     for (var i =0; i < req.body.accountDepartments.length; i++){
                //         departs.push(req.body.accountDepartments[i])
                //     }
                //     Messages.updateMany({department: {$nin: departs}}, {$set: {status: "read"}}, {multi: true}).then(message => {
                //         Messages.find({task: req.body.taskId}).populate({path: 'client', model: Clients})
                //             .populate({path: 'department', model: Departments})
                //             .populate({path: 'account', model: Accounts})
                //             .populate({path: 'task', model: Tasks})
                //             .then(message => {
                //
                //             }).catch(next);
                //     })
                //
                // }).catch(next);
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: message
                });
            });
    }else{
        Messages.find({task: req.body.taskId}).populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'account', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(message => {
                var departs = [];
                for (var i =0; i < req.body.accountDepartments.length; i++){
                    departs.push(req.body.accountDepartments[i])
                }
                Messages.updateMany({department: {$nin: departs}}, {$set: {status: "read"}}, {multi: true}).then(message => {
                    Messages.find({task: req.body.taskId}).populate({path: 'client', model: Clients})
                        .populate({path: 'department', model: Departments})
                        .populate({path: 'account', model: Accounts})
                        .populate({path: 'task', model: Tasks})
                        .then(message => {
                            res.status(200).json({
                                ErrorMessage: '',
                                Success: true,
                                Data: message
                            });
                        }).catch(next);
                })

            }).catch(next);
    }
});

app.post("/getMessagesByRisk", function (req, res, next) {
    Messages.find({task: req.body.riskId}).populate({path: 'client', model: Clients})
        .populate({path: 'department', model: Departments})
        .populate({path: 'account', model: Accounts})
        .then(message => {
            var departs = [];
            for (var i =0; i < req.body.accountDepartments.length; i++){
                departs.push(req.body.accountDepartments[i])
            }
            Messages.updateMany({department: {$nin: departs}}, {$set: {status: "read"}}, {multi: true}).then(message => {
                Messages.find({task: req.body.riskId}).populate({path: 'client', model: Clients})
                    .populate({path: 'department', model: Departments})
                    .populate({path: 'account', model: Accounts})
                    .then(message => {
                        res.status(200).json({
                            ErrorMessage: '',
                            Success: true,
                            Data: message
                        });
                    }).catch(next);
            })

        }).catch(next);
});

app.get("/getMessagesByID", function (req, res, next) {
    Messages.find({_id: req.query.id,}).populate({path: 'client', model: Clients})
        .populate({path: 'department', model: Departments})
        .populate({path: 'account', model: Accounts})
        .populate({path: 'task', model: Tasks})
        .then(message => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: message
            });
        }).catch(next);
});

app.post("/getMessagesByDepart", function (req, res, next) {
    Messages.find({department: {$in: req.body.acc_departs}}).populate({path: 'client', model: Clients})
        .populate({path: 'department', model: Departments})
        .populate({path: 'account', model: Accounts})
        .populate({path: 'task', model: Tasks})
        .then(message => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: message
            });
        }).catch(next);
});

app.post("/getAllMessages", function (req, res, next) {
    if (req.body.selectedDepartID ==='all'){
        var departments = req.body.departments;
        var depart_ids = [];
        for (var i = 0; i < departments.length; i++) {
            depart_ids.push(ObjectId(departments[i]._id));
        }
        Messages.aggregate([
            {
                $match:{client: ObjectId(req.body.clientID),department: {$in: depart_ids}}
            },
            {
                "$group": {
                    "_id": "$task",
                    account : { $first: '$account' },
                    message : { $first: '$message' },
                    task : { $first: '$task' },
                    status : { $first: '$status' },
                    department : { $first: '$department' },
                    date_created : { $first: '$date_created' },
                    "count": { "$sum": 1 }
                }
            }
        ]).then(message =>{
            Messages.populate(message, [{path: 'department'},{path: 'account'},{path: 'task', model: Tasks}], function(err, message) {
               res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: message
                });
            });
        }).catch(next)
        // Messages.find({
        //     client: req.body.clientId,
        //     department: {$in: depart_ids},
        // }).populate({path: 'client', model: Clients})
        //     .populate({path: 'department', model: Departments})
        //     .populate({path: 'account', model: Accounts})
        //     .populate({path: 'task', model: Tasks})
        //     .sort({date_created: 'descending'})
        //     .then(message => {
        //         res.status(200).json({
        //             ErrorMessage: '',
        //             Success: true,
        //             Data: message
        //         });
        //     }).catch(next);
    }else{
        Messages.aggregate([
            {
                $match:{client: ObjectId(req.body.clientID),department: ObjectId(req.body.selectedDepartID)}
            },
            {
                "$group": {
                    "_id": "$task",
                    account : { $first: '$account' },
                    message : { $first: '$message' },
                    task : { $first: '$task' },
                    status : { $first: '$status' },
                    department : { $first: '$department' },
                    date_created : { $first: '$date_created' },
                    "count": { "$sum": 1 }
                }
            }
        ]).then(message =>{
            Messages.populate(message, [{path: 'department'},{path: 'account'},{path: 'task', model: Tasks}], function(err, message) {
                // Your populated translactions are inside populatedTransactions
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: message
                });
            });
        }).catch(next)
    }
});

app.get("/getMessagesByUser", function (req, res, next) {
    Messages.find({
        account: req.query.userId,
        department: req.query.departmentId,
        task: req.query.taskId,
    }).populate({path: 'client', model: Clients})
        .populate({path: 'department', model: Departments})
        .populate({path: 'account', model: Accounts})
        .populate({path: 'task', model: Tasks})
        .then(message => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: message
            });
        }).catch(next);
});

//update client account
app.put("/update_message/:messageId", function (req, res, next) {
    Messages.findOne({_id: req.params.messageId}).then(cl => {
        if (cl !== null) {
            //update message
            Messages.findByIdAndUpdate({_id: cl._id}, {
                message: req.body.message
            }).then(cl => {
                //fetch data
                Messages.find({
                    client: req.query.clientId,
                    department: req.query.departmentId
                }).populate({path: 'client', model: Clients})
                    .populate({path: 'department', model: Departments})
                    .populate({path: 'task', model: Tasks})
                    .then(message => {
                        res.status(200).json({
                            ErrorMessage: '',
                            Success: true,
                            Data: message
                        });
                    }).catch(next);
            })
        } else {
            res.status(400).json({
                ErrorMessage: 'Message does not exist',
                Success: false,
            })
        }
    }).catch(next);
});

//delete client account
app.delete("/delete_message/:messageId", function (req, res, next) {
    async.waterfall([
        function (next) {
            Messages.findByIdAndRemove({_id: req.params.messageId}).then(cl => {
                next(null, cl);
            });
        },
        function (message, next) {
            Messages.findOne({_id: req.params.messageId}).then(cl => {
                if (cl !== null) {
                    //decrement message count
                    Tasks.findByIdAndUpdate(
                        {_id: req.body.taskId},
                        { $inc: { message_count: -1 } }
                    ).then(task => {
                        Tasks.findOne({_id: req.body.taskId}).then(task => {
                            next(null, {message, task});
                        })
                    });
                } else {
                    next(null, {
                        ErrorMessage: 'Message does not exist',
                        Success: false,
                    })
                }
            });
        }
    ], function (err, data) {
        if (err){
            //send response
            res.status(400).json({
                ErrorMessage: 'Delete message error:'+err,
                Success: false,
                Data: []
            })
        }else{
            //send response
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: data.message
            })
        }
    });
});

module.exports = app;