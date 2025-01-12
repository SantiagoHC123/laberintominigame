// Arreglo con las líneas de texto
const lines = [
    "Así como la enchilada va con chile",
    "Y los peces en el río",
    "Yo quiero estar contigo",
    "Ya que me encanta esa manera sexy tuya de ser y es bastante unica",
    "Me gusta la morenaza crazy que siempre eres",
    "Me gustas mucho Zurita",
    "Quisiera que fueras mi novia"
  ];
  
  let currentLineIndex = 0; // Índice de la línea actual
  
  function showPage() {
    // Ocultar el popup
    document.getElementById('popup').style.display = 'none';
  
    // Mostrar el contenido de la página
    const content = document.getElementById('content');
    content.style.visibility = 'visible';
  }
  
  function showNextLine() {
    const textLineElement = document.getElementById('text-line');
    const nextButton = document.getElementById('next-button');
    const finalButtons = document.getElementById('final-buttons');
  
    // Mostrar la siguiente línea si hay más líneas disponibles
    if (currentLineIndex < lines.length) {
      textLineElement.textContent = lines[currentLineIndex];
      currentLineIndex++;
    } else {
      // Cuando se termina de mostrar el texto, ocultar el botón "Continuar" y mostrar los botones finales
      nextButton.style.display = 'none';
      finalButtons.style.display = 'block';
    }
  }
  
  function answer(response) {
    if (response === 'Sí') {
      alert('╰( ^o^)╮╰( ^o^)╮');
    } else {
      alert('┐( ˘_˘)┌');
    }
  }
  