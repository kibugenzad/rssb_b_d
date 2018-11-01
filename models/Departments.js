const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
    client:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Clients' }],
        required: [true, "Please specify account client"]
    },
    depart_name:{
        type: String,
        required: [true, "Please specify department name"]
    },
    timestamps: {
        type : Date,
        default: Date.now
    }
});

const department = mongoose.model("Departments", DepartmentSchema);

module.exports = department

