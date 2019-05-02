var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app)
var io = socketIO(server);

port = 3000

p1 = true
p2 = true

function Player(id, pN){
    this.moveX = function(value){
        this.x += value
        this.dirX = value/(Math.abs(value))
        this.dirY = 0
    }
    this.moveY = function(value){
        this.y += value
        this.dirY = value/(Math.abs(value))
        this.dirX = 0
    }

    this.setPlayerColor = function(){
        var letters = "0123456789ABCDEF"
        var color = '#'
        for (var i = 0; i < 6; i++) 
            color += letters[(Math.floor(Math.random() * letters.length))]; 
        return color
    }

    this.pN = pN
    this.pid = id
    if(this.pN == 1){
        this.x = Math.floor(Math.random() * 100 + 100)
        this.pDir = "p1/up.png"
    }
    else{
        this.x = Math.floor(Math.random() * 200 + 400)
        this.pDir = "p2/up.png"
    }
    this.y = 300
    this.dirX = 0
    this.dirY = -1
    this.health = 3
    this.w = 50
    this.h = 50
    this.pcolor = this.setPlayerColor()
}

function Bullet(x,y,dirX,dirY,bid,pr, bcolor){
    this.moveX = function(value){
        this.x += value
        // this.dirX = value/(Math.abs(value))
    }
    this.moveY = function(value){
        this.y += value
        // this.dirY = value/(Math. abs(value))
    }

    this.bid = bid
    this.dirX = dirX
    this.dirY = dirY
    this.r = 5
    this.x = (x+pr*this.dirX)
    this.y = (y+pr*this.dirY)
    this.bcolor = bcolor
    this.life = 2
}

app.use(express.static(path.join(__dirname, "public")));

//routing
app.get("", function(req, res){
    res.sendFile(__dirname+'/index.html')
})

var players = {}
var sockets = []
var bullets = []
//communcations
io.on('connection', function(socket){
    //new player
    socket.on('new player', function(){
        if(p1){
            players[socket.id] = new Player(socket.id, 1)
            p1 = false
            // io.sockets.emit("pmove", 1)
            sockets.push(socket.id)
        } else if (p2){
            players[socket.id] = new Player(socket.id, 2)
            p2 = false
            // io.sockets.emit("pmove", 2)
            sockets.push(socket.id)
        }
    })
    //movement
    socket.on('movement', function(p1d, p2d) {
        for(var i = 0; i < sockets.length; i++){
            var player = players[sockets[i]];
            if(player.pN == 1){
                if (p1d.left) {
                    player.moveX(-5);
                    player.pDir = "p1/left.png"
                }
                else if (p1d.up) {
                    player.moveY(-5);
                    player.pDir = "p1/up.png"
                }
                else if (p1d.right) {
                    player.moveX(5);
                    player.pDir = "p1/right.png"
                }
                else if (p1d.down) {
                    player.moveY(5);
                    player.pDir = "p1/down.png"
                }
            }
            else if (player.pN == 2){
                if (p2d.left) {
                    player.moveX(-5);
                    player.pDir = "p2/left.png"
                }
                else if (p2d.up) {
                    player.moveY(-5);
                    player.pDir = "p2/up.png"
                }
                else if (p2d.right) {
                    player.moveX(5);
                    player.pDir = "p2/right.png"
                }
                else if (p2d.down) {
                    player.moveY(5);
                    player.pDir = "p2/down.png"
                }
            }
        }
    });
    //shooting
    socket.on('shoot', function(pN){
        for(var i = 0; i < sockets.length; i++){
            var player = players[sockets[i]]
            if(pN == player.pN){
                bullets.push(new Bullet(player.x+player.w/2, player.y+player.w/2, player.dirX, player.dirY, player.pid, player.w, player.pcolor))
                break
            }
        }       
    })
    socket.on("injure", function(pid) {
        if(players[pid]){
            players[pid].health -= 1
        }
    })
    //death
    socket.on("pdeath", function(pid){
        if(players[pid]){
            if(players[pid].pN == 1){
                p1 = true
            } else if (players[pid].pN == 2){
                p2 = true
            }
            sockets.splice( sockets.indexOf(pid), 1 )
            delete players[pid]
        }
    })
    socket.on("bdeath", function(pos){
        bullets.splice(pos,1)
    })
    //disconnect
    socket.on('disconnect', function(){
        if(players[socket.id]){
            if(players[socket.id].pN == 1){
                p1 = true
            } else if (players[socket.id].pN == 2){
                p2 = true
            }
            sockets.splice( sockets.indexOf(socket.id), 1 )
            delete players[socket.id]
        }
    })
})

//update the bullets and move them
setInterval(function(){
    for(var i = 0; i < bullets.length; i++){
        var b = bullets[i]
        b.moveX(b.dirX*6)
        b.moveY(b.dirY*6)
    }
}, 1000 / 60)
setInterval(function(){
    for(var i = 0; i < bullets.length; i++){
        var b = bullets[i]
        b.life -= 1
        if(b.life == 0){
            bullets.splice(i, 1)
        }
    }
}, 1000)
//think of this as the draw function
setInterval(function() {
  io.sockets.emit('state', players, bullets);
}, 1000 / 60);

server.listen(port, function(){
  console.log('listening on *:'+port);
});