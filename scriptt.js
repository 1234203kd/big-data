// URL donde se encuentra el modelo y metadatos
const modelURL = "/big-data/mi modelo imagen/model.json";
const metadataURL = "/big-data/mi modelo imagen/metadata.json";

// Variables globales
let model, webcam, labelContainer, maxPredictions;

// Anchura y altura deseadas para la webcam (debe coincidir con el entrenamiento del modelo)
const flip = true; 
const width = 400;
const height = 400;

// Función principal asíncrona para iniciar todo
async function init() {
    // Referencia al contenedor de la webcam y las etiquetas
    const webcamContainer = document.getElementById("webcam-container");
    labelContainer = document.getElementById("label-container"); // Corregido: usa "label-container"

    try {
        // Cargar el modelo
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Configurar la webcam
        webcam = new tmImage.Webcam(width, height, flip); 
        await webcam.setup(); // Solicita acceso a la cámara
        await webcam.play();
        
        // Agregar el elemento de video de la webcam al contenedor
        webcamContainer.appendChild(webcam.canvas);
        
        // Crea los elementos de texto iniciales para las clases
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        // Iniciar el ciclo de predicción continua
        window.requestAnimationFrame(loop);

    } catch (e) {
        console.error("Error al cargar el modelo o la webcam:", e);
        // Muestra un mensaje de error si no se pudo cargar el modelo o la cámara
        if (labelContainer) {
            labelContainer.innerHTML = "<h3>⚠️ Error: No se pudo cargar el modelo o la cámara.</h3><p>Asegúrate de dar permiso de cámara y que los archivos estén en la ubicación correcta.</p>";
        }
    }
}

// Bucle de predicción continua
async function loop() {
    webcam.update(); // Captura el nuevo cuadro de la cámara
    await predict();
    window.requestAnimationFrame(loop); // Pide el siguiente ciclo
}

// Función para hacer la predicción y actualizar la interfaz
async function predict() {
    // Predice usando la imagen actual de la webcam
    const prediction = await model.predict(webcam.canvas);
    
    // Limpia el contenedor de etiquetas
    labelContainer.innerHTML = ''; 

    // Muestra los resultados de la predicción
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2) * 100 + "%";
        
        // Crea una barra de progreso visual (opcional, pero recomendado)
        const barWidth = (prediction[i].probability * 100) + '%';
        const barHTML = `<div style="background-color: #4A90E2; height: 20px; width: ${barWidth}; margin-top: 5px;"></div>`;

        const predictionDiv = document.createElement("div");
        predictionDiv.className = 'prediction';
        predictionDiv.innerHTML = `<strong>${prediction[i].className.replace(/_/g, ' ')}:</strong> ${(prediction[i].probability * 100).toFixed(2)}% ${barHTML}`;
        
        labelContainer.appendChild(predictionDiv);
    }
}

// Ya no es necesario window.addEventListener("load", init) porque usamos el botón.
// La función `init` se llama directamente desde el botón en el HTML.

