const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiskSchema = new Schema({
    client:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Clients' }],
        required: [true, "Please specify account client"]
    },
    department:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Departments' }],
        required: [true, "Department is missing"]
    },
    task:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Tasks' }]
    },
    created_by:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Accounts' }],
        required: [true, "User created risk is missing"]
    },
    reference_no:{
        type: String,
        required: [true, "Reference field is required"]
    },
    risk:{
        type: String,
        required: [true, "Risk field is required"]
    },
    risk_owner:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Departments' }],
        required: [true, "Risk owner is missing"]
    },
    root_cause:{
        type: String,
        required: [true, "Root cause is required"]
    },
    qualitative_consequance_risk:{
        type: String,
        required: [true, "Qualitative Consequences of Risk field is required"]
    },
    quantitative_consequance_risk:{
        type: String,
        required: [true, "Quantitative Consequences of Risk field is required"]
    },
    impact:{
        type: Number,
        required: [true, "Impact field is required"]
    },
    likehood:{
        type: Number,
        required: [true, "Likehood field is required"]
    },
    overall_risk_rating:{
        type: String,
        required: [true, "Overall risk rating field is required"]
    },
    controllable:{
        type: String,
        required: [true, "Controllable field is required"]
    },
    control_pevent_risk_occurrance:{
        type: String,
        required: [true, "Control to prevent risk occurrence field is required"]
    },
    date_created: {
        type : Date,
        default: Date.now
    }
});

const Risks = mongoose.model("Risks", RiskSchema);

module.exports = Risks;

