const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiskPhaseTwoSchema = new Schema({
    client:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Clients' }],
        required: [true, "Please specify account client"]
    },
    department:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Departments' }],
        required: [true, "Department is missing"]
    },
    risk:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Risks' }],
        required: [true, "Risk is missing"]
    },
    control_pevent_risk_occurrance:{
        type: [{ type: Schema.Types.ObjectId, ref: 'RiskControls' }]
    },
    control_implemented:{
        type: String,
        required: [true, "Control Implemented field is required"]
    },
    control_effectiveness:{
        type: String,
        required: [true, "Control Effectiveness field is required"]
    },
    impact:{
        type: Number,
        required: [true, "Impact field is required"]
    },
    likehood:{
        type: Number,
        required: [true, "Likehood field is required"]
    },
    overall_status:{
        type: String,
        required: [true, "Overall risk rating field is required"]
    },
    comment:{
        type: String,
        required: [true, "Comment field is required"]
    },
    date_created: {
        type : Date,
        default: Date.now
    }
});

const Risks = mongoose.model("RiskPhaseTwo", RiskPhaseTwoSchema);

module.exports = Risks;

