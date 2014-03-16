var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')

app.listen(2345);

function handler (req, res) {
    if(req.url=='/index.html' || req.url=='/') {
        fs.readFile('./index.html',function(err,data){
            res.end(data);
        });
    } else {
        fs.readFile('./'+req.url,function(err,data){
            res.end(data);
        });
    }
}

var clientArray = {};
var remoteArray = {};

io.sockets.on('connection', function (socket) {
    var ip = socket.handshake.address.address;
    var port = socket.handshake.address.port;
    socket.emit('hello-s');
    var socketType = '';
    var remoteID = null;
    var resLock = false;
    {//设备识别
        socket.on('im-client-c',function(){
            clientArray[ip+"/"+port] = {};
            clientArray[ip+"/"+port].type = true;
            clientArray[ip+"/"+port].socket = socket;
            socketType = 'client';
        });
        socket.on('im-remote-c',function(data){
            remoteArray[data.id] = {};
            remoteArray[data.id].type = true;
            remoteArray[data.id].socket = socket;
            remoteID = data.id;
            socketType = 'remote';
        });
    }
    var fix = function(func){
        if( resLock == false ){
            resLock = true;
            func();
            setTimeout(function(){
                resLock = false;
            },500);
        }
    }

    socket.on('send-order-c',function(data){
        if( remoteArray[data.id] && remoteArray[data.id].type == true){
            remoteArray[data.id].socket.emit('send-order-s',data);
            remoteArray[data.id].socket.on('result-c',function(data){
                fix(function(){
                    console.log('===RES===');
                    socket.emit('result-s',data);
                });
            });
            remoteArray[data.id].socket.on('error-c',function(err){
                fix(function(){
                    socket.emit('error-s',err);
                });
            });
        }else{
            console.log('cannot find id');
            socket.emit('result-s','cannot find id');
        }
    });

    socket.on('disconnect',function(){
        if( socketType == 'client' ){
            delete clientArray[ip+"/"+port];
        }else if( socketType == 'remote' ){
            delete remoteArray[remoteID];
        }
    });


    
});