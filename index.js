const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require("mongoose");
var engine = require('ejs-locals');
const socketIO = require('socket.io');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.engine('ejs', engine);
app.set('view engine', 'ejs');

const http = require('http').Server(app);

const fileUpload = require('express-fileupload');
const cors = require('cors');

app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));

//connect mongodb

//localhost
// mongoose.connect('mongodb://localhost:27017/rssb_risk_management',
//     {
//         useCreateIndex: true,
//         useNewUrlParser: true
//     }
//     , function () {
//         console.log("App connected success")
//     });

mongoose.connect('mongodb://r_u_admin:r_u_admin123@ds119523.mlab.com:19523/heroku_hbp8gl8q',{
    useCreateIndex: true,
    useNewUrlParser: true
}, function (err) {
    console.log("App connected success")
});
mongoose.Promise = global.Promise;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

//initialise routes
app.use("/api", require("./controllers/LoginController"));
app.use("/api", require("./controllers/ForgotPasswordController"));
app.use("/api", require("./controllers/ClientsController"));
app.use("/api", require("./controllers/UsersController"));
app.use("/api", require("./controllers/DepartmentController"));
app.use("/api", require("./controllers/TasksController"));
app.use("/api", require("./controllers/MessageController"));
app.use("/api", require("./controllers/RiskController"));
app.use("/api", require("./controllers/AnalyticsController"));

//error handling
app.use(function (err, req, res, next) {
    res.status(400).json({
        status: err.message
    })
});

//port
app.set('port', Number(process.env.PORT || 5000));

const server = app.listen(app.get('port'), function () {
    console.log('Listening on ' + app.get('port'));
});

// socket connection
const io = socketIO(server);

io.on('connection', function(socket){
    console.log('a user connected', socket.id);

    socket.on("task", ()=>{
        io.sockets.emit("task");
    });

    socket.on("message", ()=>{
        socket.broadcast.emit("message");
    });

    socket.on("risk", ()=>{
        io.sockets.emit("risk");
    });

    socket.on("department", ()=>{
        io.sockets.emit("department");
    })
});