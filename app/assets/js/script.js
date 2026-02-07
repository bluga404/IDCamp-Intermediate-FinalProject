let input = document.querySelector('#myFile');

let isModelLoaded = false;
let model;

async function init() {
    console.log("Load model...");
    try {
        model = await tf.loadGraphModel('../modeltfjs/model.json');
        
        isModelLoaded = true;
        console.log("Sukses memuat model (Graph Model)!!");
    } catch (error) {
        console.error("Gagal memuat model:", error);
    }
}

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (res) => {
            const image = new Image();
            image.src = res.target.result;
            image.onload = () => resolve(image);
        };
        reader.readAsDataURL(file);
    });
}

async function preprocess(imageElement) {
    let tensor = tf.browser.fromPixels(imageElement)
        .resizeBilinear([224, 224]) // Samakan dengan input MobileNetV2
        .cast('float32')
        .div(255.0)                // Normalisasi (Rescaling)
        .expandDims(0);            // Tambah dimensi batch [1, 224, 224, 3]
    return tensor;
}

async function predict() {
    if (!isModelLoaded) {
        alert("Model belum selesai, mohon tunggu!");
        return;
    }

    const fileInput = document.querySelector('#myFile');
    if (fileInput.files.length === 0) {
        alert("Pilih gambar!");
        return;
    }

    // Ambil file
    const file = fileInput.files[0];

    // Ubah file jadi elemen gambar
    const imageElement = await readFile(file);

    // Preprocessing jadi tensor
    const tensor = await preprocess(imageElement);

    // Prediksi
    const prediction = model.predict(tensor);
    const scoreArray = await prediction.data(); // Mengambil hasil angka
    const score = scoreArray[0]; // Ambil skor prediksi
    let result;
    let confidence;

    if (score > 0.5) {
        result = "Uninfected";
        confidence = (score * 100).toFixed(2); // Misal: 0.95 -> 95.00%
    } else {
        result = "Parasitized";
        confidence = ((1 - score) * 100).toFixed(2); // Misal: 0.05 -> 95.00%
    }

    // Tampilkan hasil
    alert(`Hasil: ${result}\nConfidence: ${confidence}%`);
}

// Pasang event listener ke tombol
document.querySelector('#button').addEventListener('click', predict);
init();