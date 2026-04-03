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

// 1. LOADER LOGIC
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 800);
        }
    }, 2500);
});

// 2. LOGIN LOGIC
function checkPass() {
    const input = document.getElementById('passInput').value;
    const overlay = document.getElementById('loginOverlay');
    const main = document.getElementById('mainContent');
    
    if (input === 'LutfiDita2026') {
        overlay.style.opacity = "0";
        setTimeout(() => { 
            overlay.style.display = 'none';
            main.style.display = 'block'; // Paksa muncul
            setTimeout(() => { main.style.opacity = '1'; }, 50);
            startLoveCounter();
            loadPhotos();
        }, 600);
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

// 3. FIREBASE RENDER
function loadPhotos() {
    database.ref('photos').on('child_added', (snapshot) => {
        const data = snapshot.val();
        const gallery = document.getElementById('gallery');
        const div = document.createElement('div');
        div.className = 'photo-card';
        div.id = snapshot.key;
        div.style.setProperty('--r', (Math.random() * 6) - 3);
        
        div.innerHTML = `
            <button class="delete-btn" onclick="deletePhoto('${snapshot.key}')">&times;</button>
            <img src="${data.image}">
            <div class="photo-caption">${data.caption || ''}</div>
        `;
        gallery.appendChild(div);
    });

    database.ref('photos').on('child_removed', (snapshot) => {
        const el = document.getElementById(snapshot.key);
        if(el) el.remove();
    });
}

function handleUpload(event) {
    const file = event.target.files[0];
    const caption = document.getElementById('photoCaption').value || "Our Memories ❤️";
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('photos').push({ image: e.target.result, caption: caption });
            document.getElementById('photoCaption').value = "";
        };
        reader.readAsDataURL(file);
    }
}

function deletePhoto(key) {
    if(confirm("Hapus kenangan ini?")) database.ref('photos/' + key).remove();
}

// 4. FITUR TAMBAHAN
function startLoveCounter() {
    const start = new Date("2025-01-04T00:00:00");
    setInterval(() => {
        const diff = new Date() - start;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        document.getElementById('loveCounter').innerHTML = 
            `Sudah <span>${d}D</span> <span>${h}H</span> <span>${m}M</span> <span>${s}S</span> Bersama ❤️`;
    }, 1000);
}

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

function openTimeCapsule() {
    const modal = document.getElementById('capsuleModal');
    modal.style.display = 'flex';
    const now = new Date();
    const unlock = new Date("2027-01-04T00:00:00");
    if(now >= unlock) {
        document.getElementById('secretMessage').style.display = 'block';
    } else {
        const diff = Math.ceil((unlock - now) / (1000 * 60 * 60 * 24));
        document.getElementById('countdownText').innerText = `Terkunci! Bisa dibuka ${diff} hari lagi.`;
    }
}

function closeCapsule() { document.getElementById('capsuleModal').style.display = 'none'; }

function takeScreenshot() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Kenangan.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}
