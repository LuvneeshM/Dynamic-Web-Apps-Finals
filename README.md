# Dynamic-Web-Apps-Finals
This is my final project for Dynamic Web Applications. I build a tanker shooter 2-player endless mode game. It is endless mode because as I one player loses another player can connect and fight the winner. Once both players connect, the first player uses the WASD keys to move and space to shoot. The second player uses the Arrow keys to move and control button to shoot.

## Dependencies
 - express: 4.16.4 or higher
 - socket.io: 2.2.0 or higher

## Instructions to install dependencies
 - npm install express
 - npm install socket.io

## Instructions to begin playing

 - Run the command: node server.js
 - Once the server is started open 2 new chrome tab to [http://localhost:3000](http://localhost:3000/). The first player is the player on the left and the second player is the player on the right. When the first player dies, reconnect by refreshing the first tab. When the second player dies, reconnect by refreshing the second tab. 