// CORRECCIÓN AQUÍ:
// Usamos la ruta completa "/nombre-repositorio/carpeta/archivo"
const modelURL = "/big-data/mimodoimagen/model.json";
const metadataURL = "/big-data/mimodoimagen/metadata.json";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const webcamContainer = document.getElementById("webcam-container");
    // CORRECCIÓN 1: Apuntar al ID correcto del contenedor de resultados.
    labelContainer = document.getElementById("label-container"); 

    try {
        console.log("Intentando cargar modelo desde:", modelURL);
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // CORRECCIÓN 2: Ajustar el tamaño de la webcam a 400x400
        // para que coincida con el estilo.css y evitar problemas de visualización.
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip); // 
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Limpiamos el contenedor antes de añadir
        if (webcamContainer.hasChildNodes()) {
            webcamContainer.innerHTML = "";
        }
        webcamContainer.appendChild(webcam.canvas);
        
        // CORRECCIÓN 3: Crear dinámicamente los elementos HTML para las predicciones
        // (ya que no existen en index.html)
        for (let i = 0; i < maxPredictions; i++) {
            const predictionEl = document.createElement("div");
            predictionEl.classList.add("prediction");
            
            // Creamos los IDs únicos que 'predict()' actualizará
            predictionEl.innerHTML = `<span id="label-${i}">Cargando clase...</span><div id="bar-${i}"></div>`;
            labelContainer.appendChild(predictionEl);
        }
        
    } catch (e) {
        console.error("Error crítico al iniciar:", e);
        // Mostrar el error en la pantalla si el modelo no carga
        labelContainer.innerHTML = `<span style="color:red">Error: No se pudo cargar el modelo.<br>Revisa la ruta y que los archivos existan.</span>`;
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

    // CORRECCIÓN 4: Recorrer todas las predicciones y actualizar el HTML dinámico
    for (let i = 0; i < maxPredictions; i++) {
        const probability = prediction[i].probability;
        
        // Formateo del texto de la clase (reemplaza guiones bajos por espacios)
        const formattedClassName = prediction[i].className.replace(/_/g, " ");

        // Obtenemos los elementos creados dinámicamente en init()
        const labelEl = document.getElementById(`label-${i}`);
        const barEl = document.getElementById(`bar-${i}`);

        if (labelEl) {
            // Muestra el nombre de la clase y el porcentaje de confianza
            labelEl.innerHTML = `${formattedClassName}: <strong>${(probability * 100).toFixed(1)}%</strong>`;
        }
        
        // Actualiza el ancho de la barra de progreso
        if (barEl) {
             barEl.style.width = (probability * 100) + "%";
        }
    }
}

window.addEventListener("load", init);

