// =========================================================================
// LÓGICA DE LA VISTA SOBRE NOSOTROS - NUTRIFIT
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar textos e historias de éxito dinámicamente
    cargarEditorialPublico();
    cargarTestimoniosPublicos();

    // 2. Inicializar la animación de contadores con IntersectionObserver
    initStatsCounterAnimation();

    // 3. Inicializar los eventos de control del modal de video
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

/**
 * Carga dinámicamente los contenidos institucionales si han sido actualizados por el Administrador.
 */
function cargarEditorialPublico() {
    try {
        const editorial = JSON.parse(localStorage.getItem("nf_editorial"));
        if (!editorial) return;

        const elMisionT = document.getElementById("view-mision-titulo");
        const elMisionP = document.getElementById("view-mision-texto");
        const elVisionT = document.getElementById("view-vision-titulo");
        const elVisionP = document.getElementById("view-vision-texto");
        const elValoresT = document.getElementById("view-valores-titulo");
        const elValoresP = document.getElementById("view-valores-texto");

        if (elMisionT) elMisionT.textContent = editorial.mision_titulo;
        if (elMisionP) elMisionP.textContent = editorial.mision_texto;
        if (elVisionT) elVisionT.textContent = editorial.vision_titulo;
        if (elVisionP) elVisionP.textContent = editorial.vision_texto;
        if (elValoresT) elValoresT.textContent = editorial.valores_titulo;
        if (elValoresP) elValoresP.textContent = editorial.valores_texto;
    } catch (err) {
        console.warn("NutriFit: No se pudo inyectar el contenido editorial:", err);
    }
}

/**
 * Carga dinámicamente los casos de éxito de clientes en la sección testimonios.
 */
function cargarTestimoniosPublicos() {
    try {
        const listado = JSON.parse(localStorage.getItem("nf_testimonios"));
        const grid = document.getElementById("testimonials-public-grid");
        if (!listado || !grid) return;

        // Filtrar únicamente testimonios en estado "Publicado"
        const publicados = listado.filter(t => t.estado === "Publicado");

        if (publicados.length === 0) {
            grid.innerHTML = '<p class="empty-testimonials" style="grid-column: 1/-1; text-align: center; font-style: italic; color: var(--color-text-light);">Próximamente más historias de éxito de nuestra comunidad.</p>';
            return;
        }

        grid.innerHTML = publicados.map(t => `
            <article class="testimonial-card">
                <div class="testimonial-img-wrapper">
                    <img src="${t.imagen}" alt="Testimonio de ${t.nombre}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/147/147144.png'">
                </div>
                <div class="testimonial-body">
                    <h3>${t.nombre}</h3>
                    <span class="testimonial-meta">Objetivo: ${t.objetivo}</span>
                    <p class="testimonial-text">"${t.reseña}"</p>
                    <button class="btn-play-video" onclick="reproducirTestimonio('${t.nombre}', 'https://www.youtube.com/embed/dQw4w9WgXcQ')">
                        <i class="fa-solid fa-play"></i> Ver Testimonio
                    </button>
                </div>
            </article>
        `).join("");
    } catch (err) {
        console.warn("NutriFit: Error al inyectar testimonios dinámicos:", err);
    }
}
