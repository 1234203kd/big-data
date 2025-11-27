// CORRECCIÓN DE RUTA: Usamos la ruta absoluta que ya funcionó en tu entorno de GitHub Pages.
// ⚠️ ¡IMPORTANTE! Verifica que 'big-data' y 'mi modelo imagen' sean la capitalización exacta.
const modelURL = "/big-data/mi modelo imagen/model.json";
const metadataURL = "/big-data/mi modelo imagen/metadata.json";

// Variables globales
let model, webcam, labelContainer, maxPredictions;

// Dimensiones de la webcam (coinciden con el CSS)
const flip = true; 
const width = 400;
const height = 400;

// Función principal asíncrona para iniciar todo
async function init() {
    const webcamContainer = document.getElementById("webcam-container");
    labelContainer = document.getElementById("label-container");
    
    // Deshabilita el botón para evitar doble clic (si lo tienes en el HTML)
    const initButton = document.querySelector('button[onclick="init()"]');
    if (initButton) {
        initButton.disabled = true;
        initButton.innerText = "Cargando modelo...";
    }

    try {
        // Cargar el modelo (Primer punto de fallo)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Configurar la webcam
        webcam = new tmImage.Webcam(width, height, flip); 
        await webcam.setup(); // Solicita acceso a la cámara
        await webcam.play();
        
        // 🚀 SOLUCIÓN AL PROBLEMA DE LA IMAGEN: 
        // 1. Limpiamos el contenedor (importante para que se inserte correctamente)
        webcamContainer.innerHTML = '';
        // 2. Insertamos el elemento canvas de la webcam
        webcamContainer.appendChild(webcam.canvas);
        
        // Crea los elementos de texto iniciales para las clases
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
        
        // Cambia el texto del botón
        if (initButton) {
             initButton.innerText = "Clasificación Iniciada";
        } else {
             // Si no hay botón (modo automático), muestra que está listo.
             labelContainer.innerHTML = '<h3>✅ Clasificador Listo.</h3>';
        }

        // Iniciar el ciclo de predicción continua
        window.requestAnimationFrame(loop);

    } catch (e) {
        console.error("Error al cargar el modelo o la webcam:", e);
        // Muestra un mensaje de error si no se pudo cargar el modelo o la cámara
        if (labelContainer) {
            labelContainer.innerHTML = `
                <h3>⚠️ Error.</h3>
                <p>El modelo no se encontró (404). Verifica que:
                1. El nombre de la carpeta 'mi modelo imagen' sea EXACTO en GitHub.
                2. Los archivos model.json y metadata.json estén allí.</p>`;
        }
    }
}

// Bucle de predicción continua
async function loop() {
    // Si la webcam existe, actualizamos el fotograma
    if (webcam) { 
        webcam.update(); 
        await predict();
    }
    window.requestAnimationFrame(loop); 
}

// Función para hacer la predicción y actualizar la interfaz
async function predict() {
    // Verificamos que el modelo haya cargado
    if (!model) return;

    const prediction = await model.predict(webcam.canvas);
    
    // Limpia el contenedor de etiquetas
    labelContainer.innerHTML = ''; 

    // Muestra los resultados de la predicción
    for (let i = 0; i < maxPredictions; i++) {
        const barWidth = (prediction[i].probability * 100) + '%';
        const barHTML = `<div style="background-color: #4A90E2; height: 20px; width: ${barWidth}; margin-top: 5px;"></div>`;

        const predictionDiv = document.createElement("div");
        predictionDiv.className = 'prediction';
        const classNameFormatted = prediction[i].className.replace(/_/g, ' ');
        const probabilityFormatted = (prediction[i].probability * 100).toFixed(2);
        
        predictionDiv.innerHTML = `
            <strong>${classNameFormatted}</strong>: ${probabilityFormatted}%
            ${barHTML}
        `;
        
        labelContainer.appendChild(predictionDiv);
    }
}

// Si decidiste usar inicio automático (sin botón), descomenta la siguiente línea:
// window.addEventListener("load", init);
