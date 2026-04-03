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

var player; 
let isSurpriseActive = false;
let lastX = 0;

// --- 1. FITUR LOVE COUNTER ---
function startLoveCounter() {
    const startDate = new Date("2026-01-04T00:00:00"); // GANTI TANGGAL JADIAN KAMU DI SINI
    setInterval(() => {
        const now = new Date();
        const diff = now - startDate;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        document.getElementById('loveCounter').innerHTML = 
            `Sudah <span>${d}D</span> <span>${h}H</span> <span>${m}M</span> <span>${s}S</span> Bersama ❤️`;
    }, 1000);
}

// --- 2. LOGIN ---
function checkPass() {
    const input = document.getElementById('passInput').value;
    const overlay = document.getElementById('loginOverlay');
    if (input === 'LutfiDita2026') {
        overlay.style.opacity = "0";
        setTimeout(() => { overlay.style.display = 'none'; }, 500);
        startLoveCounter(); // Mulai counter saat login
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

// --- 3. FIREBASE & RENDER ---
window.onload = function() {
    // --- PREMIUM LOADER LOGIC ---
    const loader = document.getElementById('loader');
    if(loader) {
        // Beri jeda 3 detik (3000ms) agar animasinya tuntas dinikmati
        setTimeout(() => {
            // Tambahkan class untuk fade-out (sesuai CSS baru)
            loader.classList.add('fade-out');
            
            // Hapus elemen dari DOM setelah transisi CSS selesai (1 detik)
            setTimeout(() => {
                if(loader.parentNode) loader.parentNode.removeChild(loader);
            }, 1000); 
        }, 3000); 
    }
    
    // ... sisa kode window.onload kamu yang lain (Firebase, Love Counter, dll.) ...
};
    const photoRef = database.ref('photos');
    photoRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        renderPhoto(data.image, snapshot.key, data.caption);
    });
    photoRef.on('child_removed', (snapshot) => {
        const el = document.getElementById(snapshot.key);
        if (el) el.remove();
    });

    document.getElementById("passInput").addEventListener("keyup", (e) => {
        if (e.key === "Enter") checkPass();
    });
};

function renderPhoto(imageSrc, key, caption = "") {
    const gallery = document.getElementById('gallery');
    const placeholder = document.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const div = document.createElement('div');
    div.className = 'photo-card';
    div.id = key;
    const r = (Math.random() * 4) - 2; // Miring acak -2 sampai 2 derajat
    div.style.setProperty('--r', r);
    
    div.innerHTML = `
        <button class="delete-btn" onclick="deletePhoto('${key}')">&times;</button>
        <img src="${imageSrc}" loading="lazy">
        <div class="photo-caption">${caption}</div>
    `;
    gallery.appendChild(div);
}

function handleUpload(event) {
    const file = event.target.files[0];
    const captionText = document.getElementById('photoCaption').value || "Our Moment ❤️";
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            database.ref('photos').push({
                image: e.target.result,
                caption: captionText,
                timestamp: Date.now()
            });
            document.getElementById('photoCaption').value = ""; // Reset caption
        };
        reader.readAsDataURL(file);
    }
}

function deletePhoto(key) {
    if (confirm("Hapus kenangan ini?")) database.ref('photos/' + key).remove();
}

// --- 4. YOUTUBE ---
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', width: '0', videoId: 'uaqnG8IvXcI',
        playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': 'uaqnG8IvXcI' },
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
            initMotionSensor();
        }
    }
}

// --- 5. SCREENSHOT & SENSOR ---
function takeScreenshot() {
    const btnGroup = document.querySelector('.button-group');
    btnGroup.style.opacity = '0';
    html2canvas(document.body, { useCORS: true, allowTaint: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Moment-Lutfi.png';
        link.href = canvas.toDataURL();
        link.click();
        btnGroup.style.opacity = '1';
    });
}

function initMotionSensor() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
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
    isSurpriseActive = true;
    videoOverlay.style.display = 'flex';
    if (player) player.setVolume(10);
    video.play();
    video.onended = () => {
        videoOverlay.style.display = 'none';
        isSurpriseActive = false;
        if (player) player.setVolume(100);
    };
}

// --- LOGIKA TIME CAPSULE ---
const unlockDate = new Date("2027-01-04T00:00:00"); // GANTI KE TANGGAL SURAT BISA DIBUKA (Misal: Ultah Dita)

function openTimeCapsule() {
    const modal = document.getElementById('capsuleModal');
    const secret = document.getElementById('secretMessage');
    const countdown = document.getElementById('countdownText');
    const now = new Date();

    modal.style.display = 'flex';

    if (now >= unlockDate) {
        // Jika sudah waktunya buka
        document.getElementById('lockStatus').innerText = "🔓";
        countdown.style.display = 'none';
        secret.style.display = 'block';
    } else {
        // Jika belum waktunya
        document.getElementById('lockStatus').innerText = "🔒";
        secret.style.display = 'none';
        
        // Hitung selisih hari
        const diff = unlockDate - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        countdown.innerHTML = `Sabar ya Lutfi & Ditut... <br><br> Pesan ini masih terkunci. <br> <strong>Bisa dibuka dalam ${days} hari lagi!</strong>`;
    }
}

function closeCapsule() {
    document.getElementById('capsuleModal').style.display = 'none';
}
