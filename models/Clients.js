const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    company:{
        type: String,
        required: [true, "Please specify company name"]
    },
    date_created: {
        type : Date,
        default: Date.now
    }
});

const Client = mongoose.model("Clients", ClientSchema);

module.exports = Client

