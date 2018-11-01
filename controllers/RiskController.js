const express = require("express");
const app = express();
const isEmpty = require('lodash/isEmpty');
const async = require("async");
const fs = require("fs");
const csv = require("fast-csv");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//import schema
const Clients = require("../models/Clients");
const Departments = require("../models/Departments");
const Tasks = require("../models/Tasks");
const Accounts = require("../models/Accounts");
const RiskControl = require("../models/RiskControl");
const Risks = require("../models/Risks");
const RisksPhaseTwo = require("../models/RisksPhaseTwo");

//email
var nodemailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;
var templateDir = __dirname + '/RiskTemplate';
var sender = 'smtps://kibugenzad%40gmail.com';
var password = 'uwiteka123@';
var transporter = nodemailer.createTransport(sender + ':' + password + '@smtp.gmail.com');
var testMailTemplate = new EmailTemplate(templateDir);

//validate input
function validateRiskInput(data) {
    var errors = {};

    if (isEmpty(data.client)) {
        errors.client = 'Client is missing'
    }
    if (isEmpty(data.department)) {
        errors.department = 'Department is missing'
    }
    if (isEmpty(data.risk)) {
        errors.risk = 'Risk field is required'
    }
    if (isEmpty(data.risk_owner)) {
        errors.risk_owner = 'Risk owner field is required'
    }
    if (isEmpty(data.root_cause)) {
        errors.root_cause = 'Root cause field is required'
    }
    if (isEmpty(data.qualitative_consequance_risk)) {
        errors.qualitative_consequance_risk = 'Qualitative Consequences of Risk field is required'
    }
    if (isEmpty(data.quantitative_consequance_risk)) {
        errors.quantitative_consequance_risk = 'Quantitative Consequences of Risk field is required'
    }
    if (data.impact === 0) {
        errors.impact = 'Impact field is required'
    }
    if (data.likehood === 0) {
        errors.likehood = 'Likehood field is required'
    }
    if (isEmpty(data.controllable)) {
        errors.controllable = 'Controllable field is required'
    }
    if (isEmpty(data.overall_risk_rating)) {
        errors.overall_risk_rating = 'Overall risk rating field is required'
    }
    if (isEmpty(data.control_pevent_risk_occurrance)) {
        errors.control_pevent_risk_occurrance = 'Control to prevent risk occurrence field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

function sendEmail(to, subject, name, department, task, clientID, topicID, pageName) {

    var locals = {
        names: name,
        task,
        department,
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

function validateRiskPhaseTwoInput(data) {
    var errors = {};

    if (isEmpty(data.client)) {
        errors.client = 'Client is missing'
    }
    if (isEmpty(data.department)) {
        errors.departID = 'Department is missing'
    }
    if (isEmpty(data.riskId)) {
        errors.risk = 'Risk is missing'
    }
    if (isEmpty(data.control_implemented)) {
        errors.risk_owner = 'Risk Implemented field is required'
    }
    if (isEmpty(data.control_effectiveness)) {
        errors.control_effectiveness = 'Control Effectiveness field is required'
    }
    if (data.impact === 0) {
        errors.impact = 'Impact field is required'
    }
    if (data.likehood === 0) {
        errors.likehood = 'Likehood field is required'
    }
    if (isEmpty(data.overall_status)) {
        errors.overall_status = 'Overall status field is required'
    }
    if (isEmpty(data.comment)) {
        errors.comment = 'Comment field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

//create risk phase one
app.post("/create_risk", function (req, res, next) {
    const {errors, isValid} = validateRiskInput(req.body);
    if (!isValid) {
        res.status(400).json(errors)
    } else {
        async.waterfall([
            function (next) {
                Risks.findOne({reference_no: req.body.reference_no}).then(r => {
                    next(null, r)
                });
            },
            function (results, next) {
                if (results === null) {
                    Risks.create(req.body).then(r => {
                        RiskControl.create({
                            risk: r._id,
                            control_pevent_risk_occurrance: r.control_pevent_risk_occurrance
                        }).then(c => {
                            next(null, {status: "added"});
                        });
                    });
                } else {
                    next(null, {status: "exist"});
                }
            },function (results, next) {
                var task = results.task;
                var status = results.status;

                Accounts.find({departments: req.body.department}).populate({path: 'departments', model: Departments}).then(user => {
                    for (var i in user){
                        //sendEmail(user[i].email, "New Risk from attachment", user[i].names, user[i].departments[0].depart_name,task.task, user[i].client, task._id, 'risks');
                    }
                    next(null, {status, task});
                });
            }
        ], function (err, data) {
            if (err) {
                //send response
                res.status(400).json({
                    ErrorMessage: 'Create risk error:' + err,
                    Success: false,
                    Data: []
                });
            } else if (data.status === 'exist') {
                //send response
                res.status(400).json({
                    ErrorMessage: 'Risk is exist',
                    Success: false,
                    Data: []
                })
            } else if (data.status === 'added') {
                //send response
                res.status(200).json({
                    ErrorMessage: 'Risk added success',
                    Success: true,
                    Data: []
                });
            }
        });
    }
});

//create risk phase two
app.post("/create_risk_phase_two", function (req, res, next) {
    const {errors, isValid} = validateRiskPhaseTwoInput(req.body);
    if (!isValid) {
        res.status(400).json(errors);
    } else {
        RisksPhaseTwo.create(req.body).then(data => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: data
            });
        }).catch(next);
    }
});

app.post("/getRiskByDate", function (req, res, next) {
    // var startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    // var endDate = new Date(req.body.endDate).setHours(0, 0, 0, 0);

    // date_created: {
    //     $gte: new Date(startDate),
    //         $lte: new Date(endDate)
    // }

    if (req.body.departID === 'all') {

        var departments = req.body.departments;
        var depart_ids = [];
        for (var i = 0; i < departments.length; i++) {
            depart_ids.push(departments[i]._id)
        }
        Risks.find({
            department: {$in: depart_ids}
        })
            .sort({date_created: 'descending'})
            .populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'risk_owner', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(risk => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: risk
                })
            });
    } else {
        Risks.find({
            department: req.body.departID
        }).sort({date_created: 'descending'})
            .populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'risk_owner', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(risk => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: risk
                });
            }).catch(next);
    }
});

app.post("/getRiskByTask", function (req, res, next) {
    // var startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    // var endDate = new Date(req.body.endDate).setHours(0, 0, 0, 0);
    // date_created: {
    //     $gte: new Date(startDate),
    //         $lte: new Date(endDate)
    // }
    if (req.body.departID === 'all' && req.body.taskId  !== "") {

        var departments = req.body.departments;
        var depart_ids = [];
        for (var i = 0; i < departments.length; i++) {
            depart_ids.push(departments[i]._id)
        }
        Risks.find({
            department: {$in: depart_ids},
            task: req.body.taskId
        })
            .sort({date_created: 'descending'})
            .populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'risk_owner', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(risk => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: risk
                })
            });
    }else if (req.body.departID === 'all' && req.body.taskId  === "") {

        var departments = req.body.departments;
        var depart_ids = [];
        for (var i = 0; i < departments.length; i++) {
            depart_ids.push(departments[i]._id)
        }
        Risks.find({
            department: {$in: depart_ids}
        })
            .sort({date_created: 'descending'})
            .populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'risk_owner', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(risk => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: risk
                })
            });
    }else if (req.body.taskId  !== ""){
        Risks.find({
            department: req.body.departID,
            task: req.body.taskId
        }).sort({date_created: 'descending'})
            .populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'risk_owner', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(risk => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: risk
                });
            }).catch(next);
    }
    else {
        Risks.find({
            department: req.body.departID
        }).sort({date_created: 'descending'})
            .populate({path: 'client', model: Clients})
            .populate({path: 'department', model: Departments})
            .populate({path: 'risk_owner', model: Departments})
            .populate({path: 'created_by', model: Accounts})
            .populate({path: 'task', model: Tasks})
            .then(risk => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true,
                    Data: risk
                });
            }).catch(next);
    }
});

app.post("/getRiskById", function (req, res, next) {
    async.waterfall([
        function (next) {
            Risks.find({_id: req.body.id}).sort({date_created: 'descending'})
                .populate({path: 'client', model: Clients})
                .populate({path: 'department', model: Departments})
                .populate({path: 'risk_owner', model: Departments})
                .populate({path: 'created_by', model: Accounts})
                .populate({path: 'task', model: Tasks})
                .then(risk => {
                    next(null, risk);
                });
        }, function (results, next) {
            RiskControl.find({risk: req.body.id}).then(risk_control => {
                next(null, {results, risk_control});
            });
        }, function (data, next) {
            RisksPhaseTwo.find({risk: req.body.id}).then(risk_phase_two => {
                next(null, {results: data.results, risk_control: data.risk_control, risk_phase_two});
            });
        }
    ], function (err, data) {
        var risks = data.results;
        var risk_control = data.risk_control;
        var risk_phase_two = data.risk_phase_two;
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: risks,
            RiskControl: risk_control,
            RiskPhaseTwo: risk_phase_two,
        });
    });
});

app.get("/getRiskPhaseTwo", function (req, res, next) {
    RisksPhaseTwo.find({
        risk: req.query.id
    }).sort({date_created: 'descending'})
        .populate({path: 'client', model: Clients})
        .populate({path: 'department', model: Departments})
        .populate({path: 'risk', model: Risks})
        .then(risk => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: risk
            });
        }).catch(next);
});

app.get("/getRiskPhaseTwoByControlID", function (req, res, next) {
    RisksPhaseTwo.find({
        $or: [{risk: req.query.id, control_pevent_risk_occurrance: req.query.id}]
    }).sort({date_created: 'descending'})
        .populate({path: 'client', model: Clients})
        .populate({path: 'department', model: Departments})
        .populate({path: 'risk', model: Risks})
        .then(risk => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: risk
            });
        }).catch(next);
});

//update risk phase one
app.put("/updateRisk/:id", function (req, res, next) {
    Risks.findByIdAndUpdate({_id: req.params.id}, req.body).then(r => {
        Risks.findOne({_id: r._id}).then(r => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: r
            });
        })
    })
});

//update risk phase two
app.get("/updateRiskPhaseTwo", function (req, res, next) {

});

//delete risk phase one and phase two
app.delete("/delete_risk/:riskId/:taskId", function (req, res, next) {
    async.waterfall([
        function (next) {
            Risks.findByIdAndRemove({_id: req.params.riskId}).then(cl => {
                next(null, cl);
            });
        },
        function (cl, next) {
            RisksPhaseTwo.findByIdAndRemove({_id: req.params.riskId}).then(cl => {
                next(null, cl);
            });
        },
        function (results, next) {
            //decrement risk count
            Tasks.findByIdAndUpdate(
                {_id: req.params.taskId},
                {$inc: {risk_count: -1}}
            ).then(task => {
                next(null, {status: 'removed'});
            });
        }
    ], function (err, data) {
        if (err) {
            //send response
            res.status(400).json({
                ErrorMessage: 'Delete message error:' + err,
                Success: false,
                Data: []
            })
        } else if (data.status === 'notexist') {
            //send response
            res.status(400).json({
                ErrorMessage: 'Risk does not exist',
                Success: true,
                Data: data.message
            })
        } else if (data.status === 'removed') {
            //send response
            res.status(200).json({
                ErrorMessage: 'Risk removed success',
                Success: true,
                Data: []
            });
        }
    });
});

//new control
app.put("/createRiskControl/:riskId", function (req, res, next) {
    RiskControl.create({
        risk: req.params.riskId,
        control_pevent_risk_occurrance: req.body.control_pevent_risk_occurrance
    }).then(risk => {
        //send response
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: risk
        })
    });
});

//control by risk
app.get("/getControlByRisk", function (req, res, next) {
    RiskControl.find({risk: req.query.id}).then(risk => {
        //send response
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: risk
        })
    });
});

//delete risk control
app.delete("/delete_risk_control/:id", function (req, res, next) {
    RiskControl.findByIdAndRemove({_id: req.params.id}).then(c => {
        //send response
        res.status(200).json({
            ErrorMessage: '',
            Success: true,
            Data: c
        })
    }).catch(next);
});

//generate report
app.post("/generateExcel", function (req, res, next) {
    if (req.body.departID === 'all'){
        var departments = req.body.departments;
        var depart_ids = [];
        for (var i = 0; i < departments.length; i++) {
            depart_ids.push(ObjectId(departments[i]._id))
        }
        Tasks.aggregate([
            {
                $match: {
                    department: {"$in": depart_ids}
                }
            },
            {
                $lookup: {
                    from: "risks",
                    localField: "_id",
                    foreignField: "task",
                    as: "risksData"
                },
            },
            {$unwind: '$risksData'},
            {
                $lookup: {
                    from: "riskcontrols",
                    localField: "risksData._id",
                    foreignField: "risk",
                    as: "risksData.riskControls"
                },
            },
            {
                $lookup: {
                    from: "riskphasetwos",
                    localField: "risksData.riskControls.risk",
                    foreignField: "risk",
                    as: "risksData.riskControls.riskPhaseTwo"
                },
            },
            {$sort: {date_created: -1}},
            {
                $project: {
                    risksData: 1
                }
            }
        ]).then(data => {
            console.log(data)
            // var stream = fs.createWriteStream(`${__dirname}/../public/reports/Risk-report${new Date}.csv`);
            // csv.write([
            //     ["a1", "b1"],
            //     ["a2", "b2"],
            //     ["a3", "b3"],
            // ]);
            var riskData = [];

            for (var i = 0; i < data.length; i++) {
                riskData.push(data[i].risksData)
            }
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: riskData
            })
        });
    }else{
        Tasks.aggregate([
            {
                $match: {
                    department: ObjectId(req.body.departID)
                }
            },
            {
                $lookup: {
                    from: "risks",
                    localField: "_id",
                    foreignField: "task",
                    as: "risksData"
                },
            },
            {$unwind: '$risksData'},
            {
                $lookup: {
                    from: "riskcontrols",
                    localField: "risksData._id",
                    foreignField: "risk",
                    as: "risksData.riskControls"
                },
            },
            {
                $lookup: {
                    from: "riskphasetwos",
                    localField: "risksData.riskControls.risk",
                    foreignField: "risk",
                    as: "risksData.riskControls.riskPhaseTwo"
                },
            },
            {$sort: {date_created: -1}},
            {
                $project: {
                    risksData: 1
                }
            }
        ]).then(data => {
            console.log(data)
            // var stream = fs.createWriteStream(`${__dirname}/../public/reports/Risk-report${new Date}.csv`);
            // csv.write([
            //     ["a1", "b1"],
            //     ["a2", "b2"],
            //     ["a3", "b3"],
            // ]);
            var riskData = [];

            for (var i = 0; i < data.length; i++) {
                riskData.push(data[i].risksData)
            }
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: riskData
            })
        });
    }
});

module.exports = app;