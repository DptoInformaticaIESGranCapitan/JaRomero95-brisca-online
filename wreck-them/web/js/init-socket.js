var socket = io('http://localhost:3000');
socket.on('user', function (u) {

    // Si el jugador no tiene una partida, lo redirijo al inicio
    if(window.location.pathname == '/jugar'){
        if(!u.game)
            window.location = '/';
        // FIXME comprobar si la partida ha comenzado o redirigirlo al home si no es así
    }

    User = u; // la defino como global
    console.log(User);
});