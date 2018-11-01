const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TasksSchema = new Schema({
    department:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Departments' }],
        required: [true, "Please specify department"]
    },
    task:{
        type: String,
        required: [true, "Task field is required"]
    },
    startDate:{
        type: Date,
        required: [true, "Please specify start date"]
    },
    endDate:{
        type: Date,
        required: [true, "Please specify end date"]
    },
    priority:{
        type: String,
        required: [true, "Please specify priority"]
    },
    status:{
        type: String,
        required: [true, "Please specify status"],
        default:"In Progress"
    },
    message_count: {
        type: Number,
        default:0
    },
    risk_count: {
        type: Number,
        default:0
    },
    created_by: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Accounts' }],
        required: [true, "Please specify account"],
    },
    date_created: {
        type : Date,
        default: Date.now
    }
});

const Tasks = mongoose.model("Tasks", TasksSchema);

module.exports = Tasks

