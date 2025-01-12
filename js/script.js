function addNotification(message) {
    const notificationsContainer = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.classList.add('notification-message');
    notification.innerText = message;
    notificationsContainer.appendChild(notification);

    // Eliminar la notificación después de 5 segundos
    setTimeout(() => {
        notificationsContainer.removeChild(notification);
    }, 7000);
}


// Configuración del laberinto
const mazeWidth = 20;  // Ancho del laberinto
const mazeHeight = 20; // Alto del laberinto

// Crear la matriz inicial del laberinto (todas son paredes)
let maze = Array(mazeHeight).fill(null).map(() => Array(mazeWidth).fill('wall'));

// Estructura para almacenar las celdas adyacentes
let walls = [];

// Función para agregar una pared si no está duplicada
function addWall(x, y) {
    if (x >= 0 && y >= 0 && x < mazeWidth && y < mazeHeight && maze[y][x] === 'wall') {
        walls.push([x, y]);
    }
}

// Función para generar el laberinto utilizando el algoritmo de Prim
function generateMaze(x, y) {
    maze[y][x] = 'path';  // Marcar la celda de inicio como camino

    // Agregar las celdas adyacentes a la lista de paredes
    addWall(x + 1, y);
    addWall(x - 1, y);
    addWall(x, y + 1);
    addWall(x, y - 1);

    // Mientras haya paredes para procesar
    while (walls.length > 0) {
        // Seleccionar una pared aleatoria
        const [px, py] = walls.splice(Math.floor(Math.random() * walls.length), 1)[0];

        // Comprobar cuántas celdas adyacentes son caminos
        let neighbors = 0;
        if (px + 1 >= 0 && px + 1 < mazeWidth && maze[py][px + 1] === 'path') neighbors++;
        if (px - 1 >= 0 && px - 1 < mazeWidth && maze[py][px - 1] === 'path') neighbors++;
        if (py + 1 >= 0 && py + 1 < mazeHeight && maze[py + 1][px] === 'path') neighbors++;
        if (py - 1 >= 0 && py - 1 < mazeHeight && maze[py - 1][px] === 'path') neighbors++;

        // Si tiene exactamente una celda vecina que es camino, hacerla un camino
        if (neighbors === 1) {
            maze[py][px] = 'path';

            // Agregar las celdas adyacentes de la nueva celda de camino a la lista de paredes
            addWall(px + 1, py);
            addWall(px - 1, py);
            addWall(px, py + 1);
            addWall(px, py - 1);
        }
    }
}

function addRivers() {
    const riverCount = Math.floor((mazeWidth * mazeHeight) * 0.1); // 10% de celdas serán ríos
    for (let i = 0; i < riverCount; i++) {
        const x = Math.floor(Math.random() * mazeWidth);
        const y = Math.floor(Math.random() * mazeHeight);
        if (maze[y][x] === 'path') maze[y][x] = 'river';
    }
}

// Llamar a la función después de generar el laberinto
generateMaze(0, 0);
addRivers();

// Asegurarse de que la celda de inicio y fin no sean muros
maze[1][1] = 'path'; // Inicio en (1, 1)
maze[mazeHeight - 2][mazeWidth - 2] = 'path'; // Meta en la esquina inferior derecha

// Función para renderizar el laberinto en el DOM
function renderMaze() {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.style.gridTemplateColumns = `repeat(${mazeWidth}, 1fr)`;

    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (maze[y][x] === 'wall') cell.classList.add('wall');
            if (maze[y][x] === 'river') cell.classList.add('river'); // Río
            if (y === 0 && x === 0) cell.classList.add('start'); // Celda de inicio
            if (y === mazeHeight - 2 && x === mazeWidth - 2) cell.classList.add('end'); // Celda de fin
            mazeContainer.appendChild(cell);
        }
    }
}

// Renderizar el laberinto
renderMaze();

// Variables para la posición inicial del jugador
let playerIndex = 0; // Corresponde a la celda (1, 1) en una cuadrícula de 10x10
const columns = 20;

// Capturar el parámetro de la URL
const params = new URLSearchParams(window.location.search);
const personaje = params.get("personaje");

// Elegir el modelo en función del personaje
const playerSrc = personaje === "mujer" ? "/src/modelos/alune.glb" : "/src/modelos/aphelios.glb";

// Crear el modelo del jugador
const player = document.createElement("model-viewer");
player.id = "player";
player.src = playerSrc;  // Archivo GLB del modelo
player.alt = "Player Model";
player.cameraControls = false;               // Desactivar controles de cámara
player.cameraOrbit = "300deg 70deg auto";    // Orientar el modelo de perfil
player.autoRotate = false;                   // Desactivar rotación automática
player.animationName = "";    // Nombre de la animación
player.animationSpeed = 1;                   // Velocidad de la animación
player.autoplay = true;                      // Iniciar la animación automáticamente

// Estilo del modelo
player.style.width = "100%";  // Ajusta el modelo para que ocupe el 80% del espacio de la celda
player.style.height = "100%"; // Ajusta la altura en consecuencia
player.style.objectFit = "contain";  // Ajuste adecuado del modelo dentro del contenedor
player.style.position = "relative"; // Usar 'relative' para el posicionamiento dentro de la celda

// Añadir el modelo 3D del jugador a la celda inicial
const cells = document.getElementsByClassName('cell');
cells[playerIndex].appendChild(player);

player.addEventListener("load", () => {
    player.play();
    player.animationSpeed = 0.5; // Cambia la velocidad de la animación a 0.5
});

// Escuchar eventos de teclado
document.addEventListener("keydown", movePlayer);

// Variable para controlar si el poder está disponible
let powerAvailable = true;

// Escuchar eventos de teclado para activar el poder
document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
        if (powerAvailable) {
            addNotification("¡Poder activado! Puedes cruzar un río una vez.");
            powerAvailable = false; // Consumir el poder
        }
    }
});


// Función para mover al jugador
function movePlayer(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del navegador

    let newIndex = playerIndex;
    const currentX = playerIndex % columns;
    const currentY = Math.floor(playerIndex / columns);

    switch (event.key) {
        case "ArrowUp":
            if (currentY > 0 && maze[currentY - 1][currentX] !== 'wall') newIndex -= columns;
            break;
        case "ArrowDown":
            if (currentY < mazeHeight - 1 && maze[currentY + 1][currentX] !== 'wall') newIndex += columns;
            break;
        case "ArrowLeft":
            if (currentX > 0 && maze[currentY][currentX - 1] !== 'wall') newIndex -= 1;
            break;
        case "ArrowRight":
            if (currentX < mazeWidth - 1 && maze[currentY][currentX + 1] !== 'wall') newIndex += 1;
            break;
    }

    // Verificar si la nueva celda contiene un enemigo o dragón
    if (cells[newIndex].classList.contains("enemy") || cells[newIndex].classList.contains("dragon")) {
        addNotification("¡Game Over! Un enemigo o el dragón te atrapó.");
        showGameOverPopup();
        clearInterval(enemyMovementInterval); // Detener el movimiento de enemigos
        document.removeEventListener("keydown", movePlayer); // Desactivar control del jugador
        return; // Detener la ejecución para que no se mueva el jugador
    }

    // Comprobar si la nueva celda es una pared
    const newX = newIndex % columns;
    const newY = Math.floor(newIndex / columns);

    if (maze[newY][newX] === 'wall') {
        return; // No permitir moverse a una pared
    }

    // Permitir cruzar el río si el poder está activo o si es un camino normal
    if (maze[newY][newX] === 'path' || (!powerAvailable && maze[newY][newX] === 'river')) {
        cells[playerIndex].removeChild(player);  // Quitar el modelo de la celda anterior
        playerIndex = newIndex;
        cells[playerIndex].appendChild(player);  // Mover el modelo a la nueva celda

        if (maze[newY][newX] === 'river' && !powerAvailable) {
            addNotification("Has usado el poder para cruzar el río.");
            powerAvailable = true; // Reactivar el poder para futuras ocasiones
        }
    }

    // Verificar si el jugador ha llegado al final
    if (cells[playerIndex].classList.contains("end")) {        
        addNotification("¡Felicidades, has llegado al final del laberinto!");
        showGanarPopup();
    }
}


function showGanarPopup() {
    const popup = document.getElementById('ganar-popup');
    popup.classList.remove('hidden'); // Mostrar el popup

    const reloadButton = document.getElementById('reloadwin-button');
    reloadButton.addEventListener('click', () => {
        window.location.href = 'bonus.html'; // Redirigir a bonus.html
    });
}

/*
function showGanarPopup() {
    const popup = document.getElementById('ganar-popup');
    popup.classList.remove('hidden');

    const reloadButton = document.getElementById('reloadwin-button');
    reloadButton.addEventListener('click', () => {
        location.reload(); // Recargar la página
    });
}
*/


// Variables para el movimiento del laberinto
let isDragging = false;
let offsetX, offsetY;

const mazeContainer = document.getElementById("maze-container");
const mazeElement = document.getElementById("maze");

mazeContainer.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - mazeElement.offsetLeft;
    offsetY = event.clientY - mazeElement.offsetTop;
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const dx = event.clientX - offsetX;
        const dy = event.clientY - offsetY;
        mazeElement.style.left = `${dx}px`;
        mazeElement.style.top = `${dy}px`;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Paso 2: Añadir enemigos al laberinto
const enemySrcs = ["/src/modelos/minion1.glb", "/src/modelos/minion2.glb","/src/modelos/raptor.glb","lobo.glb"];
let enemies = [];

// Crear enemigos en posiciones iniciales aleatorias
function createEnemies() {
    for (let i = 0; i < enemySrcs.length; i++) {
        const enemy = document.createElement("model-viewer");
        enemy.src = enemySrcs[i];
        enemy.alt = `Enemy ${i + 1}`;
        enemy.cameraControls = false;
        enemy.autoRotate = false;
        enemy.animationName = "";
        enemy.animationSpeed = 1;
        enemy.autoplay = true;
        enemy.cameraOrbit = "90deg 70deg auto";  
        enemy.style.width = "100%";
        enemy.style.height = "100%";
        enemy.style.objectFit = "contain";
        enemy.style.position = "relative";

        let x, y;
        do {
            x = Math.floor(Math.random() * mazeWidth);
            y = Math.floor(Math.random() * mazeHeight);
        } while (maze[y][x] !== 'path' || (x === 1 && y === 1)); // Evitar la posición del jugador

        const enemyIndex = y * columns + x;
        cells[enemyIndex].appendChild(enemy);
        cells[enemyIndex].classList.add("enemy");  // Añadir clase 'enemy' a la celda
        enemies.push({ element: enemy, index: enemyIndex });
    }
}
createEnemies();

function createDragon() {
    const dragon = document.createElement("model-viewer");
    dragon.src = "/src/modelos/dragon1.glb";
    dragon.alt = "Dragon dragon";
    dragon.cameraControls = false;
    dragon.autoRotate = false;
    dragon.animationName = "";
    dragon.animationSpeed = 1;
    dragon.autoplay = true;
    dragon.cameraOrbit = "90deg 70deg auto";  
    dragon.style.width = "120%";
    dragon.style.height = "120%";
    dragon.style.objectFit = "contain";
    dragon.style.position = "relative";

    dragon.classList.add("dragon"); // Asegúrate de añadir la clase "dragon"

    let x, y;
    do {
        x = Math.floor(Math.random() * mazeWidth);
        y = Math.floor(Math.random() * mazeHeight);
    } while (maze[y][x] !== 'path' || (x === 1 && y === 1)); // Evitar la posición del jugador

    const dragonIndex = y * columns + x;
    cells[dragonIndex].appendChild(dragon);
    enemies.push({ element: dragon, index: dragonIndex }); // Añadir el dragón a la lista de enemigos
}

// Movimiento del dragón
function moveDragon() {
    // Obtener el objeto del dragón desde la lista de enemigos
    const dragonObj = enemies.find(enemy => enemy.element.classList.contains("dragon"));
    const dragon = dragonObj.element;
    let currentPos = dragonObj.index; // Usamos el índice guardado en enemies

    // Movimiento del dragón: mueve 3 celdas por vez
    const direction = Math.floor(Math.random() * 4); // 0: Arriba, 1: Abajo, 2: Izquierda, 3: Derecha
    let nextPos = currentPos;

    // Mover el dragón dependiendo de la dirección
    switch (direction) {
        case 0: nextPos -= columns * 3; break; // Arriba
        case 1: nextPos += columns * 3; break; // Abajo
        case 2: nextPos -= 3; break; // Izquierda
        case 3: nextPos += 3; break; // Derecha
    }

    // Verificar que el movimiento sea válido (no salga fuera del mapa)
    if (nextPos >= 0 && nextPos < cells.length) {
        // Verificar si el dragón ha alcanzado al jugador
        if (nextPos === playerIndex) {
            addNotification("¡Game Over! Un enemigo te atrapó.");
            showGameOverPopup();  // Asegúrate de que esta función está bien definida
            clearInterval(enemyMovementInterval); // Detener el movimiento de enemigos
            document.removeEventListener("keydown", movePlayer); // Desactivar control del jugador
            return; // Detener la ejecución para que el dragón no siga moviéndose
        }

        // Mover el dragón
        cells[currentPos].removeChild(dragon);
        dragonObj.index = nextPos; // Actualizar la nueva posición en el objeto del dragón
        cells[nextPos].appendChild(dragon);
    }
}

// Crear el dragón
createDragon();

// Mover el dragón cada 500 ms
setInterval(moveDragon, 2950);

// Paso 3: Mover los enemigos cada 2 segundos
const enemyMovementInterval = setInterval(() => {
    enemies.forEach((enemyObj) => {
        // Solo mover enemigos que no sean dragón
        if (!enemyObj.element.classList.contains("dragon")) {
            const { element, index } = enemyObj;
            const currentX = index % columns;
            const currentY = Math.floor(index / columns);

            let possibleMoves = [];
            if (currentY > 0 && maze[currentY - 1][currentX] === 'path') possibleMoves.push(index - columns);
            if (currentY < mazeHeight - 1 && maze[currentY + 1][currentX] === 'path') possibleMoves.push(index + columns);
            if (currentX > 0 && maze[currentY][currentX - 1] === 'path') possibleMoves.push(index - 1);
            if (currentX < mazeWidth - 1 && maze[currentY][currentX + 1] === 'path') possibleMoves.push(index + 1);

            if (possibleMoves.length > 0) {
                const newIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

                // Comprobar si el nuevo índice es el mismo que el del jugador
                if (newIndex === playerIndex) {
                    addNotification("¡Game Over! Un enemigo te atrapó.");
                    showGameOverPopup();  // Asegúrate de que esta función está bien definida
                    clearInterval(enemyMovementInterval); // Detener el movimiento de enemigos
                    document.removeEventListener("keydown", movePlayer); // Desactivar control del jugador
                    return; // Detener la ejecución para que el enemigo no siga moviéndose
                }

                cells[index].removeChild(element);
                cells[newIndex].appendChild(element);
                enemyObj.index = newIndex;
            }
        }
    });
}, 2000);

function showGameOverPopup() {
    const popup = document.getElementById('game-over-popup');
    popup.classList.remove('hidden');

    const reloadButton = document.getElementById('reload-button');
    reloadButton.addEventListener('click', () => {
        location.reload(); // Recargar la página
    });
}
