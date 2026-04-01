// --- 1. KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyB35KZFBHlHVhfs61lRWODm_xaYM-v-xJY",
  authDomain: "galeri-lutut.firebaseapp.com",
  projectId: "galeri-lutut",
  storageBucket: "galeri-lutut.firebasestorage.app",
  messagingSenderId: "941582096185",
  appId: "1:941582096185:web:9aec6f5f798ff2d9437ae8"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. VARIABLE GLOBAL ---
var player; 
let isSurpriseActive = false;
let lastX = 0, lastY = 0, lastZ = 0;

// --- 3. FITUR EKSKLUSIF: SANDI (Dipindah ke atas agar terbaca duluan) ---
function checkPass() {
    const input = document.getElementById('passInput').value;
    const overlay = document.getElementById('loginOverlay');
    const error = document.getElementById('errorMsg');
    
    if (input === 'LutfiDita2026') {
        overlay.style.transition = "0.5s";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = 'none';
            applyTimeTheme(); // Jalankan tema saat terbuka
        }, 500);
    } else {
        error.style.display = 'block';
        document.getElementById('passInput').value = "";
    }
}

// --- 4. LOGIKA FIREBASE ---
window.onload = function() {
    const photoRef = database.ref('photos');
    photoRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        renderPhoto(data.image, snapshot.key);
    });
    photoRef.on('child_removed', (snapshot) => {
        const el = document.getElementById(snapshot.key);
        if (el) el.remove();
    });

    // Input Enter Listener (Ditaruh di dalam onload agar aman)
    const pInput = document.getElementById("passInput");
    if(pInput) {
        pInput.addEventListener("keyup", function(e) {
            if (e.key === "Enter") checkPass();
        });
    }
};

function renderPhoto(imageSrc, key) {
    const gallery = document.getElementById('gallery');
    const placeholder = document.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const div = document.createElement('div');
    div.className = 'photo-card';
    div.id = key;
    div.innerHTML = `
        <button class="delete-btn" onclick="deletePhoto('${key}')">&times;</button>
        <img src="${imageSrc}" loading="lazy">
    `;
    gallery.appendChild(div);
}

function handleUpload(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            database.ref('photos').push({
                image: e.target.result,
                timestamp: Date.now()
            });
        };
        reader.readAsDataURL(files[i]);
    }
}

function deletePhoto(key) {
    if (confirm("Hapus kenangan ini?")) {
        database.ref('photos/' + key).remove();
    }
}

// --- 5. LOGIKA MUSIK YOUTUBE ---
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', width: '0',
        videoId: 'uaqnG8IvXcI',
        playerVars: {
            'autoplay': 0, 'controls': 0, 'loop': 1,
            'playlist': 'uaqnG8IvXcI',
            'origin': window.location.origin
        },
        events: { 'onReady': () => console.log("YouTube Ready!") }
    });
}

function togglePlay() {
    if (player && player.getPlayerState) {
        const state = player.getPlayerState();
        if (state == 1) {
            player.pauseVideo();
            document.getElementById('musicBtn').innerText = "🎵 Play Music";
        } else {
            player.playVideo();
            document.getElementById('musicBtn').innerText = "⏸ Pause Music";
            initMotionSensor(); // Aktifkan sensor guncangan saat musik mulai
        }
    } else {
        alert("Sabar Lutfi, musiknya lagi loading...");
    }
}

// --- 6. FITUR TEMA & SCREENSHOT ---
function applyTimeTheme() {
    const hour = new Date().getHours();
    const body = document.body;
    if (hour >= 6 && hour < 18) {
        body.style.background = "linear-gradient(-45deg, #e0eafc, #cfdef3, #a2c2e1)";
        body.style.color = "#2c3e50";
    } else {
        body.style.background = "linear-gradient(-45deg, #0f0c29, #302b63, #24243e)";
        body.style.color = "white";
    }
}

function takeScreenshot() {
    const btnGroup = document.querySelector('.button-group');
    if(btnGroup) btnGroup.style.opacity = '0';

    html2canvas(document.body, { useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Moment-Lutfi.png';
        link.href = canvas.toDataURL();
        link.click();
        if(btnGroup) btnGroup.style.opacity = '1';
    });
}

// --- 7. SENSOR GUNCANGAN ---
function initMotionSensor() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(state => {
            if (state === 'granted') window.addEventListener('devicemotion', handleMotion);
        });
    } else {
        window.addEventListener('devicemotion', handleMotion);
    }
}

function handleMotion(event) {
    if (isSurpriseActive) return;
    let acc = event.accelerationIncludingGravity;
    if (!acc) return;
    let deltaX = Math.abs(acc.x - lastX);
    if (deltaX > 45) triggerSurprise();
    lastX = acc.x;
}

function triggerSurprise() {
    const videoOverlay = document.getElementById('videoOverlay');
    const video = document.getElementById('surpriseVideo');
    if (!videoOverlay || !video) return;

    isSurpriseActive = true;
    videoOverlay.style.display = 'flex';
    video.play();
    video.onended = () => {
        videoOverlay.style.display = 'none';
        isSurpriseActive = false;
    };
}
