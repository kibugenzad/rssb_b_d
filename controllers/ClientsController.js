const express = require("express");
const app = express();
const isEmpty = require('lodash/isEmpty');

//import schema
const Clients = require("../models/Clients");

//validate input
function validateInput(data) {
    var errors = {};

    if (isEmpty(data.company)) {
        errors.company = 'Client company is required'
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

//create client account
app.post("/create_client", function (req, res, next) {
    const {errors, isValid} = validateInput(req.body);
    if (!isValid) {
        res.status(400).json(errors)
    } else {
        Clients.create({
            company: req.body.company,
        }).then(cl => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: cl
            })
        }).catch(next);
    }
});

app.get("/getClients", function (req, res, next) {
    Clients.find({})
        .sort({date_created: 'descending'})
        .then(cl => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: cl
            });
        }).catch(next);
});

app.get("/getClientByID", function (req, res, next) {
    Clients.findOne({_id: req.query.clientID})
        .then(cl => {
            res.status(200).json({
                ErrorMessage: '',
                Success: true,
                Data: cl
            });
        }).catch(next);
});

//update client account
app.put("/update_client/:clientID", function (req, res, next) {
    Clients.findOne({_id: req.params.clientID}).then(cl => {
        if (cl !== null) {
            //update client
            Clients.findByIdAndUpdate({_id: cl._id}, {
                company: req.body.company
            }).then(cl => {
                //fetch all client data
                Clients.findOne({_id: cl._id})
                    .then(cl => {
                        res.status(200).json({
                            ErrorMessage: '',
                            Success: true,
                            Data: cl
                        });
                    })
            })
        } else {
            res.status(400).json({
                ErrorMessage: 'Client account does not exist',
                Success: false,
            })
        }
    }).catch(next);
});

//delete client account
app.delete("/delete_client/:clientID", function (req, res, next) {
    Clients.findOne({_id: req.params.clientID}).then(cl => {
        if (cl !== null) {
            Clients.findByIdAndRemove({_id: cl._id}).then(cl => {
                res.status(200).json({
                    ErrorMessage: '',
                    Success: true
                });
            });
        } else {
            res.status(400).json({
                ErrorMessage: 'Client account does not exist',
                Success: false,
            })
        }
    }).catch(next);
});

module.exports = app;