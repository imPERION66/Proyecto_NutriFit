// =========================================================================
// LÓGICA DE GESTIÓN DE SERVICIOS (ADMINISTRADOR) - NUTRIFIT
// =========================================================================

// Variables de estado
let suscripciones = [];
let nutricionistas = [];
let recetas = [];
let preciosPlanes = { semanal: 89.90, mensual: 299.90 };

// Horarios en edición (temporal dentro del modal)
let horariosEdicion = [];

// Clientes suscritos semilla
const suscripcionesFallback = [
  { id: "sub-1", cliente: "Juan Pérez", plan: "Mensual Premium", inicio: "2026-06-01", fin: "2026-07-01", estado: "Activo" },
  { id: "sub-2", cliente: "Carlos Mendoza", plan: "Semanal Fit", inicio: "2026-06-25", fin: "2026-07-02", estado: "Activo" },
  { id: "sub-3", cliente: "María Rodríguez", plan: "Mensual Premium", inicio: "2026-05-01", fin: "2026-06-01", estado: "Vencido" },
  { id: "sub-4", cliente: "Ana Gómez", plan: "Semanal Fit", inicio: "2026-06-15", fin: "2026-06-22", estado: "Vencido" }
];

// Nutricionistas por defecto
const nutricionistasSemilla = [
  {
    id: "nutri-1",
    nombre: "Dr. Alberto Santos",
    especialidad: "Nutrición Deportiva",
    imagen: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80",
    estado: "Disponible",
    horarios: ["09:00 - 10:00", "10:00 - 11:00", "15:00 - 16:00"]
  },
  {
    id: "nutri-2",
    nombre: "Dra. Laura Méndez",
    especialidad: "Nutrición Clínica",
    imagen: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&q=80",
    estado: "Disponible",
    horarios: ["11:00 - 12:00", "12:00 - 13:00", "16:00 - 17:00"]
  },
  {
    id: "nutri-3",
    nombre: "Dra. Sofía Valdivia",
    especialidad: "Control de Peso",
    imagen: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80",
    estado: "No Disponible",
    horarios: ["09:00 - 10:00", "14:00 - 15:00"]
  }
];

// Recetas base (semilla original de servicios)
const recetasBase = [
  {
    id: "receta-1",
    name: "Bowl de Avena Energético",
    prepTime: "10 min",
    category: "Desayuno",
    image: "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=500&q=80",
    description: "Avena cocida en leche de almendras, decorada con arándanos frescos, plátano en rodajas, semillas de chía y un toque de miel orgánica.",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: "receta-2",
    name: "Tacos de Lechuga con Pollo",
    prepTime: "15 min",
    category: "Almuerzo",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    description: "Hojas grandes de lechuga romana rellenas con pechuga de pollo magra deshilachada, aguacate picado, cebolla morada y pico de gallo.",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: "receta-3",
    name: "Salmón al Vapor con Vegetales",
    prepTime: "20 min",
    category: "Cena",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80",
    description: "Filete de salmón fresco cocinado al vapor, sazonado con limón y finas hierbas, acompañado de brócoli y zanahorias baby.",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
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

  // 3. Renderizar Submódulos
  renderizarSuscripciones();
  renderizarNutricionistas();
  renderizarRecetas();

  // 4. Inicializar Listeners y Controles
  initServiciosEventListeners();
});

/**
 * Muestra los datos de perfil del administrador.
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
 * Lee e inicializa los estados y configuraciones en LocalStorage.
 */
function inicializarDatosStorage() {
  // Precios
  preciosPlanes = JSON.parse(localStorage.getItem("nf_precios_planes") || JSON.stringify(preciosPlanes));
  document.getElementById("precio-semanal").value = preciosPlanes.semanal.toFixed(2);
  document.getElementById("precio-mensual").value = preciosPlanes.mensual.toFixed(2);

  // Suscripciones
  suscripciones = suscripcionesFallback; // Generalmente local o cargadas de DB

  // Staff Nutricionistas
  nutricionistas = JSON.parse(localStorage.getItem("nf_nutricionistas") || JSON.stringify(nutricionistasSemilla));
  localStorage.setItem("nf_nutricionistas", JSON.stringify(nutricionistas));

  // Recetas
  recetas = JSON.parse(localStorage.getItem("nf_recetas") || JSON.stringify(recetasBase));
  localStorage.setItem("nf_recetas", JSON.stringify(recetas));
}

/**
 * Guarda los nutricionistas en LocalStorage y notifica
 */
function guardarNutricionistas() {
  localStorage.setItem("nf_nutricionistas", JSON.stringify(nutricionistas));
  window.dispatchEvent(new Event("nf_nutricionistas_modificado"));
}

/**
 * Guarda las recetas en LocalStorage y notifica
 */
function guardarRecetas() {
  localStorage.setItem("nf_recetas", JSON.stringify(recetas));
  window.dispatchEvent(new Event("nf_recetas_modificado"));
}

/**
 * Registra listeners de pestañas, modales y formularios.
 */
function initServiciosEventListeners() {
  // Control de pestañas (Tabs)
  const tabs = document.querySelectorAll(".btn-tab-servicios");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetTab = tab.dataset.tab;
      document.querySelectorAll(".submodule-content").forEach(content => {
        content.classList.remove("active");
      });
      document.getElementById(`tab-${targetTab}`).classList.add("active");
    });
  });

  // Formulario Precios
  document.getElementById("form-pricing-plans").addEventListener("submit", (e) => {
    e.preventDefault();
    preciosPlanes.semanal = parseFloat(document.getElementById("precio-semanal").value) || 89.90;
    preciosPlanes.mensual = parseFloat(document.getElementById("precio-mensual").value) || 299.90;

    localStorage.setItem("nf_precios_planes", JSON.stringify(preciosPlanes));
    window.dispatchEvent(new Event("nf_precios_planes_modificado"));
    mostrarToast("Precios de suscripción actualizados.");
  });

  // Modal Horarios - Cierre
  document.getElementById("btn-close-horarios-modal").addEventListener("click", cerrarModalHorarios);
  document.getElementById("btn-cancel-horarios").addEventListener("click", cerrarModalHorarios);
  document.getElementById("form-editar-horarios").addEventListener("submit", guardarHorariosSubmit);

  // Modal Agregar Nutricionista - Eventos
  document.getElementById("btn-close-agregar-nutri-modal").addEventListener("click", cerrarModalAgregarNutri);
  document.getElementById("btn-cancel-agregar-nutri").addEventListener("click", cerrarModalAgregarNutri);
  document.getElementById("form-agregar-nutricionista").addEventListener("submit", guardarAgregarNutriSubmit);

  // Añadir hora chip
  document.getElementById("btn-add-chip-hour").addEventListener("click", agregarChipHoraAction);

  // Modal Recetas - Cierre
  document.getElementById("btn-trigger-receta-modal").addEventListener("click", () => abrirModalReceta());
  document.getElementById("btn-close-receta-modal").addEventListener("click", cerrarModalReceta);
  document.getElementById("btn-cancel-receta").addEventListener("click", cerrarModalReceta);
  document.getElementById("form-receta").addEventListener("submit", guardarRecetaSubmit);
}

// ========================================== SUBMÓDULO A: SUSCRIPCIONES ==========================================
function renderizarSuscripciones() {
  const tbody = document.getElementById("suscripciones-table-body");
  if (!tbody) return;

  tbody.innerHTML = suscripciones.map(s => {
    const claseEstado = (s.estado === "Activo") ? "activo" : "vencido";
    return `
      <tr>
        <td style="font-weight: 700; color: var(--color-dark);">${s.cliente}</td>
        <td>${s.plan}</td>
        <td>${s.inicio}</td>
        <td>${s.fin}</td>
        <td>
          <span class="badge-sub-estado ${claseEstado}">${s.estado}</span>
        </td>
      </tr>
    `;
  }).join("");
}

// ========================================== SUBMÓDULO B: NUTRICIONISTAS STAFF ==========================================
function renderizarNutricionistas() {
  const grid = document.getElementById("nutricionistas-grid");
  if (!grid) return;

  const addCardHtml = `
    <article class="nutri-card nutri-card-add" onclick="abrirModalAgregarNutri()">
      <div class="nutri-card-add-content">
        <i class="fa-solid fa-plus add-icon"></i>
        <span>Agregar Nuevo Nutricionista</span>
      </div>
    </article>
  `;

  const cardsHtml = nutricionistas.map(n => {
    const labelEstado = (n.estado === "Disponible") ? "Disponible" : "No Disponible";
    const claseEstado = (n.estado === "Disponible") ? "disponible" : "no-disponible";
    const labelBotonToggle = (n.estado === "Disponible") ? "Marcar No Disponible" : "Marcar Disponible";
    const claseBotonToggle = (n.estado === "Disponible") ? "active" : "";

    return `
      <article class="nutri-card" data-id="${n.id}">
        <div class="nutri-avatar-container">
          <img src="${n.imagen}" alt="${n.nombre}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/147/147144.png'">
        </div>
        <h3>${n.nombre}</h3>
        <span class="nutri-specialty">${n.especialidad}</span>
        <div>
          <span class="nutri-status-badge ${claseEstado}">${labelEstado}</span>
        </div>
        <div class="nutri-card-actions">
          <button class="btn-toggle-nutri-status ${claseBotonToggle}" onclick="toggleStatusNutricionista('${n.id}')">
            <i class="fa-solid fa-power-off"></i> ${labelBotonToggle}
          </button>
          <button class="btn-edit-horarios" onclick="abrirModalHorarios('${n.id}')">
            <i class="fa-solid fa-calendar-clock"></i> Editar Horarios
          </button>
        </div>
      </article>
    `;
  }).join("");

  grid.innerHTML = addCardHtml + cardsHtml;
}

function toggleStatusNutricionista(id) {
  const nutri = nutricionistas.find(n => n.id === id);
  if (nutri) {
    nutri.estado = (nutri.estado === "Disponible") ? "No Disponible" : "Disponible";
    guardarNutricionistas();
    renderizarNutricionistas();
    mostrarToast(`${nutri.nombre} ahora está ${nutri.estado.toLowerCase()}.`);
  }
}

/**
 * Abre el modal para editar horarios.
 */
function abrirModalHorarios(id) {
  const modal = document.getElementById("modal-editar-horarios");
  const nutri = nutricionistas.find(n => n.id === id);

  if (nutri) {
    document.getElementById("horarios-nutricionista-id").value = id;
    document.getElementById("horarios-nutricionista-nombre").value = nutri.nombre;
    
    // Clonar lista de horarios en el buffer temporal
    horariosEdicion = [...(nutri.horarios || [])];
    
    renderizarChipsHorarios();
    modal.classList.add("show");
  }
}

function renderizarChipsHorarios() {
  const container = document.getElementById("horarios-chips-container");
  if (!container) return;

  if (horariosEdicion.length === 0) {
    container.innerHTML = `<span style="font-size:12px; color:var(--color-text-light); font-style:italic;">No hay horarios registrados.</span>`;
    return;
  }

  container.innerHTML = horariosEdicion.map((hora, idx) => `
    <span class="chip-item">
      ${hora}
      <button type="button" class="btn-remove-chip" onclick="removerChipHora(${idx})">&times;</button>
    </span>
  `).join("");
}

function agregarChipHoraAction() {
  const input = document.getElementById("nuevo-bloque-hora");
  const valor = input.value.trim();

  if (!valor) return;
  if (horariosEdicion.includes(valor)) {
    mostrarToast("Ese bloque horario ya está registrado.", "error");
    return;
  }

  horariosEdicion.push(valor);
  input.value = "";
  renderizarChipsHorarios();
}

function removerChipHora(index) {
  horariosEdicion.splice(index, 1);
  renderizarChipsHorarios();
}

function cerrarModalHorarios() {
  document.getElementById("modal-editar-horarios").classList.remove("show");
}

function abrirModalAgregarNutri() {
  const modal = document.getElementById("modal-agregar-nutricionista");
  const form = document.getElementById("form-agregar-nutricionista");
  form.reset();
  modal.classList.add("show");
}

function cerrarModalAgregarNutri() {
  document.getElementById("modal-agregar-nutricionista").classList.remove("show");
}

function guardarAgregarNutriSubmit(e) {
  e.preventDefault();
  const nombre = document.getElementById("nutri-nombre").value.trim();
  const especialidad = document.getElementById("nutri-especialidad").value.trim();
  const imagen = document.getElementById("nutri-imagen").value.trim() || "https://cdn-icons-png.flaticon.com/512/147/147144.png";
  const estado = document.getElementById("nutri-estado").value;

  const nuevoNutri = {
    id: "nutri-" + Date.now(),
    nombre,
    especialidad,
    imagen,
    estado,
    horarios: []
  };

  nutricionistas.push(nuevoNutri);
  guardarNutricionistas();
  renderizarNutricionistas();
  cerrarModalAgregarNutri();
  mostrarToast("Nuevo nutricionista registrado con éxito.");
}

function guardarHorariosSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("horarios-nutricionista-id").value;
  const nutri = nutricionistas.find(n => n.id === id);

  if (nutri) {
    nutri.horarios = [...horariosEdicion];
    guardarNutricionistas();
    cerrarModalHorarios();
    mostrarToast(`Horarios actualizados para ${nutri.nombre}.`);
  }
}

// ========================================== SUBMÓDULO C: RECETAS ==========================================
function renderizarRecetas() {
  const grid = document.getElementById("recetas-admin-grid");
  if (!grid) return;

  // Botón inicial de agregar receta
  const btnAddHtml = `
    <button class="card-add-new-btn" onclick="abrirModalReceta()">
      <div class="card-add-new-content">
        <i class="fa-solid fa-circle-plus"></i>
        <span>Agregar Nueva Receta</span>
      </div>
    </button>
  `;

  const cardsHtml = recetas.map(r => {
    const desc = r.description || "Deliciosa receta nutricional para preparar en casa.";
    const pdfLabel = r.pdfUrl ? "PDF Adjunto" : "Sin documento";

    return `
      <article class="receta-admin-card" data-id="${r.id}">
        <div class="receta-badges-row">
          <span class="badge-receta-cat">${r.category}</span>
        </div>
        <img src="${r.image}" class="receta-card-img" alt="${r.name}" onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=80'">
        <div class="receta-card-body">
          <h3>${r.name}</h3>
          <p class="desc">${desc}</p>
          <div class="receta-info-row">
            <span>Prep: <strong>${r.prepTime}</strong></span>
            <span>Ref: <strong>${pdfLabel}</strong></span>
          </div>
          <div class="receta-card-actions">
            <button class="btn-receta-edit" onclick="abrirModalReceta('${r.id}')">
              <i class="fa-solid fa-pen"></i> Editar
            </button>
            <button class="btn-receta-delete" onclick="eliminarReceta('${r.id}')">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.innerHTML = btnAddHtml + cardsHtml;
}

function abrirModalReceta(id = null) {
  const modal = document.getElementById("modal-receta");
  const form = document.getElementById("form-receta");
  const titulo = document.getElementById("modal-receta-titulo");

  form.reset();

  if (id) {
    const receta = recetas.find(r => r.id === id);
    if (receta) {
      titulo.textContent = "Editar Receta";
      document.getElementById("form-receta-id").value = receta.id;
      document.getElementById("receta-nombre").value = receta.name;
      document.getElementById("receta-categoria").value = receta.category;
      document.getElementById("receta-tiempo").value = receta.prepTime;
      document.getElementById("receta-descripcion").value = receta.description;
      document.getElementById("receta-imagen-url").value = receta.image;
      document.getElementById("receta-pdf-url").value = receta.pdfUrl || "";
    }
  } else {
    titulo.textContent = "Agregar Nueva Receta";
    document.getElementById("form-receta-id").value = "";
    document.getElementById("receta-imagen-url").value = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=80";
    document.getElementById("receta-pdf-url").value = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  }

  modal.classList.add("show");
}

function cerrarModalReceta() {
  document.getElementById("modal-receta").classList.remove("show");
}

function guardarRecetaSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("form-receta-id").value;
  const name = document.getElementById("receta-nombre").value.trim();
  const category = document.getElementById("receta-categoria").value;
  const prepTime = document.getElementById("receta-tiempo").value.trim();
  const description = document.getElementById("receta-descripcion").value.trim();
  const image = document.getElementById("receta-imagen-url").value.trim() || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=80";
  const pdfUrl = document.getElementById("receta-pdf-url").value.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  let recetaId = id;
  if (!id) {
    recetaId = "receta-" + Date.now();
  }

  const recetaObj = {
    id: recetaId,
    name,
    category,
    prepTime,
    description,
    image,
    pdfUrl
  };

  if (id) {
    recetas = recetas.map(r => r.id === id ? recetaObj : r);
    mostrarToast("Receta actualizada con éxito.");
  } else {
    recetas.push(recetaObj);
    mostrarToast("Nueva receta publicada en la comunidad.");
  }

  guardarRecetas();
  renderizarRecetas();
  cerrarModalReceta();
}

function eliminarReceta(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta receta?")) {
    recetas = recetas.filter(r => r.id !== id);
    guardarRecetas();
    renderizarRecetas();
    mostrarToast("Receta eliminada correctamente.", "error");
  }
}

// Toast de notificación
function mostrarToast(mensaje, tipo = "success") {
  const pre = document.querySelector(".toast-notif-dynamic");
  if (pre) pre.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notif-dynamic ${tipo}`;
  const icon = tipo === "error" ? "fa-circle-exclamation" : "fa-circle-check";
  
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

// Exponer funciones necesarias
window.toggleStatusNutricionista = toggleStatusNutricionista;
window.abrirModalHorarios = abrirModalHorarios;
window.removerChipHora = removerChipHora;
window.abrirModalReceta = abrirModalReceta;
window.eliminarReceta = eliminarReceta;
window.abrirModalAgregarNutri = abrirModalAgregarNutri;
