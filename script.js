// Referencias a los elementos estructurales del HTML identificados según el boceto
const zonaDeChat = document.getElementById('zona-de-chat');
const zonaDeOpciones = document.getElementById('zona-de-opciones');

// Variables para el control de la conversación y memoria
let arbolDecision = null;
let nodoActualId = "inicio";
let nombreUsuario = "";

// Carga del árbol de decisión desde el archivo JSON externo
fetch('arbol_decision.json')
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo de árbol de decisión.");
    }
    return response.json();
  })
  .then(data => {
    arbolDecision = data;
    iniciarConversacion();
  })
  .catch(error => {
    console.error("Error al cargar JSON:", error);
    mostrarMensajeError("Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json");
  });

// Función para inicializar la conversación
function iniciarConversacion() {
  zonaDeChat.innerHTML = '';
  nodoActualId = "inicio";
  procesarNodo(nodoActualId);
}

// Función principal para mostrar el mensaje y generar las opciones asociadas
function procesarNodo(idNodo) {
  const nodo = arbolDecision[idNodo];
  
  if (!nodo) {
    console.error(`El nodo ${idNodo} no existe en arbol_decision.json`);
    return;
  }

  nodoActualId = idNodo;

  // Reemplazar la variable {nombre} en el texto del nodo si ya fue registrada
  let textoProcesado = nodo.texto;
  if (nombreUsuario) {
    textoProcesado = textoProcesado.replace(/{nombre}/g, nombreUsuario);
  }

  // Agregar mensaje del Bot a la zona de chat
  agregarMensajeBot(textoProcesado);

  // Limpiar y renderizar la zona de opciones
  renderizarZonaDeOpciones(nodo);
}

// Agrega una burbuja de mensaje del bot en la zona de chat
function agregarMensajeBot(texto) {
  const div = document.createElement('div');
  div.classList.add('mensaje', 'bot');
  div.textContent = texto;
  zonaDeChat.appendChild(div);
  scrollChatAlFinal();
}

// Agrega una burbuja de mensaje del usuario en la zona de chat
function agregarMensajeUsuario(texto) {
  const div = document.createElement('div');
  div.classList.add('mensaje', 'usuario');
  div.textContent = texto;
  zonaDeChat.appendChild(div);
  scrollChatAlFinal();
}

// Muestra el mensaje de error si falla la lectura del JSON
function mostrarMensajeError(texto) {
  zonaDeChat.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('mensaje', 'error');
  div.textContent = texto;
  zonaDeChat.appendChild(div);
  zonaDeOpciones.innerHTML = '';
}

// Renderiza los botones o controles según las reglas del nodo actual
function renderizarZonaDeOpciones(nodo) {
  zonaDeOpciones.innerHTML = '';

  // Caso Excepción: El nodo requiere un campo de entrada <input>
  if (nodo.requiereInput) {
    const form = document.createElement('form');
    form.classList.add('input-form');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = nodo.inputPlaceholder || 'Escribí acá...';
    input.classList.add('input-field');

    const errorMsg = document.createElement('span');
    errorMsg.classList.add('input-error-text');

    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.classList.add('btn-opcion');
    btnSubmit.textContent = nodo.botonSubmit || 'Enviar';

    form.appendChild(input);
    form.appendChild(errorMsg);
    form.appendChild(btnSubmit);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const valor = input.value.trim();

      // Validación de formato: Nombre sin números y no vacío
      if (nodo.tipoInput === 'nombre') {
        const regexSoloLetras = /^[a-zA-AáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!valor || !regexSoloLetras.test(valor)) {
          errorMsg.textContent = 'Por favor, ingresá un nombre válido (solo letras).';
          errorMsg.style.display = 'block';
          return;
        }
        // Guardar en la memoria del bot
        nombreUsuario = valor;
      }

      errorMsg.style.display = 'none';
      agregarMensajeUsuario(valor);
      procesarNodo(nodo.siguiente);
    });

    zonaDeOpciones.appendChild(form);
    input.focus();
    return;
  }

  // Caso General: Botones de opciones navegables
  if (nodo.opciones && nodo.opciones.length > 0) {
    nodo.opciones.forEach(opcion => {
      const btn = document.createElement('button');
      btn.classList.add('btn-opcion');
      
      if (opcion.esSalir) {
        btn.classList.add('btn-salir');
      }

      btn.textContent = opcion.texto;

      btn.addEventListener('click', () => {
        agregarMensajeUsuario(opcion.texto);

        // Si la opción es de reinicio de la conversación
        if (opcion.siguiente === "inicio") {
          iniciarConversacion();
        } else {
          procesarNodo(opcion.siguiente);
        }
      });

      zonaDeOpciones.appendChild(btn);
    });
  }
}

// Mantiene el scroll en el último mensaje enviado
function scrollChatAlFinal() {
  zonaDeChat.scrollTop = zonaDeChat.scrollHeight;
}
