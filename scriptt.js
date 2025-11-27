// CORRECCIÓN AQUÍ:
// Usamos la ruta completa "/nombre-repositorio/carpeta/archivo"
// Esto asegura que GitHub Pages encuentre los archivos sin importar dónde esté el script.
const modelURL = "/big-data/mimodoimagen/model.json";
const metadataURL = "/big-data/mimodoimagen/metadata.json";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const webcamContainer = document.getElementById("webcam-container");
    labelContainer = document.getElementById("label");

    try {
        // Añadimos logs para verificar que las rutas se están construyendo bien antes de cargar
        console.log("Intentando cargar modelo desde:", modelURL);
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true;
        webcam = new tmImage.Webcam(400, 300, flip);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Limpiamos el contenedor antes de añadir (buena práctica por si init se llama dos veces)
        if (webcamContainer.hasChildNodes()) {
            webcamContainer.innerHTML = "";
        }
        webcamContainer.appendChild(webcam.canvas);
        
    } catch (e) {
        console.error("Error crítico al iniciar:", e);
        // Esto mostrará el error en la pantalla para que lo veas sin abrir la consola
        labelContainer.innerHTML = `<span style="color:red">Error: No se pudo cargar el modelo.<br>Revisa que la carpeta "model" exista en tu GitHub y contenga model.json</span>`;
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Verificamos que el modelo exista antes de predecir para evitar errores si la carga falló
    if (!model) return;

    const prediction = await model.predict(webcam.canvas);

    let highestProb = 0;
    let bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    // Formateo del texto
    const formatted = bestClass.replace(/_/g, " ");
    
    // Verificamos que los elementos existan en el HTML antes de escribir
    const labelEl = document.getElementById("label");
    const confEl = document.getElementById("confidence");
    
    if (labelEl) labelEl.innerHTML = `Estilo: <strong>${formatted}</strong>`;
    if (confEl) confEl.innerHTML = `Confianza: ${(highestProb * 100).toFixed(2)}%`;
}

window.addEventListener("load", init);
