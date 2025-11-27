// URL donde se encuentra el modelo
const modelURL = "./mi modelo imagen/model.json";
const metadataURL = "./mi modelo imagen/metadata.json";

let model, labelContainer, maxPredictions, uploadedImage, predictButton;

// Función principal asíncrona para iniciar todo
async function init() {
    // Referencias a los elementos del HTML
    labelContainer = document.getElementById("label");
    const imageUpload = document.getElementById("image-upload");
    uploadedImage = document.getElementById("uploaded-image");
    predictButton = document.getElementById("predict-button");

    try {
        // Cargar el modelo
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Configurar el evento para subir imagen
        imageUpload.addEventListener("change", handleImageUpload);
        predictButton.addEventListener("click", () => predict(uploadedImage));
    } catch (e) {
        console.error("Error al cargar el modelo:", e);
        labelContainer.innerText = "Error al cargar el modelo. Revisa la consola.";
    }
}

// Función para manejar la subida de imagen
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = "block";
            predictButton.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

// Función para hacer la predicción y actualizar la interfaz
async function predict(imageElement) {
    // Predice usando la imagen subida
    const prediction = await model.predict(imageElement);
    
    // Encuentra la clase con la mayor probabilidad
    let highestProb = 0;
    let bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    // Formatea el nombre de la clase para que se vea mejor (ej: "Formal" en lugar de "Class 1")
    const formattedClassName = bestClass.replace(/_/g, ' '); // Reemplaza guiones bajos con espacios

    // Actualiza el HTML con el resultado
    document.getElementById("label").innerHTML = `Estilo: <strong>${formattedClassName}</strong>`;
    document.getElementById("confidence").innerHTML = `Confianza: ${(highestProb * 100).toFixed(2)}%`;
}

// Inicia la aplicación cuando la página se carga
window.addEventListener("load", init);