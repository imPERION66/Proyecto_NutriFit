// =========================================================================
// LÓGICA DE LA VISTA SOBRE NOSOTROS - NUTRIFIT
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar la animación de contadores con IntersectionObserver
    initStatsCounterAnimation();

    // 2. Inicializar los eventos de control del modal de video
    initVideoModalControls();
});

/**
 * Registra un IntersectionObserver sobre el panel de impacto.
 * Al hacer scroll e ingresar a la sección, inicia una animación fluida
 * que aumenta los números progresivamente desde 0 hasta el valor objetivo.
 */
function initStatsCounterAnimation() {
    const statsPanel = document.getElementById("stats-panel");
    if (!statsPanel) return;

    const statClients = document.getElementById("stat-clients");
    const statWeight = document.getElementById("stat-weight");
    const statDishes = document.getElementById("stat-dishes");

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                
                // Iniciar animaciones individuales
                if (statClients) {
                    const target = parseInt(statClients.dataset.target || "17000");
                    animateValue(statClients, 0, target, 2000, "", "+");
                }
                if (statWeight) {
                    const target = parseInt(statWeight.dataset.target || "50000");
                    animateValue(statWeight, 0, target, 2000, " kg", "+");
                }
                if (statDishes) {
                    const target = parseInt(statDishes.dataset.target || "100");
                    animateValue(statDishes, 0, target, 2000, "", "+");
                }

                // Dejar de observar tras completar
                observer.unobserve(statsPanel);
            }
        });
    }, {
        threshold: 0.2 // Se activa cuando el 20% de la sección es visible
    });

    observer.observe(statsPanel);
}

/**
 * Incrementa progresivamente el valor numérico en pantalla usando requestAnimationFrame.
 * Aplica una función de aceleración suave (easeOutQuad) y formato local de miles.
 */
function animateValue(element, start, end, duration, suffix = "", prefix = "") {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutQuad
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(start + easeProgress * (end - start));
        
        // Formato con separadores de miles
        element.textContent = `${prefix}${currentValue.toLocaleString("es-ES")}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = `${prefix}${end.toLocaleString("es-ES")}${suffix}`;
        }
    }

    requestAnimationFrame(update);
}

/**
 * Vincula los controladores de cierre del modal de video (clic en la X o fuera del cuadro).
 */
function initVideoModalControls() {
    const modal = document.getElementById("video-modal");
    const closeBtn = document.getElementById("video-modal-close");
    const iframe = document.getElementById("testimonial-iframe");

    if (!modal) return;

    // Cerrar con la X
    closeBtn?.addEventListener("click", () => {
        cerrarTestimonioVideo();
    });

    // Cerrar al hacer clic en la máscara de fondo
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarTestimonioVideo();
        }
    });
}

/**
 * Abre el modal y carga el video del testimonio del cliente.
 * Se expone de forma global para interactuar con las tarjetas.
 */
function reproducirTestimonio(name, videoUrl) {
    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("testimonial-iframe");
    const title = document.getElementById("video-modal-title");

    if (!modal || !iframe) return;

    // Configurar título del modal
    if (title) title.textContent = `Testimonio de éxito: ${name}`;

    // Cargar URL en el iframe
    iframe.src = videoUrl;

    // Mostrar el modal
    modal.classList.add("show");
    document.body.style.overflow = "hidden"; // Desactivar scroll de fondo
    console.log(`Video modal: Reproduciendo testimonio de ${name}`);
}

/**
 * Cierra el modal y destruye el origen del iframe para detener el sonido de fondo.
 */
function cerrarTestimonioVideo() {
    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("testimonial-iframe");

    if (!modal || !iframe) return;

    // Ocultar modal
    modal.classList.remove("show");
    document.body.style.overflow = ""; // Reactivar scroll de fondo

    // Destruir src del iframe para silenciar
    iframe.src = "";
    console.log("Video modal: Cerrado y reproducción de audio detenida.");
}

// Exponer funciones globales para interactuar con los handlers de clicks inline en el HTML
window.reproducirTestimonio = reproducirTestimonio;
window.cerrarTestimonioVideo = cerrarTestimonioVideo;
