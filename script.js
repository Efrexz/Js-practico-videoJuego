//bases //
/*game.fillRect(100,0,100,100);
game.clearRect(80,0,50,60);
game.clearRect(170,0,50,60);
game.fillStyle = "purple";
game.font = "20px verdana";/*Esta propiedad siempre tiene que incluir el tamaño en px y su fuente para que funcione
game.textAlign = "end";
game.fillText("Pito",170, 50);

Afecta el orden en que los coloques , si desea que el fill sea purple tienes que mover la linea de game.fillStyle = "purple"; antes que llamen a fillReact primero se dan los valores y luego se dibuja igual que el texto. primero das los valores para que lo tome luego al momento de dibujarlo*/

//iNICIO EL PROYECTO//

const canvas = document.querySelector("#game");
const btnUp =document.querySelector("#up");
const btnLeft =document.querySelector("#left");
const btnRight =document.querySelector("#right");
const btnDown =document.querySelector("#down");
const game = canvas.getContext("2d");
const spanLives = document.querySelector("#vidas");
const spanTime = document.querySelector("#tiempo");
const spanRecord = document.querySelector("#record");
const pResult = document.querySelector("#resultado");
const btnReinicio = document.querySelector(".reiniciar");

window.addEventListener("load",setCanvasSize);
window.addEventListener("resize",renderMap);/*Este evento hace que cada vez que se adapte nuestro html por ejemplo con la consola se ejecute la funcion*/
btnReinicio.addEventListener("click", reiniciarMapa);


let canvasSize;
let iconSize;
let bombas = [];
let renderBombas =false;
let level = 0;
let lives = 3;
let tiempoDeInicio;
let tiempoTranscurrido;
let record;


const positionPlayer ={
    x: undefined,
    y: undefined
};

const giftPosition = {
    x: undefined,
    y: undefined
}



function renderMap(){
    
    game.font = iconSize + "px verdana";
    game.textAlign = "end";
    
    showRecord();
    /*Seleccionamos el nivel del mapa ingresado en nuestros maps.js*/
    let map = maps[level];
    /*Cuando ya no tengamos mas mapas que generar devolvera que ganaste el juego*/
    if(!map){
        return winGame();
    }
    /*El metodo .trim() elimina los espacios tanto al incio como al final del string y el .split() hace que separe strings en arrays cada vez que se encuentre con el elemento que le mandamos como argumento (el \n significa cada salto de linea*/
    let mapRows = map.trim().split("\n");
    
    /*Como mapRows nos devuelve los arrays pero algunos contienen espacios. entonces  generamos un nuevo array con el metodo map y que devuelva los mismos arrays sin esos espacios. Aplicando el metodo .trim() y luego convertimos cada caracter del array en un elemento del array para poder recorrerlo lo cual lo hacemso con el metodo.split pero enviando un argumento vacio ""*/
    let mapRowsCols = mapRows.map(row => row.trim().split(""))

    if(!tiempoDeInicio){
        tiempoDeInicio = Date.now();
        showTime();
    }
    /*Aca limpiamos el mapa para poder mover nuestro personaje y luego generamos otrra vez el mapa con la posicion de nuestro personaje en otro lado*/
    game.clearRect(0,0,canvasSize,canvasSize);
    showLives();
    
    /*este for lo realizamos para dibujar 10 veces nuestros iconos en el canvas*/
    
    /*Por cada array ingresamos a cada elemento que este contiene y ese elemento lo enviamos al objeto emojis para poder acceder al icono correspondiente, luego multiplicamos el tamaño que ocupa por el index de cada elemento */
    
    mapRowsCols.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            let emoji = emojis[col];
            let posX = iconSize * (colIndex+ 1);
            let posY = iconSize * (rowIndex + 1);

            game.fillText(emoji, posX , posY );
            /*Ahora si la posicion de nuestro personaje es undefined se renderiza donde esta la puerta*/
            if(col == 'O' && !positionPlayer.x && !positionPlayer.y){
                positionPlayer.x = posX;
                positionPlayer.y = posY;
                game.fillText(emojis["PLAYER"], positionPlayer.x  , positionPlayer.y );
            }else if(col == "I"){
                giftPosition.x = posX;
                giftPosition.y = posY;
            }else if(col == "X" && !renderBombas){
                bombas.push({
                    x: posX,
                    y: posY
                })
            }
        })
    });
    
    renderBombas = true;
    moverPlayer()

    /* Esta es una forma mas larga de hacerlo :
    
    for(let row = 1; row <= 10; row ++){
        for(let col = 1; col <= 10; col ++){
            /* llamamos al objeto emoji y decirle que agarre al elemento que concuerde con esas dos ubicaciones. ingresamos al objeto emojis[mapRowsCols][0][0] que seria en este caso = emojis["I"], el mapRowsCols[row -1][col -1] el -1 es porque empieza a partir de la posicion 0
            game.fillText(emojis[mapRowsCols[row -1][col -1]], iconSize * col, iconSize * row);
        }
    }*/
    
}

function setCanvasSize(){
    
    
    /*La propiedad window.innerWidth y window.Heigth es el espacio que realmente tenemos en nuestra pagina, en caso de que la consola este abierta etc*/
    
    /* para poder asegurar que siempre tengamos un cuadrado usamos esta condicional asi midan siempre el width y el height lo mismo*/
    
    if(window.innerWidth < window.innerHeight){
        canvasSize = window.innerWidth * 0.8; /*Se multiplica por 0.8 ya que el window.innerwidth es toda la pantalla entonces en este caso lo colocamos para que ocupe el 80 % de la pantalla*/
    }
    else{
        canvasSize = window.innerHeight * 0.8;
    }
    /*Luego de acuerdo al resultado del condicional modificamos el ancho y largo de nuevos canvas modificandole sus atributos*/
    canvas.setAttribute("Width", Math.floor(canvasSize));
    canvas.setAttribute("Height",  Math.floor(canvasSize));
    
    iconSize = Math.floor((canvasSize / 10)*0.97);/*Esto lo hacemos ya que deseamos que entren 10 iconos en nuestro canvas osea cada icono ocuparia el 10 % del canvas le agrego el math.floor para poder quitarle tanto decimal y evitar errores*/

    renderMap()
}

function moverPlayer(){
    if(Math.floor(positionPlayer.x) == Math.floor(giftPosition.x) && Math.floor(positionPlayer.y) == Math.floor(giftPosition.y)){
    levelUp();
    }
    else{
        game.fillText(emojis["PLAYER"], positionPlayer.x,positionPlayer.y);
    }   

    let enemyColission = bombas.find(function(element){
        let colisionX =  Math.floor(element.x) == Math.floor(positionPlayer.x);
        let colisionY =  Math.floor(element.y) == Math.floor(positionPlayer.y);
        return colisionX && colisionY
    })
    if(enemyColission){
        /*Aca le agrego el emoji de explosion y luego de un segundo vuelvo a generar el mapa para que por lo menos se vea el efecto jeje*/
        game.fillText(emojis["BOOM"], positionPlayer.x , positionPlayer.y);
        setTimeout(() => {
        levelLost();
        }, 100);
}};
    ;

    /*En esta funcion vuelvo la posicion del jugador a undefined para que pueda ser generado en la puerta, aumento el nivel para pasar al siguiente, las bombas las vacio para limpiar las coordenadas y vuelvo false el renderbombas para poder volver a generar las coordenadas del nuevo nivel*/
function levelUp(){
        positionPlayer.x = undefined;
        positionPlayer.y = undefined;
        level++;
        renderBombas = false;
        bombas = [];
        renderMap();
}

function reiniciarMapa(){
    level = 0;
    renderBombas = false;
    bombas = [];
    lives = 3;
    tiempoDeInicio = undefined;
    positionPlayer.x = undefined;
    positionPlayer.y = undefined;
    renderMap();
}
function levelLost(){
    lives--;
    if(lives <= 0){
        reiniciarMapa();
    }
    positionPlayer.x = undefined;
    positionPlayer.y = undefined;
    renderMap();
}
function winGame(){
    clearInterval(tiempoTranscurrido);
    let playerTime = Date.now() - tiempoDeInicio;
    if(record){
        if(record >= playerTime){
            record = localStorage.setItem("recordTime" , playerTime);
            pResult.innerHTML = "Felicidades superaste tu record";
        }else{
            pResult.innerHTML = "No superaste tu record. Intenta de nuevo";
        }
    }else{
        record = localStorage.setItem("recordTime" , playerTime);
    }
    setTimeout(()=> {reiniciarMapa();
    showRecord()}, 5000);
}

function showLives() {
    spanLives.innerHTML = emojis["HEART"].repeat(lives)
  };

  function showTime(){
    /*Date.now devuelve la hora actual en formatos de milisegundo, setinterval ejecuta una funcion cada cierto tiempo que le indiquemos*/
    tiempoTranscurrido = setInterval(() => {
        spanTime.innerHTML = (Date.now() - tiempoDeInicio);
    }, 100);
  };

  /*Con esta funcion mostramos el record desde que se inicial pagina*/
  function showRecord(){
    record = localStorage.getItem("recordTime");
    if(record){
        spanRecord.innerHTML = record;
    }else{
        spanRecord.innerHTML = "Todavia no tienes registro de tiempo jugado"
    }
  }




btnUp.addEventListener("click", moveUp);
btnLeft.addEventListener("click", moveLeft);
btnRight.addEventListener("click", moveRight);
btnDown.addEventListener("click", moveDown);
document.addEventListener("keydown", moveByKeys);


function moveByKeys(event) {
    if (event.key == 'ArrowUp') moveUp();
    else if (event.key == 'ArrowLeft') moveLeft();
    else if (event.key == 'ArrowRight') moveRight();
    else if (event.key == 'ArrowDown') moveDown();
  }

function moveUp(){
    if((positionPlayer.y - iconSize) < iconSize) {
        console.log("Estas saliendo del mapa")
    }else{
        positionPlayer.y -= iconSize;
        /*Cada vez que presione la tecla recarga el mapa nuevamente y envia a nuestro jugador en otra posicion*/
        renderMap();
    }
};
function moveLeft(){
    if((positionPlayer.x - iconSize) < iconSize) {
        console.log("Estas saliendo del mapa")
    }else{
        positionPlayer.x -= iconSize;
        renderMap();
    }
};
function moveRight(){
    if((positionPlayer.x + iconSize) > canvasSize) {
        console.log("Estas saliendo del mapa")
    }else{
        positionPlayer.x += iconSize;
        renderMap();
    }
};
function moveDown(){
    if((positionPlayer.y + iconSize) > canvasSize) {
        console.log("Estas saliendo del mapa")
    }else{
        positionPlayer.y += iconSize;
        renderMap();
    }
};
