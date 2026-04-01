// 1. Pengaturan Sensitivitas & Variabel Global
const threshold = 80; // Angka guncangan (45 = sedang, 60 = kuat)
let lastUpdate = 0;
let x, y, z, lastX, lastY, lastZ;
let isSurpriseActive = false; 

// 2. Fungsi untuk memuat foto lama saat refresh
window.onload = function() {
    loadPhotos();
};

// 3. Fungsi Musik & Aktifkan Sensor (PENTING: Harus diklik dulu!)
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    
    // Aktifkan sensor gerak saat tombol musik pertama kali diklik
    initMotionSensor();

    if (music.paused) {
        music.play().then(() => {
            btn.innerText = "⏸ Pause Music";
        }).catch(err => {
            alert("Klik 'Allow' atau pastikan musik sudah ter-load.");
        });
    } else {
        music.pause();
        btn.innerText = "🎵 Play Music";
    }
}

// 4. Inisialisasi Sensor Gerak
function initMotionSensor() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        // Khusus iPhone (iOS)
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                }
            }).catch(console.error);
    } else {
        // Android & Browser lain
        window.addEventListener('devicemotion', handleMotion);
    }
}

// 5. Logika Hitung Guncangan
function handleMotion(event) {
    if (isSurpriseActive) return; 

    let acceleration = event.accelerationIncludingGravity;
    let curTime = new Date().getTime();

    if ((curTime - lastUpdate) > 100) {
        let diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        x = acceleration.x;
        y = acceleration.y;
        z = acceleration.z;

        let speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > threshold) {
            triggerSurprise();
        }

        lastX = x; lastY = y; lastZ = z;
    }
}

// 6. Fungsi Video Kejutan
function triggerSurprise() {
    const videoOverlay = document.getElementById('videoOverlay');
    const video = document.getElementById('surpriseVideo');
    const bgMusic = document.getElementById('bgMusic');

    isSurpriseActive = true; 
    videoOverlay.style.display = 'flex';
    setTimeout(() => videoOverlay.classList.add('active'), 10);

    // Kecilkan musik & putar video
    bgMusic.volume = 0.1;
    video.currentTime = 0;
    video.play();

    video.onended = function() {
        videoOverlay.classList.remove('active');
        setTimeout(() => {
            videoOverlay.style.display = 'none';
            isSurpriseActive = false;
            bgMusic.volume = 1.0; 
        }, 500);
    };
}

// --- FUNGSI GALERI (Tetap Sama) ---
function handleUpload(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            savePhotoToLocal(e.target.result);
            renderPhoto(e.target.result);
        };
        reader.readAsDataURL(files[i]);
    }
}

function renderPhoto(imageSrc) {
    const gallery = document.getElementById('gallery');
    const placeholder = document.querySelector('.placeholder');
    if (placeholder) placeholder.remove();
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.innerHTML = `<button class="delete-btn" onclick="deletePhoto(this.parentElement, '${imageSrc}')">&times;</button><img src="${imageSrc}">`;
    gallery.appendChild(div);
}

function savePhotoToLocal(img) {
    let photos = JSON.parse(localStorage.getItem('gallery_memories')) || [];
    photos.push(img);
    localStorage.setItem('gallery_memories', JSON.stringify(photos));
}

function loadPhotos() {
    let photos = JSON.parse(localStorage.getItem('gallery_memories')) || [];
    photos.forEach(p => renderPhoto(p));
}

function deletePhoto(el, src) {
    if (confirm("Hapus foto ini?")) {
        el.remove();
        let photos = JSON.parse(localStorage.getItem('gallery_memories')) || [];
        photos = photos.filter(p => p !== src);
        localStorage.setItem('gallery_memories', JSON.stringify(photos));
    }
}
