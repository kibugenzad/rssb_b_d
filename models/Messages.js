const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    client:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Clients' }],
        required: [true, "Please specify account client"]
    },
    department:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Departments' }],
        required: [true, "Department is missing"]
    },
    account:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Accounts' }],
        required: [true, "Account is missing"]
    },
    task:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Tasks' }],
        required: [true, "Task is missing"]
    },
    message:{
        type: String,
        required: [true, "Message field is required"]
    },
    status:{
        type: String,
        default:'unread'
    },
    date_created: {
        type : Date,
        default: Date.now
    }
});

const Messages = mongoose.model("Messages", MessageSchema);

module.exports = Messages

