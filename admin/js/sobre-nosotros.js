// =========================================================================
// LÓGICA DE GESTIÓN DE SOBRE NOSOTROS (ADMINISTRADOR) - NUTRIFIT
// =========================================================================

// Variables de estado en memoria
let editorialInfo = {};
let testimonios = [];

// Semillas por defecto para primer inicio o fallback
const editorialSemilla = {
  mision_titulo: "Transformar vidas a través de la nutrición inteligente",
  mision_texto: "Nuestra misión es hacer de la alimentación saludable una experiencia deliciosa, accesible y personalizada. Creemos que comer sano no debe ser aburrido ni restrictivo, por lo que creamos recetas gourmet balanceadas por nutricionistas expertos que facilitan cumplir tus objetivos físicos sin sacrificar el sabor.",
  vision_titulo: "Ser el referente líder en bienestar personalizado",
  vision_texto: "Nos proyectamos como la plataforma líder en nutrición gourmet personalizada del país, logrando integrar tecnología, asesoramiento médico directo y cocina de alta calidad para acompañar a nuestra comunidad en cada paso de su cambio de vida. Buscamos democratizar el acceso a un estilo de vida saludable y sostenible.",
  valores_titulo: "Pasión por el bienestar y la alta cocina",
  valores_texto: "NutriFit nació de la visión de nuestro fundador, un apasionado chef y promotor del fitness. Tras identificar lo difícil que resultaba encontrar menús balanceados con macros precisos y gran sabor en el día a día, decidió reunir a un equipo élite de nutricionistas y cocineros para crear una solución gastronómica saludable y científica."
};

const testimoniosSemilla = [
  {
    id: "testi-1",
    nombre: "Valeria Rodríguez",
    objetivo: "Bajar de Peso (-12 kg)",
    reseña: "La comida de NutriFit no solo me ayudó a bajar mis medidas de manera rápida, sino que me enseñó a comer rico y saludable sin pasar hambre.",
    imagen: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    estado: "Publicado"
  },
  {
    id: "testi-2",
    nombre: "Carlos Pérez",
    objetivo: "Aumento de Masa (+5 kg)",
    reseña: "Como deportista, los macros exactos en cada comida son clave. Los almuerzos y cenas de NutriFit me permitieron subir peso limpio sin complicaciones.",
    imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    estado: "Publicado"
  },
  {
    id: "testi-3",
    nombre: "Andrea Solano",
    objetivo: "Estilo de Vida Saludable",
    reseña: "La practicidad de recibir mis comidas balanceadas en la oficina resolvió mi falta de tiempo. Me siento con más energía y ligereza durante el día.",
    imagen: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    estado: "Publicado"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Verificar sesión de administrador
  const session = JSON.parse(localStorage.getItem("nf_session") || "null");
  if (!session || session.id_rol !== 1) {
    alert("Acceso denegado. No tienes permisos de administrador.");
    window.location.replace("../index.html");
    return;
  }

  // Cargar datos en Sidebar
  populateAdminSidebar(session);
  initAdminSidebarEvents();

  // 2. Inicializar Datos desde LocalStorage
  inicializarDatosStorage();

  // 3. Renderizar Módulos
  renderizarEditorial();
  renderizarTestimonios();

  // 4. Registrar Event Listeners
  initSobreNosotrosEventListeners();
});

/**
 * Muestra los datos de perfil del administrador en el sidebar.
 */
function populateAdminSidebar(session) {
  const nameEl = document.getElementById("user-name");
  const emailEl = document.getElementById("user-email");
  const avatarEl = document.getElementById("user-avatar");
  if (nameEl) nameEl.textContent = session.nombre || "Administrador";
  if (emailEl) emailEl.textContent = session.email || "admin@nutrifit.com";
  if (avatarEl) avatarEl.textContent = (session.nombre || "A").charAt(0).toUpperCase();
}

function initAdminSidebarEvents() {
  const btnMenu = document.getElementById("btn-menu");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("btn-logout-sidebar");

  if (btnMenu && sidebar && overlay) {
    btnMenu.addEventListener("click", () => {
      sidebar.classList.add("show");
      overlay.classList.add("show");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("show");
      overlay.classList.remove("show");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("nf_session");
      window.location.replace("../index.html");
    });
  }
}

/**
 * Carga e inicializa la información en LocalStorage
 */
function inicializarDatosStorage() {
  // Editorial (Misión, Visión, Valores)
  editorialInfo = JSON.parse(localStorage.getItem("nf_editorial") || JSON.stringify(editorialSemilla));
  localStorage.setItem("nf_editorial", JSON.stringify(editorialInfo));

  // Testimonios
  testimonios = JSON.parse(localStorage.getItem("nf_testimonios") || JSON.stringify(testimoniosSemilla));
  localStorage.setItem("nf_testimonios", JSON.stringify(testimonios));
}

/**
 * Guarda la información editorial en LocalStorage y despacha evento
 */
function guardarEditorialStorage() {
  localStorage.setItem("nf_editorial", JSON.stringify(editorialInfo));
  window.dispatchEvent(new Event("nf_editorial_modificado"));
}

/**
 * Guarda los testimonios en LocalStorage y despacha evento
 */
function guardarTestimoniosStorage() {
  localStorage.setItem("nf_testimonios", JSON.stringify(testimonios));
  window.dispatchEvent(new Event("nf_testimonios_modificado"));
}

// ========================================== SUBMÓDULO A: EDITORIAL INSTITUCIONAL ==========================================
function renderizarEditorial() {
  // Renderizar a la vista estática
  document.getElementById("view-mision-titulo").textContent = editorialInfo.mision_titulo;
  document.getElementById("view-mision-texto").textContent = editorialInfo.mision_texto;
  document.getElementById("view-vision-titulo").textContent = editorialInfo.vision_titulo;
  document.getElementById("view-vision-texto").textContent = editorialInfo.vision_texto;
  document.getElementById("view-valores-titulo").textContent = editorialInfo.valores_titulo;
  document.getElementById("view-valores-texto").textContent = editorialInfo.valores_texto;

  // Llenar campos del formulario
  document.getElementById("edit-mision-titulo").value = editorialInfo.mision_titulo;
  document.getElementById("edit-mision-texto").value = editorialInfo.mision_texto;
  document.getElementById("edit-vision-titulo").value = editorialInfo.vision_titulo;
  document.getElementById("edit-vision-texto").value = editorialInfo.vision_texto;
  document.getElementById("edit-valores-titulo").value = editorialInfo.valores_titulo;
  document.getElementById("edit-valores-texto").value = editorialInfo.valores_texto;
}

function habilitarEdicionEditorial() {
  document.getElementById("editorial-view-container").style.display = "none";
  document.getElementById("editorial-form-container").style.display = "block";
  
  document.getElementById("btn-edit-editorial").style.display = "none";
  document.getElementById("editorial-edit-actions").style.display = "flex";
}

function deshabilitarEdicionEditorial(cancelar = false) {
  if (cancelar) {
    // Restablecer valores de edición con lo que hay en memoria
    renderizarEditorial();
  }

  document.getElementById("editorial-view-container").style.display = "grid";
  document.getElementById("editorial-form-container").style.display = "none";
  
  document.getElementById("btn-edit-editorial").style.display = "flex";
  document.getElementById("editorial-edit-actions").style.display = "none";
}

function guardarEditorialSubmit() {
  const form = document.getElementById("editorial-form-container");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  editorialInfo.mision_titulo = document.getElementById("edit-mision-titulo").value.trim();
  editorialInfo.mision_texto = document.getElementById("edit-mision-texto").value.trim();
  editorialInfo.vision_titulo = document.getElementById("edit-vision-titulo").value.trim();
  editorialInfo.vision_texto = document.getElementById("edit-vision-texto").value.trim();
  editorialInfo.valores_titulo = document.getElementById("edit-valores-titulo").value.trim();
  editorialInfo.valores_texto = document.getElementById("edit-valores-texto").value.trim();

  guardarEditorialStorage();
  renderizarEditorial();
  deshabilitarEdicionEditorial();
  mostrarToast("Información institucional actualizada correctamente.");
}

// ========================================== SUBMÓDULO B: TESTIMONIOS CASOS DE ÉXITO ==========================================
function renderizarTestimonios() {
  const grid = document.getElementById("testimonials-admin-grid");
  if (!grid) return;

  // 1. Tarjeta inicial estática para agregar nuevo caso
  const addCardHtml = `
    <article class="testimonial-admin-card testimonial-card-add" onclick="abrirModalTestimonio()">
      <div class="testimonial-card-add-content">
        <i class="fa-solid fa-plus add-icon"></i>
        <span>Agregar Nuevo Caso de Éxito</span>
      </div>
    </article>
  `;

  // 2. Mapear testimonios existentes en memoria
  const cardsHtml = testimonios.map(t => {
    const isOculto = t.estado === "Oculto";
    const claseOcultoCard = isOculto ? "oculto" : "";
    const claseBadgeEstado = isOculto ? "oculto" : "publicado";
    const textoBotonEstado = isOculto ? "Publicar" : "Ocultar";
    const claseBotonEstado = isOculto ? "oculto" : "publicado";
    const iconBotonEstado = isOculto ? "fa-eye" : "fa-eye-slash";

    return `
      <article class="testimonial-admin-card ${claseOcultoCard}" data-id="${t.id}">
        <span class="testimonial-status-badge ${claseBadgeEstado}">${t.estado}</span>
        
        <div class="testimonial-profile-row">
          <div class="testimonial-avatar">
            <img src="${t.imagen}" alt="Foto ${t.nombre}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/147/147144.png'">
          </div>
          <div class="testimonial-meta-info">
            <h4>${t.nombre}</h4>
            <span class="testimonial-goal-badge">${t.objetivo}</span>
          </div>
        </div>

        <p class="testimonial-quote">"${t.reseña}"</p>

        <div class="testimonial-card-actions">
          <button class="btn-testimonial-edit" onclick="abrirModalTestimonio('${t.id}')" title="Editar Testimonio">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          
          <button class="btn-testimonial-status ${claseBotonEstado}" onclick="toggleEstadoTestimonio('${t.id}')" title="Cambiar visibilidad">
            <i class="fa-solid ${iconBotonEstado}"></i> ${textoBotonEstado}
          </button>

          <button class="btn-testimonial-delete" onclick="eliminarTestimonio('${t.id}')" title="Eliminar Testimonio">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </article>
    `;
  }).join("");

  grid.innerHTML = addCardHtml + cardsHtml;
}

function abrirModalTestimonio(id = null) {
  const modal = document.getElementById("modal-testimonio");
  const form = document.getElementById("form-testimonio");
  const titulo = document.getElementById("modal-testimonio-titulo");

  form.reset();

  if (id) {
    const t = testimonios.find(item => item.id === id);
    if (t) {
      titulo.textContent = "Editar Caso de Éxito";
      document.getElementById("form-testimonio-id").value = t.id;
      document.getElementById("testimonio-nombre").value = t.nombre;
      document.getElementById("testimonio-objetivo").value = t.objetivo;
      document.getElementById("testimonio-reseña").value = t.reseña;
      document.getElementById("testimonio-imagen").value = t.imagen;
    }
  } else {
    titulo.textContent = "Agregar Nuevo Caso de Éxito";
    document.getElementById("form-testimonio-id").value = "";
    document.getElementById("testimonio-imagen").value = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80";
  }

  modal.classList.add("show");
}

function cerrarModalTestimonio() {
  document.getElementById("modal-testimonio").classList.remove("show");
}

function guardarTestimonioSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("form-testimonio-id").value;
  const nombre = document.getElementById("testimonio-nombre").value.trim();
  const objetivo = document.getElementById("testimonio-objetivo").value.trim();
  const reseña = document.getElementById("testimonio-reseña").value.trim();
  const imagen = document.getElementById("testimonio-imagen").value.trim() || "https://cdn-icons-png.flaticon.com/512/147/147144.png";

  let testiId = id;
  let estadoActual = "Publicado"; // Por defecto al crear nuevo

  if (!id) {
    testiId = "testi-" + Date.now();
  } else {
    const testiExistente = testimonios.find(t => t.id === id);
    if (testiExistente) estadoActual = testiExistente.estado;
  }

  const testiObj = {
    id: testiId,
    nombre,
    objetivo,
    reseña,
    imagen,
    estado: estadoActual
  };

  if (id) {
    testimonios = testimonios.map(t => t.id === id ? testiObj : t);
    mostrarToast("Caso de éxito actualizado correctamente.");
  } else {
    testimonios.push(testiObj);
    mostrarToast("Nuevo caso de éxito registrado en el sistema.");
  }

  guardarTestimoniosStorage();
  renderizarTestimonios();
  cerrarModalTestimonio();
}

function toggleEstadoTestimonio(id) {
  const t = testimonios.find(item => item.id === id);
  if (t) {
    t.estado = (t.estado === "Publicado") ? "Oculto" : "Publicado";
    guardarTestimoniosStorage();
    renderizarTestimonios();
    
    const mensaje = (t.estado === "Publicado") 
      ? `El testimonio de ${t.nombre} ahora es visible en la web.` 
      : `El testimonio de ${t.nombre} ha sido ocultado para los clientes.`;
    
    mostrarToast(mensaje, t.estado === "Publicado" ? "success" : "warning");
  }
}

function eliminarTestimonio(id) {
  const t = testimonios.find(item => item.id === id);
  if (t) {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el testimonio de ${t.nombre}?`)) {
      testimonios = testimonios.filter(item => item.id !== id);
      guardarTestimoniosStorage();
      renderizarTestimonios();
      mostrarToast("Testimonio eliminado correctamente.", "error");
    }
  }
}

// ========================================== LISTENERS GENERALES ==========================================
function initSobreNosotrosEventListeners() {
  // Listeners de sección editorial
  document.getElementById("btn-edit-editorial").addEventListener("click", habilitarEdicionEditorial);
  document.getElementById("btn-cancel-editorial").addEventListener("click", () => deshabilitarEdicionEditorial(true));
  document.getElementById("btn-save-editorial").addEventListener("click", guardarEditorialSubmit);

  // Listeners de modal testimonios
  document.getElementById("btn-close-testimonio-modal").addEventListener("click", cerrarModalTestimonio);
  document.getElementById("btn-cancel-testimonio").addEventListener("click", cerrarModalTestimonio);
  document.getElementById("form-testimonio").addEventListener("submit", guardarTestimonioSubmit);
}

// Toast de notificación dinámica
function mostrarToast(mensaje, tipo = "success") {
  const pre = document.querySelector(".toast-notif-dynamic");
  if (pre) pre.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notif-dynamic ${tipo}`;
  let icon = "fa-circle-check";
  
  if (tipo === "error") {
    icon = "fa-circle-exclamation";
  } else if (tipo === "warning") {
    icon = "fa-triangle-exclamation";
  }
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${mensaje}</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Exponer funciones globales necesarias para interactuar inline
window.abrirModalTestimonio = abrirModalTestimonio;
window.toggleEstadoTestimonio = toggleEstadoTestimonio;
window.eliminarTestimonio = eliminarTestimonio;
