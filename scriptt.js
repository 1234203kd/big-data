// Usamos la ruta absoluta (incluyendo el nombre del repositorio 'big-data').
const modelURL = "/big-data/mimodoimagen/model.json";
const metadataURL = "/big-data/mimodoimagen/metadata.json";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const webcamContainer = document.getElementById("webcam-container");
    // CORRECCIÓN FINAL: Apuntamos al ID correcto del contenedor de resultados.
    labelContainer = document.getElementById("label-container"); 

    try {
        console.log("Intentando cargar modelo desde:", modelURL);
        
        // 1. Cargar el modelo
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // 2. Configurar la webcam (400x400 para coincidir con CSS)
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip); 
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        // 3. Añadir el canvas al contenedor
        if (webcamContainer.hasChildNodes()) {
            webcamContainer.innerHTML = "";
        }
        webcamContainer.appendChild(webcam.canvas);
        
        // 4. Crear dinámicamente el HTML para las predicciones
        for (let i = 0; i < maxPredictions; i++) {
            const predictionEl = document.createElement("div");
            predictionEl.classList.add("prediction");
            
            predictionEl.innerHTML = `<span id="label-${i}">Cargando clase...</span><div id="bar-${i}"></div>`;
            labelContainer.appendChild(predictionEl);
        }
        
    } catch (e) {
        console.error("Error crítico al iniciar:", e);
        // Mostrar error si la carga falla (detallando el mensaje de la excepción)
        labelContainer.innerHTML = `<span style="color:red">Error: No se pudo cargar el modelo.<br>Revisa la ruta y subida de archivos. (Detalle: ${e.message})</span>`;
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!model) return;

    const prediction = await model.predict(webcam.canvas);

    // Recorrer todas las predicciones y actualizar el HTML dinámico
    for (let i = 0; i < maxPredictions; i++) {
        const probability = prediction[i].probability;
        
        // Formateo del texto de la clase
        const formattedClassName = prediction[i].className.replace(/_/g, " ");

        const labelEl = document.getElementById(`label-${i}`);
        const barEl = document.getElementById(`bar-${i}`);

        if (labelEl) {
            labelEl.innerHTML = `${formattedClassName}: <strong>${(probability * 100).toFixed(1)}%</strong>`;
        }
        
        // Actualiza el ancho de la barra de progreso
        if (barEl) {
             barEl.style.width = (probability * 100) + "%";
        }
    }
}

// Este listener funciona perfectamente con el atributo 'defer' en el <head>
window.addEventListener("load", init);
