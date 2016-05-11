var socket = io('http://localhost:3000');

socket.on('user', function (u) {
    User = u; // la defino como global
    console.log(User);
});