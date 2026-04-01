// --- 1. KONFIGURASI FIREBASE LUTFI ---
const firebaseConfig = {
  apiKey: "AIzaSyB35KZFBHlHVhfs61lRWODm_xaYM-v-xJY",
  authDomain: "galeri-lutut.firebaseapp.com",
  projectId: "galeri-lutut",
  storageBucket: "galeri-lutut.firebasestorage.app",
  messagingSenderId: "941582096185",
  appId: "1:941582096185:web:9aec6f5f798ff2d9437ae8",
  measurementId: "G-K74GSKWXCR"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. PENGATURAN SENSOR & STATE ---
let lastUpdate = 0;
let x = 0, y = 0, z = 0, lastX = 0, lastY = 0, lastZ = 0;
let isSurpriseActive = false;
let player; // YouTube Player
let isMusicPlaying = false;

// --- 3. LOGIKA FIREBASE (REALTIME GALLERY) ---
window.onload = function() {
    const photoRef = database.ref('photos');
    
    // Muncul otomatis di semua HP saat ada foto baru
    photoRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        renderPhoto(data.image, snapshot.key);
    });

    // Hilang otomatis di semua HP saat ada foto dihapus
    photoRef.on('child_removed', (snapshot) => {
        const el = document.getElementById(snapshot.key);
        if (el) el.remove();
    });
};

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

function deletePhoto(key) {
    if (confirm("Hapus kenangan ini untuk semua orang?")) {
        database.ref('photos/' + key).remove();
    }
}

// --- 4. LOGIKA MUSIK YOUTUBE ---
var player; // Pastikan ini ada di baris pertama

function onYouTubeIframeAPIReady() {
    console.log("Menghubungkan ke YouTube...");
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'uaqnG8IvXcI', // ID lagu Cigarettes After Sex pilihanmu
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'playlist': 'uaqnG8IvXcI',
            'loop': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log("Koneksi YouTube SUKSES, Lutfi!");
}

function onPlayerError(event) {
    console.error("YouTube Error:", event.data);
}

function toggleMusic() {
    const btn = document.getElementById('musicBtn');
    initMotionSensor(); // Aktifkan sensor guncangan

    if (!isMusicPlaying) {
        player.playVideo();
        btn.innerText = "⏸ Pause Music";
        isMusicPlaying = true;
    } else {
        player.pauseVideo();
        btn.innerText = "🎵 Play Music";
        isMusicPlaying = false;
    }
}

// --- 5. SENSOR GUNCANGAN (ANTI-SENSITIF) ---
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
    let deltaY = Math.abs(acc.y - lastY);
    let deltaZ = Math.abs(acc.z - lastZ);

    lastX = acc.x; lastY = acc.y; lastZ = acc.z;

    // Angka 45 = Harus disentak/diguncang kuat baru nyala
    if (deltaX > 45 || deltaY > 45 || deltaZ > 45) {
        triggerSurprise();
    }
}

// --- 6. VIDEO PESAN KEJUTAN ---
function triggerSurprise() {
    const videoOverlay = document.getElementById('videoOverlay');
    const video = document.getElementById('surpriseVideo');

    isSurpriseActive = true;
    videoOverlay.style.display = 'flex';
    setTimeout(() => videoOverlay.classList.add('active'), 10);

    if (player) player.setVolume(10); // Kecilkan musik YT
    video.currentTime = 0;
    video.play();

    video.onended = function() {
        videoOverlay.classList.remove('active');
        setTimeout(() => {
            videoOverlay.style.display = 'none';
            isSurpriseActive = false;
            if (player) player.setVolume(100); // Balikkan suara YT
        }, 500);
    };
}

// --- FITUR EKSKLUSIF: SANDI ---
function checkPass() {
    const input = document.getElementById('passInput').value;
    const overlay = document.getElementById('loginOverlay');
    const error = document.getElementById('errorMsg');
    
    // GANTI 'senja2026' dengan sandi yang kamu mau
    const passwordBenar = 'LutfiDita2026'; 

    if (input === passwordBenar) {
        overlay.style.transition = "0.5s";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    } else {
        error.style.display = 'block';
        document.getElementById('passInput').value = "";
    }
}

// Biar bisa tekan 'Enter' buat masuk
document.getElementById("passInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        checkPass();
    }
});

// 1. Fungsi Utama Musik
function togglePlay() {
    if (player && player.getPlayerState) {
        if (player.getPlayerState() == 1) {
            player.pauseVideo();
            document.getElementById('musicBtn').innerText = "🎵 Play Music";
        } else {
            player.playVideo();
            document.getElementById('musicBtn').innerText = "⏸ Pause Music";
        }
    } else {
        console.error("Player YouTube belum siap!");
    }
}

// 2. Fungsi Fitur 5: Screenshot
function takeScreenshot() {
    const btnGroup = document.querySelector('.button-group');
    btnGroup.style.opacity = '0'; // Sembunyikan semua tombol agar foto bersih

    html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Moment-Lutfi.png';
        link.href = canvas.toDataURL();
        link.click();
        btnGroup.style.opacity = '1'; // Munculkan lagi
    });
}
