const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require('bcrypt'),SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
    client:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Clients' }],
        required: [true, "Please specify account client"]
    },
    departments:{
        type: [{ type: Schema.Types.ObjectId, ref: 'Departments' }]
    },
    permissions:{
        type: Array,
        required:[true]
    },
    names:{
        type: String,
        required: [true, "Please specify your names"]
    },
    email:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Email address is required"],
        validate: [validator.isEmail, "Please fill a valid email address"]
    },
    username:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Username is required"]
    },
    phone_number:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Username is required"]
    },
    password:{
        type: String,
        unique: true,
        required: [true, "Please enter password"]
    },
    profile_image:{
        type: String
    },
    timestamps: {
        type : Date,
        default: Date.now
    }
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

const User = mongoose.model("Accounts", UserSchema);

module.exports = User

