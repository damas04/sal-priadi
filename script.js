const layers = document.querySelectorAll(".layer");
const navbar = document.getElementById("navbar");
const thumb = document.getElementById("thumb");
const productView = document.getElementById("product-view");
const fullImg = document.getElementById("full-img");
const fullTitle = document.getElementById("full-title");
const closeBtn = document.getElementById("close-btn");
const shopBtn = document.getElementById("shop-btn");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let idleTimer;

// --- FUNGSI ASLI: MOUSE TRAIL & CHECK OVER ELEMENT ---
const coords = Array.from({ length: layers.length }, () => ({ x: mouseX, y: mouseY }));

function isMouseOverElement(el, x, y) {
    const rect = el.getBoundingClientRect();
    return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
}

function updateMouse(x, y) {
    mouseX = x;
    mouseY = y;
    const overNavbar = isMouseOverElement(navbar, mouseX, mouseY);
    const overThumb = isMouseOverElement(thumb, mouseX, mouseY);

    if (overNavbar || overThumb) {
        layers.forEach(l => l.classList.remove("active"));
    } else {
        layers.forEach(l => l.classList.add("active"));
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            layers.forEach(l => l.classList.remove("active"));
        }, 500);
    }
}

document.addEventListener("mousemove", (e) => updateMouse(e.clientX, e.clientY));
document.addEventListener("touchstart", (e) => updateMouse(e.touches[0].clientX, e.touches[0].clientY));

function animate() {
    layers.forEach((layer, i) => {
        const speed = 0.07 + (i * 0.05);
        coords[i].x += (mouseX - coords[i].x) * speed;
        coords[i].y += (mouseY - coords[i].y) * speed;
        layer.style.transform = `translate3d(${coords[i].x}px, ${coords[i].y}px, 0) translate(-50%, -50%)`;
    });
    requestAnimationFrame(animate);
}
animate();

// --- FUNGSI BARU: INFINITE LOOP LOGIC ---
const setupInfiniteLoop = () => {
    const items = Array.from(thumb.children);
    // Clone item ke depan dan belakang
    items.forEach(item => {
        const cloneAfter = item.cloneNode(true);
        thumb.appendChild(cloneAfter);
    });
    items.forEach(item => {
        const cloneBefore = item.cloneNode(true);
        thumb.prepend(cloneBefore);
    });
    // Set posisi awal ke tengah
    thumb.scrollLeft = thumb.offsetWidth;
};
setupInfiniteLoop();

thumb.addEventListener("scroll", () => {
    const maxScroll = thumb.scrollWidth - thumb.clientWidth;
    if (thumb.scrollLeft <= 0) {
        thumb.scrollBehavior = "auto";
        thumb.scrollLeft = thumb.scrollWidth / 3;
    } else if (thumb.scrollLeft >= maxScroll) {
        thumb.scrollBehavior = "auto";
        thumb.scrollLeft = thumb.scrollWidth / 3;
    }
});

// --- FUNGSI BARU: NAVIGASI PANAH ---
document.querySelector(".right-btn").addEventListener("click", () => {
    thumb.scrollBehavior = "smooth";
    thumb.scrollLeft += 300;
});
document.querySelector(".left-btn").addEventListener("click", () => {
    thumb.scrollBehavior = "smooth";
    thumb.scrollLeft -= 300;
});

// --- FUNGSI ASLI: DRAG & CLICK HANDLING ---
let isDown = false;
let startX, scrollLeftVal;
let isDragging = false;

thumb.addEventListener("mousedown", (e) => {
    isDown = true;
    isDragging = false;
    thumb.classList.add("dragging");
    thumb.scrollBehavior = "auto";
    startX = e.pageX - thumb.offsetLeft;
    scrollLeftVal = thumb.scrollLeft;
});

thumb.addEventListener("mouseleave", () => isDown = false);
thumb.addEventListener("mouseup", () => {
    isDown = false;
    setTimeout(() => { isDragging = false; }, 50);
    thumb.classList.remove("dragging");
});

thumb.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const x = e.pageX - thumb.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) isDragging = true;
    thumb.scrollLeft = scrollLeftVal - walk;
});

// Event Delegation untuk Open Product (supaya clone bisa diklik)
thumb.addEventListener("click", (e) => {
    if (isDragging || e.target.tagName !== "IMG") return;
    const img = e.target;
    fullImg.src = img.src;
    fullTitle.innerText = img.getAttribute("data-name");
    shopBtn.href = img.getAttribute("data-link");
    productView.classList.add("show");
});

closeBtn.addEventListener("click", () => productView.classList.remove("show"));