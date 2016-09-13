var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

app.use(express.static(__dirname + "/client"));

io.on("connection", function(socket){
    console.log("Connected.");
    socket.on("disconnect", function(){
        console.log("Disconnected.");
    });
});

http.listen(8000, function(){
    console.log("Listening on port 8000...");
});

var portName = process.argv[2];
var port = new SerialPort(portName, {
    baudRate: 9600,
    parser: serialport.parsers.readline("\n")
});

port.on("data", function(data) {
    io.sockets.emit("reading", data);
});

port.on("error", function(error) {
    console.log(error);
    io.sockets.emit("error", error);
});