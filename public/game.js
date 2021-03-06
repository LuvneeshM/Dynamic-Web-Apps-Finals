var socket = io();

//controlls
var player_movement1 = {
  up: false,
  down: false,
  left: false,
  right: false
}
var player_movement2 = {
  up: false,
  down: false,
  left: false,
  right: false
}
var player_shooting1 = false
var player_shooting2 = false
document.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 65: // A
              player_movement1.left = true;
              break;
            case 87: // W
              player_movement1.up = true;
              break;
            case 68: // D
              player_movement1.right = true;
              break;
            case 83: // S
              player_movement1.down = true;
              break;
            //player 2
            case 37: // 
              player_movement2.left = true;
              break;
            case 38: // W
              player_movement2.up = true;
              break;
            case 39: // D
              player_movement2.right = true;
              break;
            case 40: // S
              player_movement2.down = true;
              break;
        }
    });
document.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case 65: // A
              player_movement1.left = false;
              break;
            case 87: // W
              player_movement1.up = false;
              break;
            case 68: // D
              player_movement1.right = false;
              break;
            case 83: // S
              player_movement1.down = false;
              break;
            case 32: //space
              player_shooting1 = true;
              break;
             //player 2
            case 37: // A
              player_movement2.left = false;
              break;
            case 38: // W
              player_movement2.up = false;
              break;
            case 39: // D
              player_movement2.right = false;
              break;
            case 40: // S
              player_movement2.down = false;
              break;
            case 17: //control
              player_shooting2 = true;
              break;
        }
        
});

//user connected, sending to server keyboard state 
socket.emit('new player');
//type of player
socket.on('pmove')
//sending the state of movement 30 times a second
setInterval(function() {
  socket.emit('movement', player_movement1, player_movement2);
}, 1000 / 30);
setInterval(function() {
    if(player_shooting1){
        socket.emit("shoot", 1)
        player_shooting1 = false
    }
    if(player_shooting2){
        socket.emit("shoot", 2)
        player_shooting2 = false
    }
}, 1000 / 30);

//draw player
function drawPlayer(context, player){
    var img = new Image();
    img.onload = function () {
        context.drawImage(img, player.x, player.y, player.w, player.h);
    }
    img.src = player.pDir
    //draw health bar
    context.fillStyle = "cyan"
    context.fillRect(player.x, player.y-player.h/2, player.w * player.health/player.mhealth, 10)
}

//get the board
var canvas = document.getElementById('canvas');
canvas.width = 1000;
canvas.height = 800;
var context = canvas.getContext('2d');
socket.on('state', function(players, bullets, hpacks) {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "green"
  context.fillRect(0,0,canvas.width,canvas.height)
  for (var id in players) {
    var player = players[id];
    if(player.health != 0){
        pleft = player.x 
        pright = player.x + player.w
        ptop = player.y
        pbot = player.y + player.h
        //check if collision with health packets
        for(var i = 0; i < hpacks.length; i++){
            var healthpack = hpacks[i]
            hleft = healthpack.x - healthpack.r
            hright = healthpack.x + healthpack.r
            htop = healthpack.y - healthpack.r
            hbot = healthpack.y + healthpack.r
            //left-rigth
            if((hleft > pleft && hleft < pright) || (hright < pright && hright > pleft)){
              //up-down
              if((htop > ptop && htop < pbot) || (hbot < pbot && hbot > ptop) || (htop > ptop && hbot < pbot) || (htop < ptop && hbot > pbot)){
                socket.emit("heal", player.pid)
                socket.emit("hdeath", i)
              }
            }
        }
        //check if collision with bullet
        for(var i = 0; i < bullets.length; i++){
            var bullet = bullets[i]
            if (bullet.bid != player.pid){

                bleft = bullet.x - bullet.r
                bright = bullet.x + bullet.r
                btop = bullet.y - bullet.r
                bbot = bullet.y + bullet.r

                //left-rigth
                if((bleft > pleft && bleft < pright) || (bright < pright && bright > pleft)){
                  //up-down
                  if((btop > ptop && btop < pbot) || (bbot < pbot && bbot > ptop)){
                    socket.emit("injure", player.pid)
                    if (player.health <= 0){
                      socket.emit("pdeath", player.pid)
                    }
                    socket.emit("bdeath", i)
                  }
                }
            }
        }
        //collision with wall
        //left
        if(pleft < 0){
            player.x = 0
        }
        //right
        if(pright > canvas.width){
            player.x = canvas.width - player.w
        }
        //top
        if (ptop < 0){
            player.y = 0
        }
        if (pbot > canvas.height){
            player.y = canvas.height - player.h
        }
        drawPlayer(context, player)  
    }
  }
  for(var i = 0; i < bullets.length; i++){
    var b = bullets[i]
    context.fillStyle = b.bcolor
    context.beginPath();
    context.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    context.fill();
  }
  for(var i = 0; i < hpacks.length; i++){
    var h = hpacks[i]
    context.fillStyle = "cyan"
    context.beginPath()
    context.arc(h.x, h.y, h.r, 0, 2 * Math.PI)
    context.fill()
  }
});