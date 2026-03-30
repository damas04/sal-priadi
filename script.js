const layers = document.querySelectorAll(".layer");
const navbar = document.getElementById("navbar");
const thumb = document.getElementById("thumb");
const productView = document.getElementById("product-view");
const fullImg = document.getElementById("full-img");
const fullTitle = document.getElementById("full-title");
const closeBtn = document.getElementById("close-btn");
const shopBtn = document.getElementById("shop-btn");
const trailContainer = document.getElementById("trail-container");

// Posisi mouse target dan posisi mouse saat ini (untuk smoothing)
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

// Posisi terakhir partikel muncul (Kunci agar tidak mengacak di awal)
let lastSpawnPos = { x: targetX, y: targetY };

/* =========================
   LAYER FOLLOW (PARALLAX)
========================= */
const coords = Array.from({ length: layers.length }, () => ({ x: targetX, y: targetY }));

function isMouseOverElement(el, x, y) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function updateMousePositions(x, y) {
    targetX = x;
    targetY = y;

    const overNavbar = isMouseOverElement(navbar, x, y);
    const overThumb = isMouseOverElement(thumb, x, y);

    if (overNavbar || overThumb) {
        layers.forEach(l => l.classList.remove("active"));
    } else {
        layers.forEach(l => l.classList.add("active"));
    }
}

function animateLayers() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    layers.forEach((layer, i) => {
        const speed = 0.05 + (i * 0.03); 
        coords[i].x += (targetX - coords[i].x) * speed;
        coords[i].y += (targetY - coords[i].y) * speed;

        layer.style.transform = `translate3d(${coords[i].x}px, ${coords[i].y}px, 0) translate(-50%, -50%)`;
    });

    requestAnimationFrame(animateLayers);
}
animateLayers();

/* =========================
   PARTICLE TRAIL (OPTIMIZED)
========================= */
const images = [
    "assets/product1.png",
    "assets/product2.png",
    "assets/product3.png",
    "assets/product4.png"
];

let particles = [];
const maxParticles = 30;
let imgIndex = 0;

function getNextImage() {
    const img = images[imgIndex];
    imgIndex = (imgIndex + 1) % images.length;
    return img;
}

function createParticle(x, y) {
    const distance = Math.hypot(x - lastSpawnPos.x, y - lastSpawnPos.y);
    const minDistance = 90; 

    if (distance < minDistance) return; 
    
    lastSpawnPos = { x, y };

    if (isMouseOverElement(navbar, x, y) || isMouseOverElement(thumb, x, y)) return;

    const img = document.createElement("img");
    img.className = "trail-img";
    img.src = getNextImage();

    const widthSize = 15; 
    
    const heightSize = 20; 
    img.style.height = heightSize + "rem";
    img.style.width = widthSize + "rem";
    img.style.objectFit = "cover"; 

    const rotation = (Math.random() - 0.5) * 0;
    
    trailContainer.appendChild(img);

    particles.push({
        el: img,
        x: x,
        y: y,
        life: 1,
        rotation: rotation
    });

    if (particles.length > maxParticles) {
        const old = particles.shift();
        if(old.el) old.el.remove();
    }
}

function animateParticles() {
    particles.forEach(p => {
        p.life -= 0.01; 
        p.y -= 0.5; 

        p.el.style.left = p.x + "px";
        p.el.style.top = p.y + "px";
        p.el.style.opacity = p.life;

        const scale = 0.7 + p.life * 0.3;
        p.el.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${p.rotation}deg)`;

        if (p.life <= 0) {
            p.el.remove();
        }
    });

    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* =========================
   EVENT LISTENERS
========================= */
const handleMove = (e) => {
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (x && y) {
        updateMousePositions(x, y);
        createParticle(x, y);
    }
};

document.addEventListener("mousemove", handleMove);
document.addEventListener("touchmove", handleMove);

/* =========================
   THUMBNAIL CAROUSEL & MODAL
========================= */
const setupInfiniteLoop = () => {
    if (!thumb) return;
    const items = Array.from(thumb.children);
    items.forEach(i => thumb.appendChild(i.cloneNode(true)));
    items.forEach(i => thumb.prepend(i.cloneNode(true)));
    thumb.scrollLeft = thumb.offsetWidth;
};
setupInfiniteLoop();

thumb.addEventListener("scroll", () => {
    const maxScroll = thumb.scrollWidth - thumb.clientWidth;
    if (thumb.scrollLeft <= 0 || thumb.scrollLeft >= maxScroll) {
        thumb.scrollLeft = thumb.scrollWidth / 3;
    }
});

document.querySelector(".right-btn").onclick = () => {
    thumb.scrollTo({ left: thumb.scrollLeft + 400, behavior: 'smooth' });
};
document.querySelector(".left-btn").onclick = () => {
    thumb.scrollTo({ left: thumb.scrollLeft - 400, behavior: 'smooth' });
};

/* DRAG SYSTEM */
let isDown = false, startX, scrollL;

thumb.addEventListener("mousedown", e => {
    isDown = true;
    thumb.style.scrollBehavior = "auto"; 
    startX = e.pageX - thumb.offsetLeft;
    scrollL = thumb.scrollLeft;
});

const endDrag = () => {
    isDown = false;
    thumb.style.scrollBehavior = "smooth";
};

thumb.addEventListener("mouseup", endDrag);
thumb.addEventListener("mouseleave", endDrag);

thumb.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - thumb.offsetLeft;
    const walk = (x - startX) * 1.5;
    thumb.scrollLeft = scrollL - walk;
});

/* =========================
   MODAL VIEW (LOGIC COLOR SWITCH)
========================= */
thumb.addEventListener("click", e => {
    if (e.target.tagName !== "IMG") return;
    
    fullImg.src = e.target.src;
    fullTitle.innerText = e.target.dataset.name || "Product Item";
    shopBtn.href = e.target.dataset.link || "#";
    
    // Tampilkan modal
    productView.classList.add("show");
    
    // Kunci Perubahan Warna Navbar: Tambah class ke body
    document.body.classList.add("view-active");
});

closeBtn.onclick = () => {
    // Sembunyikan modal
    productView.classList.remove("show");
    
    // Kembalikan warna navbar ke hitam: Hapus class dari body
    document.body.classList.remove("view-active");
};