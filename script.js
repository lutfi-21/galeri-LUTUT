const firebaseConfig = { apiKey: "AIzaSyB35KZFBHlHVhfs61lRWODm_xaYM-v-xJY", authDomain: "galeri-lutut.firebaseapp.com", projectId: "galeri-lutut", storageBucket: "galeri-lutut.firebasestorage.app", messagingSenderId: "941582096185", appId: "1:941582096185:web:9aec6f5f798ff2d9437ae8" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let player;
let isVideoPlayed = false;

window.onload = () => {
    setTimeout(() => { document.getElementById('loader').style.display = 'none'; }, 2500);
};

function checkPass() {
    if (document.getElementById('passInput').value === 'LutfiDita2026') {
        document.getElementById('loginOverlay').style.display = 'none';
        const main = document.getElementById('mainContent');
        main.style.display = 'block';
        setTimeout(() => { main.style.opacity = '1'; }, 50);
        startLoveCounter();
        loadPhotos();
        initShake();
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

function initShake() {
    let lastX;
    window.addEventListener('devicemotion', (e) => {
        let acc = e.accelerationIncludingGravity;
        if (!acc || isVideoPlayed) return;
        if (lastX && Math.abs(acc.x - lastX) > 15) {
            isVideoPlayed = true;
            const vOverlay = document.getElementById('videoOverlay');
            vOverlay.style.display = 'flex';
            document.getElementById('surpriseVideo').play();
        }
        lastX = acc.x;
    });
}

function closeVideo() {
    document.getElementById('surpriseVideo').pause();
    document.getElementById('videoOverlay').style.display = 'none';
}

function loadPhotos() {
    database.ref('photos').on('child_added', (snapshot) => {
        const data = snapshot.val();
        const gallery = document.getElementById('gallery');
        const div = document.createElement('div');
        div.className = 'photo-card';
        div.id = snapshot.key;
        div.style.setProperty('--r', (Math.random() * 6) - 3);
        div.innerHTML = `<button class="delete-btn" onclick="deletePhoto('${snapshot.key}')">&times;</button><img src="${data.image}"><div class="photo-caption">${data.caption || '❤️'}</div>`;
        gallery.appendChild(div);
    });
}

function handleUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('photos').push({ image: e.target.result, caption: document.getElementById('photoCaption').value || "❤️" });
        };
        reader.readAsDataURL(file);
    }
}

function deletePhoto(key) { if(confirm("Hapus?")) database.ref('photos/' + key).remove(); }

function startLoveCounter() {
    const start = new Date("2025-01-04T00:00:00");
    setInterval(() => {
        const diff = new Date() - start;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff / 3600000) % 24);
        const m = Math.floor((diff / 60000) % 60);
        const s = Math.floor((diff / 1000) % 60);
        document.getElementById('loveCounter').innerHTML = `<span>${d}D</span> <span>${h}H</span> <span>${m}M</span> <span>${s}S</span> ❤️`;
    }, 1000);
}

function onYouTubeIframeAPIReady() { player = new YT.Player('player', { videoId: 'uaqnG8IvXcI', playerVars: { 'autoplay': 0, 'loop': 1, 'playlist': 'uaqnG8IvXcI' } }); }
function togglePlay() { player.getPlayerState() == 1 ? player.pauseVideo() : player.playVideo(); }
function openTimeCapsule() { document.getElementById('capsuleModal').style.display = 'flex'; }
function closeCapsule() { document.getElementById('capsuleModal').style.display = 'none'; }
function takeScreenshot() { html2canvas(document.body).then(canvas => { const link = document.createElement('a'); link.download = 'Kenangan.png'; link.href = canvas.toDataURL(); link.click(); }); }
