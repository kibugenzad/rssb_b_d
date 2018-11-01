const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiskSchema = new Schema({
    risk:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Risks' }],
        required: [true, "Risk field is required"]
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

const Risks = mongoose.model("RiskControl", RiskSchema);

module.exports = Risks;

