const firebaseConfig = { apiKey: "AIzaSyB35KZFBHlHVhfs61lRWODm_xaYM-v-xJY", authDomain: "galeri-lutut.firebaseapp.com", projectId: "galeri-lutut", storageBucket: "galeri-lutut.firebasestorage.app", messagingSenderId: "941582096185", appId: "1:941582096185:web:9aec6f5f798ff2d9437ae8" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let player;
let isVideoPlayed = false;

// 1. LOADER LOGIC
window.addEventListener('load', () => {
    setTimeout(() => { document.getElementById('loader').style.display = 'none'; }, 2500);
});

// 2. LOGIN & SHAKE INIT
function checkPass() {
    if (document.getElementById('passInput').value === 'LutfiDita2026') {
        document.getElementById('loginOverlay').style.display = 'none';
        const main = document.getElementById('mainContent');
        main.style.display = 'block';
        setTimeout(() => { main.style.opacity = '1'; }, 50);
        
        startLoveCounter();
        loadPhotos();
        initShake(); // Aktifkan sensor goyang
        alert("Login Berhasil! Coba goyangkan HP-mu untuk kejutan! ✨");
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

// 3. SHAKE DETECTION (VIDEO SURPRISE)
function initShake() {
    let lastX, lastY, lastZ;
    window.addEventListener('devicemotion', (e) => {
        let acc = e.accelerationIncludingGravity;
        if (!acc || isVideoPlayed) return;

        let delta = 15; // Sensitivitas goyangan
        if (lastX && (Math.abs(acc.x - lastX) > delta || Math.abs(acc.y - lastY) > delta)) {
            playSurprise();
        }
        lastX = acc.x; lastY = acc.y; lastZ = acc.z;
    });
}

function playSurprise() {
    isVideoPlayed = true;
    const vOverlay = document.getElementById('videoOverlay');
    const vVid = document.getElementById('surpriseVideo');
    vOverlay.style.display = 'flex';
    vVid.play();
}

function closeVideo() {
    document.getElementById('surpriseVideo').pause();
    document.getElementById('videoOverlay').style.display = 'none';
}

// 4. FIREBASE RENDERING (ANTI-MISS)
function loadPhotos() {
    const gallery = document.getElementById('gallery');
    database.ref('photos').on('child_added', (snapshot) => {
        const data = snapshot.val();
        const div = document.createElement('div');
        div.className = 'photo-card';
        div.id = snapshot.key;
        div.style.setProperty('--r', (Math.random() * 6) - 3);
        div.innerHTML = `
            <button class="delete-btn" onclick="deletePhoto('${snapshot.key}')">&times;</button>
            <img src="${data.image}" loading="lazy">
            <div class="photo-caption">${data.caption || '❤️'}</div>
        `;
        gallery.appendChild(div);
    });
    database.ref('photos').on('child_removed', (snapshot) => {
        const el = document.getElementById(snapshot.key);
        if (el) el.remove();
    });
}

function handleUpload(event) {
    const file = event.target.files[0];
    const cap = document.getElementById('photoCaption').value || "Our Memories ❤️";
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('photos').push({ image: e.target.result, caption: cap });
            document.getElementById('photoCaption').value = "";
        };
        reader.readAsDataURL(file);
    }
}

function deletePhoto(key) { if(confirm("Hapus kenangan ini?")) database.ref('photos/' + key).remove(); }

// 5. OTHER FEATURES
function startLoveCounter() {
    const start = new Date("2026-01-04T00:00:00");
    setInterval(() => {
        const diff = new Date() - start;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff / 3600000) % 24);
        const m = Math.floor((diff / 60000) % 60);
        const s = Math.floor((diff / 1000) % 60);
        document.getElementById('loveCounter').innerHTML = `Sudah <span>${d}D</span> <span>${h}H</span> <span>${m}M</span> <span>${s}S</span> Bersama ❤️`;
    }, 1000);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', { videoId: 'uaqnG8IvXcI', playerVars: { 'autoplay': 0, 'loop': 1, 'playlist': 'uaqnG8IvXcI' } });
}

function togglePlay() {
    const st = player.getPlayerState();
    st == 1 ? player.pauseVideo() : player.playVideo();
}

function openTimeCapsule() {
    document.getElementById('capsuleModal').style.display = 'flex';
    const now = new Date();
    const unlock = new Date("2027-01-04T00:00:00");
    if(now >= unlock) {
        document.getElementById('secretMessage').style.display = 'block';
        document.getElementById('countdownText').style.display = 'none';
    } else {
        const days = Math.ceil((unlock - now) / 86400000);
        document.getElementById('countdownText').innerText = `Terkunci! Bisa dibuka ${days} hari lagi.`;
    }
}

function closeCapsule() { document.getElementById('capsuleModal').style.display = 'none'; }

function takeScreenshot() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Kenangan-LUTUT.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}
