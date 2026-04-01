const threshold = 45; // Tambahkan ini di baris nomor 1
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    
    if (music.paused) {
        music.play().then(() => {
            btn.innerText = "⏸ Pause Music";
            btn.style.background = "#ff758f"; // Beri warna saat main
        }).catch(error => {
            console.log("Musik gagal diputar: ", error);
            alert("Gagal memutar musik. Pastikan koneksi internet stabil.");
        });
    } else {
        music.pause();
        btn.innerText = "🎵 Play Music";
        btn.style.background = "rgba(255, 255, 255, 0.15)";
    }
}

function handleUpload(event) {
    const files = event.target.files;
    const gallery = document.getElementById('gallery');
    
    // Menghilangkan pesan placeholder jika ada foto baru
    const placeholder = document.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'photo-card';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.loading = "lazy";
            
            div.appendChild(img);
            gallery.appendChild(div);
        };
        reader.readAsDataURL(file);
    }
}

function handleUpload(event) {
    const files = event.target.files;
    const gallery = document.getElementById('gallery');
    
    const placeholder = document.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'photo-card';
            
            // Tambahkan Tombol Hapus
            const btnHapus = document.createElement('button');
            btnHapus.className = 'delete-btn';
            btnHapus.innerHTML = '&times;'; // Simbol silang (X)
            btnHapus.onclick = function() {
                deletePhoto(div);
            };

            const img = document.createElement('img');
            img.src = e.target.result;
            img.loading = "lazy";
            
            div.appendChild(btnHapus); // Masukkan tombol ke dalam div
            div.appendChild(img);
            gallery.appendChild(div);
        };
        reader.readAsDataURL(file);
    }
}

// Fungsi untuk menghapus elemen foto
function deletePhoto(element) {
    if (confirm("Hapus kenangan ini?")) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        setTimeout(() => {
            element.remove();
            
            // Jika gallery kosong, munculkan kembali pesan placeholder
            const gallery = document.getElementById('gallery');
            if (gallery.children.length === 0) {
                gallery.innerHTML = `
                    <div class="photo-card placeholder">
                        <p>Belum ada foto. Unggah momen indahmu di atas.</p>
                    </div>`;
            }
        }, 300); // Delay sedikit agar ada efek transisi menghilang
    }
}

// 1. Fungsi untuk memuat foto yang tersimpan saat halaman dibuka
window.onload = function() {
    loadPhotos();
};

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    if (music.paused) {
        music.play();
        btn.innerText = "⏸ Pause Music";
    } else {
        music.pause();
        btn.innerText = "🎵 Play Music";
    }
}

function handleUpload(event) {
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            savePhotoToLocal(base64Image); // Simpan ke storage
            renderPhoto(base64Image);      // Tampilkan ke layar
        };
        reader.readAsDataURL(file);
    }
}

// Fungsi untuk menampilkan elemen foto ke HTML
function renderPhoto(imageSrc) {
    const gallery = document.getElementById('gallery');
    const placeholder = document.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const div = document.createElement('div');
    div.className = 'photo-card';
    
    const btnHapus = document.createElement('button');
    btnHapus.className = 'delete-btn';
    btnHapus.innerHTML = '&times;';
    btnHapus.onclick = function() {
        deletePhoto(div, imageSrc);
    };

    const img = document.createElement('img');
    img.src = imageSrc;
    img.loading = "lazy";
    
    div.appendChild(btnHapus);
    div.appendChild(img);
    gallery.appendChild(div);
}

// Fungsi Simpan ke LocalStorage
function savePhotoToLocal(imageRaw) {
    let photos = JSON.parse(localStorage.getItem('gallery_memories')) || [];
    photos.push(imageRaw);
    localStorage.setItem('gallery_memories', JSON.stringify(photos));
}

// Fungsi Ambil dari LocalStorage
function loadPhotos() {
    let photos = JSON.parse(localStorage.getItem('gallery_memories')) || [];
    if (photos.length > 0) {
        photos.forEach(photo => renderPhoto(photo));
    }
}

// Fungsi Hapus dan Update LocalStorage
function deletePhoto(element, imageSrc) {
    if (confirm("Hapus kenangan ini?")) {
        // Hapus dari tampilan
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            element.remove();
            
            // Hapus dari LocalStorage
            let photos = JSON.parse(localStorage.getItem('gallery_memories')) || [];
            photos = photos.filter(p => p !== imageSrc);
            localStorage.setItem('gallery_memories', JSON.stringify(photos));

            // Jika kosong, balikkan placeholder
            const gallery = document.getElementById('gallery');
            if (gallery.children.length === 0) {
                gallery.innerHTML = `
                    <div class="photo-card placeholder">
                        <p>Belum ada foto. Unggah momen indahmu di atas.</p>
                    </div>`;
            }
        }, 300);
    }
}

let lastUpdate = 0;
let x, y, z, lastX, lastY, lastZ;
const threshold = 15; // Sensitivitas guncangan (semakin kecil semakin sensitif)

// Meminta izin sensor untuk perangkat iOS (iPhone)
function requestMotionPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                }
            })
            .catch(console.error);
    } else {
        // Untuk Android atau browser non-iOS
        window.addEventListener('devicemotion', handleMotion);
    }
}

// Tambahkan pemicu izin saat tombol musik diklik pertama kali
document.getElementById('musicBtn').addEventListener('click', function() {
    requestMotionPermission();
}, { once: true });

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

        // Di baris bawah ini variabel threshold digunakan
        let speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > threshold) {
            triggerSurprise();
        }

        lastX = x; lastY = y; lastZ = z;
    }
}
function triggerSurprise() {
    const videoOverlay = document.getElementById('videoOverlay');
    const video = document.getElementById('surpriseVideo');
    const bgMusic = document.getElementById('bgMusic');

    // Jika video sedang tidak diputar
    if (videoOverlay.style.display !== 'flex') {
        // 1. Tampilkan Overlay
        videoOverlay.style.display = 'flex';
        setTimeout(() => videoOverlay.classList.add('active'), 10);

        // 2. Kecilkan Background Music (Fade out ke 0.1)
        let fadeAudio = setInterval(() => {
            if (bgMusic.volume > 0.1) {
                bgMusic.volume -= 0.1;
            } else {
                clearInterval(fadeAudio);
            }
        }, 100);

        // 3. Putar Video
        video.play();

        // 4. Deteksi saat video berakhir
        video.onended = function() {
            // Sembunyikan Overlay
            videoOverlay.classList.remove('active');
            setTimeout(() => videoOverlay.style.display = 'none', 500);

            // Kembalikan Volume Musik Normal (Fade in ke 1.0)
            let fadeInAudio = setInterval(() => {
                if (bgMusic.volume < 1.0) {
                    bgMusic.volume += 0.1;
                } else {
                    clearInterval(fadeInAudio);
                }
            }, 100);
        };
    }
}
