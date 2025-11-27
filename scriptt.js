// CORRECCIÓN CLAVE: Usamos la ruta absoluta que funciona en tu GitHub Pages.
// DEBES verificar que el nombre del repositorio 'big-data' y la carpeta 'mi modelo imagen'
// coincidan EXACTAMENTE (mayúsculas/minúsculas) con tu repositorio.
const modelURL = "/big-data/mi modelo imagen/model.json";
const metadataURL = "/big-data/mi modelo imagen/metadata.json";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const webcamContainer = document.getElementById("webcam-container");
    // Tu HTML (index.html) usa el ID 'label-container' para mostrar resultados
    labelContainer = document.getElementById("label-container"); 

    try {
        console.log("Intentando cargar modelo desde:", modelURL);
        
        // Cargar el modelo
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true;
        // La resolución es de 400x400 en tu CSS, así que la ajustamos aquí:
        webcam = new tmImage.Webcam(400, 400, flip); 
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Limpiamos el contenedor (aunque solo deberíamos llamar a init una vez)
        if (webcamContainer.hasChildNodes()) {
            webcamContainer.innerHTML = "";
        }
        webcamContainer.appendChild(webcam.canvas);
        
    } catch (e) {
        console.error("Error crítico al iniciar:", e);
        // Usamos el mensaje de error de tu interfaz original
        labelContainer.innerHTML = `<h3>⚠️ Error: No se pudo cargar el modelo.</h3><p>Revisa que la carpeta "mi modelo imagen" exista en tu GitHub y contenga model.json</p>`;
    }
}

async function loop() {
    // Si la cámara falló en init, evitamos errores aquí
    if (!webcam) return; 
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!model) return;

    const prediction = await model.predict(webcam.canvas);
    
    // Tu código original usaba highestProb, el código de la webcam usa un bucle for (como la versión anterior).
    // Usaremos el código más limpio de la versión anterior que te di (con las barras) para mostrar todos los resultados.
    
    // Limpia el contenedor de etiquetas
    labelContainer.innerHTML = ''; 

    // Muestra los resultados de la predicción (usando barras)
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

// ⭐ ADAPTACIÓN CLAVE: Inicia la aplicación automáticamente al cargar
window.addEventListener("load", init);
