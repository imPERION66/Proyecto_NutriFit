// =========================================================================
// LÓGICA DE GESTIÓN DE CARTA (CARTA/PLATOS ADMINISTRADOR) - NUTRIFIT
// =========================================================================

// Variables de estado
let basePlatos = [];       // Platos obtenidos de Supabase o fallback local
let customPlatos = [];     // Platos agregados o editados por el admin
let inventario = {};       // Stock y disponibilidad en tiempo real
let filteredPlatos = [];   // Platos filtrados en la UI

// Búsqueda y Filtros
let searchFilter = "";
let categoryFilter = "todos";
let goalFilter = "todos";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verificar sesión de administrador
  const session = JSON.parse(localStorage.getItem("nf_session") || "null");
  if (!session || session.id_rol !== 1) {
    alert("Acceso denegado. No tienes permisos de administrador.");
    window.location.replace("../index.html");
    return;
  }

  // Cargar datos del admin en el Sidebar
  populateAdminSidebar(session);

  // Inicializar eventos de navegación del sidebar y móviles
  initAdminSidebarEvents();

  // 2. Cargar inventario y platos
  cargarInventarioDesdeStorage();
  await cargarPlatosBase();

  // 3. Inicializar controles y listeners de la vista de menú
  initMenuEventListeners();

  // 4. Renderizar cuadrícula e indicadores
  actualizarVistaCarta();
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

/**
 * Configura los eventos del sidebar (menú hamburguesa y cerrar sesión).
 */
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
 * Lee el inventario (stock y estado) desde LocalStorage.
 */
function cargarInventarioDesdeStorage() {
  inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
}

/**
 * Guarda el inventario en LocalStorage y dispara un evento global de cambio.
 */
function guardarInventarioEnStorage() {
  localStorage.setItem("nf_inventario", JSON.stringify(inventario));
  // Notificar cambios para que otros scripts (cliente) se enteren de inmediato
  window.dispatchEvent(new Event("nf_inventario_modificado"));
}

/**
 * Carga la lista inicial de platos de Supabase, con fallback local.
 */
async function cargarPlatosBase() {
  try {
    if (window.supabaseClient) {
      const { data, error } = await supabaseClient
        .from("platos")
        .select("*")
        .eq("activo", true);
      
      if (error) throw error;
      
      basePlatos = data.map(p => ({
        id: p.id,
        name: p.nombre,
        category: p.categoria,
        goal: p.objetivo,
        kcal: p.kcal,
        proteina: p.proteina,
        carbohidratos: p.carbohidratos,
        precio: parseFloat(p.precio || 0),
        image_path: p.imagen_url
      }));
      console.log("NutriFit Admin: Platos cargados exitosamente desde Supabase.");
    } else {
      throw new Error("Cliente de Supabase no disponible.");
    }
  } catch (err) {
    console.warn("NutriFit Admin: Cargando platos desde fallback local.", err.message);
    if (typeof menuPlatos !== "undefined") {
      basePlatos = menuPlatos.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        goal: p.goal,
        kcal: p.kcal,
        proteina: p.proteina,
        carbohidratos: p.carbohidratos,
        precio: p.precio,
        image_path: p.image_path
      }));
    } else {
      basePlatos = [];
    }
  }

  // Cargar platos personalizados del administrador
  customPlatos = JSON.parse(localStorage.getItem("nf_platos_custom") || "[]");
}

/**
 * Retorna la lista combinada de platos, donde los personalizados sobreescriben a los base por ID.
 */
function obtenerPlatosCombinados() {
  const mapPlatos = new Map();
  basePlatos.forEach(p => mapPlatos.set(p.id, p));
  customPlatos.forEach(p => mapPlatos.set(p.id, p));
  return Array.from(mapPlatos.values());
}

/**
 * Inicializa los eventos del buscador, filtros, formularios y modales.
 */
function initMenuEventListeners() {
  // Filtros de búsqueda
  const searchInput = document.getElementById("admin-search-input");
  const categorySelect = document.getElementById("admin-category-select");
  const goalSelect = document.getElementById("admin-goal-select");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchFilter = e.target.value.trim().toLowerCase();
      actualizarVistaCarta();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      categoryFilter = e.target.value;
      actualizarVistaCarta();
    });
  }

  if (goalSelect) {
    goalSelect.addEventListener("change", (e) => {
      goalFilter = e.target.value;
      actualizarVistaCarta();
    });
  }

  // Modales - Control de apertura
  const btnTriggerAdd = document.getElementById("btn-trigger-add-modal");
  btnTriggerAdd.addEventListener("click", () => abrirModalPlato(null));

  // Modales - Control de cierre
  document.getElementById("btn-close-plato-modal").addEventListener("click", cerrarModalPlato);
  document.getElementById("btn-cancel-plato").addEventListener("click", cerrarModalPlato);
  
  document.getElementById("btn-close-inventario-modal").addEventListener("click", cerrarModalInventario);
  document.getElementById("btn-cancel-inventario").addEventListener("click", cerrarModalInventario);

  // Formulario Plato
  document.getElementById("form-plato").addEventListener("submit", guardarFormularioPlato);

  // Formulario Inventario
  document.getElementById("form-inventario").addEventListener("submit", guardarFormularioInventario);

  // Regla de Negocio Reactiva en Modal Inventario (Stock <-> Estado)
  const stockInput = document.getElementById("inventario-stock");
  const estadoSelect = document.getElementById("inventario-estado");

  stockInput.addEventListener("input", () => {
    const val = parseInt(stockInput.value) || 0;
    if (val === 0) {
      estadoSelect.value = "Agotado";
    } else if (estadoSelect.value === "Agotado" && val > 0) {
      estadoSelect.value = "Disponible";
    }
  });

  estadoSelect.addEventListener("change", () => {
    if (estadoSelect.value === "Agotado") {
      stockInput.value = "0";
    } else if (estadoSelect.value === "Disponible" && parseInt(stockInput.value) === 0) {
      stockInput.value = "10"; // Valor sugerido por defecto si pasa a Disponible
    }
  });
}

/**
 * Abre el modal para agregar un plato (plato = null) o editar (plato = objeto).
 */
function abrirModalPlato(platoId = null) {
  const modal = document.getElementById("modal-plato");
  const form = document.getElementById("form-plato");
  const titulo = document.getElementById("modal-plato-titulo");
  
  form.reset();
  
  if (platoId) {
    const platos = obtenerPlatosCombinados();
    const plato = platos.find(p => p.id === platoId);
    
    if (plato) {
      titulo.textContent = "Editar Plato";
      document.getElementById("form-plato-id").value = plato.id;
      document.getElementById("plato-nombre").value = plato.name;
      document.getElementById("plato-descripcion").value = plato.desc || plato.descripcion || `Delicioso plato de la categoría ${plato.category}.`;
      document.getElementById("plato-precio").value = plato.precio;
      document.getElementById("plato-imagen").value = plato.image_path;
      document.getElementById("plato-categoria").value = plato.category;
      document.getElementById("plato-objetivo").value = plato.goal;
      document.getElementById("plato-kcal").value = plato.kcal;
      document.getElementById("plato-proteina").value = plato.proteina;
      document.getElementById("plato-carbs").value = plato.carbohidratos;
    }
  } else {
    titulo.textContent = "Agregar Nuevo Plato";
    document.getElementById("form-plato-id").value = "";
    document.getElementById("plato-imagen").value = "../assets/img/platos/defecto.jpg";
  }

  modal.classList.add("show");
}

function cerrarModalPlato() {
  document.getElementById("modal-plato").classList.remove("show");
}

/**
 * Abre el modal para actualizar el stock e inventario de un plato.
 */
function abrirModalInventario(platoId) {
  const modal = document.getElementById("modal-inventario");
  const platos = obtenerPlatosCombinados();
  const plato = platos.find(p => p.id === platoId);

  if (plato) {
    document.getElementById("form-inventario-id").value = plato.id;
    document.getElementById("inventario-plato-nombre").value = plato.name;

    const infoStock = inventario[plato.id] || { stock: 10, estado: "Disponible" };
    document.getElementById("inventario-stock").value = infoStock.stock;
    document.getElementById("inventario-estado").value = infoStock.estado;

    modal.classList.add("show");
  }
}

function cerrarModalInventario() {
  document.getElementById("modal-inventario").classList.remove("show");
}

/**
 * Guarda los datos ingresados del plato (Creación o Modificación).
 */
function guardarFormularioPlato(e) {
  e.preventDefault();

  const id = document.getElementById("form-plato-id").value;
  const name = document.getElementById("plato-nombre").value.trim();
  const desc = document.getElementById("plato-descripcion").value.trim();
  const precio = parseFloat(document.getElementById("plato-precio").value);
  const image_path = document.getElementById("plato-imagen").value.trim() || "../assets/img/platos/defecto.jpg";
  const category = document.getElementById("plato-categoria").value;
  const goal = document.getElementById("plato-objetivo").value;
  const kcal = parseInt(document.getElementById("plato-kcal").value) || 0;
  const proteina = parseInt(document.getElementById("plato-proteina").value) || 0;
  const carbohidratos = parseInt(document.getElementById("plato-carbs").value) || 0;

  let platoId = id;
  if (!id) {
    // Es un plato nuevo, generar ID legible
    platoId = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
      
    // Evitar colisión de IDs
    const platosExistentes = obtenerPlatosCombinados();
    if (platosExistentes.some(p => p.id === platoId)) {
      platoId = platoId + "-" + Math.floor(Math.random() * 1000);
    }
  }

  const platoObjeto = {
    id: platoId,
    name,
    desc,
    precio,
    image_path,
    category,
    goal,
    kcal,
    proteina,
    carbohidratos
  };

  if (id) {
    // Editar plato existente en la lista personalizada
    customPlatos = customPlatos.filter(p => p.id !== id);
    customPlatos.push(platoObjeto);
    mostrarToast("Plato actualizado correctamente.");
  } else {
    // Guardar nuevo plato
    customPlatos.push(platoObjeto);
    
    // Inicializar inventario por defecto para el plato nuevo
    inventario[platoId] = { stock: 10, estado: "Disponible" };
    guardarInventarioEnStorage();
    mostrarToast("Plato creado y añadido al catálogo.");
  }

  localStorage.setItem("nf_platos_custom", JSON.stringify(customPlatos));
  
  // Sincronizar inmediatamente
  cargarPlatosBase().then(() => {
    actualizarVistaCarta();
    cerrarModalPlato();
  });
}

/**
 * Guarda los datos de Stock/Disponibilidad en LocalStorage.
 */
function guardarFormularioInventario(e) {
  e.preventDefault();

  const id = document.getElementById("form-inventario-id").value;
  const stock = parseInt(document.getElementById("inventario-stock").value) || 0;
  let estado = document.getElementById("inventario-estado").value;

  // Regla estricta de negocio: Si el stock es 0, forzar estado a Agotado
  if (stock === 0) {
    estado = "Agotado";
  }

  // Guardar en la estructura global
  inventario[id] = { stock, estado };
  guardarInventarioEnStorage();

  mostrarToast("Inventario actualizado correctamente.");
  
  actualizarVistaCarta();
  cerrarModalInventario();
}

/**
 * Renderiza la cuadrícula de platos y actualiza las métricas en la interfaz.
 */
function actualizarVistaCarta() {
  const grid = document.getElementById("platos-admin-grid");
  const elTotal = document.getElementById("metric-total-platos");
  const elDisponibles = document.getElementById("metric-disponibles");
  const elAgotados = document.getElementById("metric-agotados");

  const platos = obtenerPlatosCombinados();

  // Filtrar
  filteredPlatos = platos.filter(plato => {
    const matchesSearch = plato.name.toLowerCase().includes(searchFilter);
    const matchesCategory = categoryFilter === "todos" || plato.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesGoal = goalFilter === "todos" || plato.goal.toLowerCase() === goalFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesGoal;
  });

  // Calcular métricas analíticas basadas en el total de platos reales
  let cantDisponibles = 0;
  let cantAgotados = 0;

  platos.forEach(p => {
    const infoStock = inventario[p.id] || { stock: 10, estado: "Disponible" };
    if (infoStock.estado === "Agotado" || infoStock.stock <= 0) {
      cantAgotados++;
    } else {
      cantDisponibles++;
    }
  });

  if (elTotal) elTotal.textContent = platos.length;
  if (elDisponibles) elDisponibles.textContent = cantDisponibles;
  if (elAgotados) elAgotados.textContent = cantAgotados;

  // Renderizar Tarjetas
  // Mantener el botón 'Agregar Nuevo' al inicio
  const btnAddHtml = `
    <button class="card-add-new-btn" id="btn-trigger-add-modal-onclick" onclick="abrirModalPlato(null)">
      <div class="card-add-new-content">
        <i class="fa-solid fa-circle-plus"></i>
        <span>Agregar Nuevo Plato</span>
      </div>
    </button>
  `;

  const cardsHtml = filteredPlatos.map(plato => {
    const infoStock = inventario[plato.id] || { stock: 10, estado: "Disponible" };
    const isAgotado = infoStock.estado === "Agotado" || infoStock.stock <= 0;
    
    const labelEstado = isAgotado ? "Agotado" : "Disponible";
    const claseEstado = isAgotado ? "agotado" : "disponible";
    const claseAgotadoVisual = isAgotado ? "agotado-visual" : "";

    const descPlato = plato.desc || plato.descripcion || `Exquisito y saludable plato balanceado de NutriFit.`;

    return `
      <article class="plato-admin-card ${claseAgotadoVisual}" data-id="${plato.id}">
        <div class="plato-badges">
          <span class="badge-tipo ${plato.goal.toLowerCase()}">${plato.goal}</span>
          <span class="badge-estado ${claseEstado}">${labelEstado.toUpperCase()}</span>
        </div>
        
        <img src="${plato.image_path}" 
             class="card-img" 
             alt="${plato.name}" 
             onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'">
        
        <div class="card-body">
          <h3>${plato.name}</h3>
          <p class="desc">${descPlato}</p>
          
          <div class="info-row">
            <span class="precio">S/ ${plato.precio.toFixed(2)}</span>
            <span class="stock-text">Stock: <strong>${infoStock.stock} u.</strong></span>
          </div>

          <div class="macros-row">
            <div class="macro-item">
              <span>Kcal</span>
              <strong>${plato.kcal}</strong>
            </div>
            <div class="macro-item">
              <span>Prot</span>
              <strong>${plato.proteina}g</strong>
            </div>
            <div class="macro-item">
              <span>Carbs</span>
              <strong>${plato.carbohidratos}g</strong>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-edit" onclick="abrirModalPlato('${plato.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button class="btn-stock" onclick="abrirModalInventario('${plato.id}')">
              <i class="fa-solid fa-boxes-stacked"></i> Stock/Estado
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.innerHTML = btnAddHtml + cardsHtml;
}

/**
 * Muestra un toast estético en la pantalla del administrador.
 */
function mostrarToast(mensaje, tipo = "success") {
  // Eliminar toast anterior si existe
  const toastExistente = document.querySelector(".toast-notif-dynamic");
  if (toastExistente) {
    toastExistente.remove();
  }

  // Crear elemento de toast
  const toast = document.createElement("div");
  toast.className = `toast-notif-dynamic ${tipo}`;
  
  const icon = tipo === "error" ? "fa-circle-exclamation" : "fa-circle-check";
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${mensaje}</span>
  `;

  document.body.appendChild(toast);

  // Forzar reflow para animación
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // Desvanecer después de 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// Exponer funciones necesarias para eventos inline en el HTML generado
window.abrirModalPlato = abrirModalPlato;
window.abrirModalInventario = abrirModalInventario;
window.actualizarVistaCarta = actualizarVistaCarta;
window.guardarFormularioPlato = guardarFormularioPlato;
window.guardarFormularioInventario = guardarFormularioInventario;
