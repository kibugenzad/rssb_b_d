const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//import schema
const Users = require("../models/Accounts"),
    Clients = require("../models/Clients"),
    Departments = require("../models/Departments"),
    Risks = require("../models/Risks"),
    RiskControl = require("../models/RiskControl"),
    RisksPhaseTwo = require("../models/RisksPhaseTwo"),
    Tasks = require("../models/Tasks"),
    Accounts = require("../models/Accounts");

//all department
app.post("/getAllAnalytics", function (req, res, next) {
    var startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    var endDate = new Date(req.body.endDate).setHours(0, 0, 0, 0);

    Risks.find({
        date_created: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
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
});

//for department
app.post("/getAnalytics", function (req, res, next) {
    var startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    var endDate = new Date(req.body.endDate).setHours(0, 0, 0, 0);

    Risks.find({
        department: ObjectId(req.body.departID),
        date_created: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
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
});

//for department
app.post("/getRiskTaskAnalytics", function (req, res, next) {
    var startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    var endDate = new Date(req.body.endDate).setHours(0, 0, 0, 0);

    Risks.find({
        department: ObjectId(req.body.departID),
        task: ObjectId(req.body.taskId),
        date_created: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
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
});

module.exports = app;