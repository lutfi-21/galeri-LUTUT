// --- FIREBASE CONFIG ---
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

let player;

// --- 1. LOADER & INIT ---
window.onload = function() {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 800);
        }
    }, 2500);

    // Enter Key Listener
    document.getElementById("passInput").addEventListener("keyup", (e) => {
        if (e.key === "Enter") checkPass();
    });
};

// --- 2. LOGIN ---
function checkPass() {
    const input = document.getElementById('passInput').value;
    const overlay = document.getElementById('loginOverlay');
    if (input === 'LutfiDita2026') {
        overlay.style.opacity = "0";
        setTimeout(() => { overlay.style.display = 'none'; }, 500);
        startLoveCounter();
        loadPhotos(); // Baru panggil Firebase setelah login
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

// --- 3. LOVE COUNTER ---
function startLoveCounter() {
    const startDate = new Date("2025-01-04T00:00:00"); // Sesuaikan tanggal jadian
    setInterval(() => {
        const diff = new Date() - startDate;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        document.getElementById('loveCounter').innerHTML = 
            `Sudah <span>${d}HARI</span> <span>${h}JAM</span> <span>${m}MENIT</span> <span>${s}DETIK</span> Bersama ❤️`;
    }, 1000);
}

// --- 4. FIREBASE LOGIC ---
function loadPhotos() {
    const photoRef = database.ref('photos');
    photoRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        renderPhoto(data.image, snapshot.key, data.caption);
    });
    photoRef.on('child_removed', (snapshot) => {
        const el = document.getElementById(snapshot.key);
        if (el) el.remove();
    });
}

function renderPhoto(src, key, caption) {
    const gallery = document.getElementById('gallery');
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.id = key;
    
    const r = (Math.random() * 6) - 3; // Rotasi acak miring
    div.style.setProperty('--r', r);
    
    div.innerHTML = `
        <button class="delete-btn" onclick="deletePhoto('${key}')">&times;</button>
        <img src="${src}" loading="lazy">
        <div class="photo-caption">${caption || ''}</div>
    `;
    gallery.appendChild(div);
}

function handleUpload(event) {
    const file = event.target.files[0];
    const caption = document.getElementById('photoCaption').value || "Our Memories ❤️";
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('photos').push({
                image: e.target.result,
                caption: caption,
                timestamp: Date.now()
            });
            document.getElementById('photoCaption').value = "";
        };
        reader.readAsDataURL(file);
    }
}

function deletePhoto(key) {
    if (confirm("Hapus foto ini?")) database.ref('photos/' + key).remove();
}

// --- 5. TIME CAPSULE ---
function openTimeCapsule() {
    const unlockDate = new Date("2027-01-04T00:00:00"); // Tanggal kapsul bisa dibuka
    const now = new Date();
    const modal = document.getElementById('capsuleModal');
    modal.style.display = 'flex';

    if (now >= unlockDate) {
        document.getElementById('lockStatus').innerText = "🔓";
        document.getElementById('countdownText').style.display = 'none';
        document.getElementById('secretMessage').style.display = 'block';
    } else {
        const diff = unlockDate - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        document.getElementById('countdownText').innerHTML = `Sabar ya... <br> Pesan ini baru bisa dibuka dalam <b>${days} hari lagi</b>.`;
    }
}

function closeCapsule() { document.getElementById('capsuleModal').style.display = 'none'; }

// --- 6. MUSIC & SCREENSHOT ---
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', width: '0', videoId: 'uaqnG8IvXcI',
        playerVars: { 'autoplay': 0, 'loop': 1, 'playlist': 'uaqnG8IvXcI' }
    });
}

function togglePlay() {
    const state = player.getPlayerState();
    if (state == 1) {
        player.pauseVideo();
        document.getElementById('musicBtn').innerText = "🎵 Play Music";
    } else {
        player.playVideo();
        document.getElementById('musicBtn').innerText = "⏸ Pause Music";
    }
}

function takeScreenshot() {
    const btn = document.querySelector('.button-group');
    btn.style.opacity = '0';
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Kenangan-LUTUT.png';
        link.href = canvas.toDataURL();
        link.click();
        btn.style.opacity = '1';
    });
}
