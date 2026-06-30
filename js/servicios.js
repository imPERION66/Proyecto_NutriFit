// =========================================================================
// LÓGICA DE SERVICIOS Y RECETAS (CLIENTE) - NUTRIFIT
// =========================================================================

// Catálogo de recetas semilla
const recetasSemilla = [
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
    },
    {
        id: "receta-4",
        name: "Snack de Manzana y Maní",
        prepTime: "5 min",
        category: "Snack",
        image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&q=80",
        description: "Rodajas crujientes de manzana verde ácida untadas con una fina capa de mantequilla de maní 100% natural sin azúcar añadida.",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
        id: "receta-5",
        name: "Batido de Proteína de Fresa",
        prepTime: "5 min",
        category: "Desayuno",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80",
        description: "Fresas licuadas con leche de almendras sin azúcar, hielo, semillas de lino molidas y una porción de proteína whey aislada.",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
        id: "receta-6",
        name: "Ensalada de Quinoa y Aguacate",
        prepTime: "15 min",
        category: "Almuerzo",
        image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&q=80",
        description: "Quinoa cocida mezclada con trozos de aguacate, tomate cherry, hojas de espinaca baby y un aderezo ligero de limón y aceite de oliva.",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
];

let currentRecipes = [];
let searchRecipeQuery = "";
let staffNutricionistas = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Sincronizar Precios de Suscripciones
    sincronizarPreciosPlanes();

    // 2. Cargar Recetas de LocalStorage o Semilla
    sincronizarRecetas();

    // 3. Vincular el filtro del buscador de recetas
    const searchInput = document.getElementById("recipe-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchRecipeQuery = e.target.value.trim();
            renderRecipes();
        });
    }

    // 4. Configurar Listeners del Modal de Cita
    initCitaModalListeners();

    // Escuchar eventos globales de sincronización en vivo
    window.addEventListener("nf_precios_planes_modificado", sincronizarPreciosPlanes);
    window.addEventListener("nf_recetas_modificado", sincronizarRecetas);
    window.addEventListener("nf_nutricionistas_modificado", () => {
        staffNutricionistas = JSON.parse(localStorage.getItem("nf_nutricionistas") || "[]");
    });
});

/**
 * Carga los precios dinámicos desde LocalStorage y actualiza el HTML.
 */
function sincronizarPreciosPlanes() {
    const precios = JSON.parse(localStorage.getItem("nf_precios_planes") || '{"semanal": 89.90, "mensual": 299.90}');
    
    // Plan Semanal
    const cardSemanal = document.querySelectorAll(".plan-card")[0];
    if (cardSemanal) {
        const amountEl = cardSemanal.querySelector(".plan-price .amount");
        const centsEl = cardSemanal.querySelector(".plan-price .cents");
        if (amountEl && centsEl) {
            const partes = precios.semanal.toFixed(2).split(".");
            amountEl.textContent = partes[0];
            centsEl.textContent = "." + partes[1];
        }
    }

    // Plan Mensual
    const cardMensual = document.querySelectorAll(".plan-card")[1];
    if (cardMensual) {
        const amountEl = cardMensual.querySelector(".plan-price .amount");
        const centsEl = cardMensual.querySelector(".plan-price .cents");
        if (amountEl && centsEl) {
            const partes = precios.mensual.toFixed(2).split(".");
            amountEl.textContent = partes[0];
            centsEl.textContent = "." + partes[1];
        }
    }
}

/**
 * Carga las recetas de LocalStorage (si existen) o usa la semilla base.
 */
function sincronizarRecetas() {
    const localRecetas = JSON.parse(localStorage.getItem("nf_recetas") || "null");
    if (localRecetas && localRecetas.length > 0) {
        currentRecipes = localRecetas;
    } else {
        currentRecipes = [...recetasSemilla];
        localStorage.setItem("nf_recetas", JSON.stringify(currentRecipes));
    }
    renderRecipes();
}

/**
 * Renderiza dinámicamente las recetas en el grid.
 */
function renderRecipes() {
    const grid = document.getElementById("recipes-grid");
    if (!grid) return;

    const filtered = currentRecipes.filter(receta => {
        const matchesName = receta.name.toLowerCase().includes(searchRecipeQuery.toLowerCase());
        const matchesCategory = receta.category.toLowerCase().includes(searchRecipeQuery.toLowerCase());
        const matchesDescription = (receta.description || "").toLowerCase().includes(searchRecipeQuery.toLowerCase());
        return matchesName || matchesCategory || matchesDescription;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; color: var(--color-text); padding: 40px 0;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 24px; color: var(--color-text-light); margin-bottom: 8px; display: block;"></i>
                No se encontraron recetas que coincidan con tu búsqueda.
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(receta => `
        <article class="recipe-card">
            <div class="recipe-img-container">
                <span class="recipe-badge">${receta.category}</span>
                <img src="${receta.image}" class="recipe-img" alt="${receta.name}" onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=80'">
            </div>
            <div class="recipe-content">
                <div class="recipe-time-row">
                    <i class="fa-regular fa-clock"></i> <span>Prep: ${receta.prepTime}</span>
                </div>
                <h3 class="recipe-title">${receta.name}</h3>
                <p class="recipe-desc" style="font-size: 13px; color: var(--color-text); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">${receta.description || ""}</p>
                <button class="btn-recipe-action" onclick="verReceta('${receta.id}')">Ver Receta Completa</button>
            </div>
        </article>
    `).join("");
}

/**
 * Abre el PDF de la receta completa en una pestaña nueva con opciones de visualización e impresión.
 */
function verReceta(id) {
    if (!checkUserSession()) {
        openLoginModal();
        return;
    }

    const receta = currentRecipes.find(r => r.id === id);
    if (!receta) return;

    if (receta.pdfUrl) {
        // Abre el PDF simulando la ruta del bucket de Supabase
        window.open(receta.pdfUrl, "_blank");
    } else {
        // Enlace alternativo si no tuviera PDF guardado
        window.open(receta.image, "_blank");
    }
}

/**
 * Comprueba sesión
 */
function checkUserSession() {
    return !!localStorage.getItem("nf_session");
}

function openLoginModal() {
    const modalLogin = document.getElementById("modal-login");
    if (modalLogin) {
        modalLogin.classList.add("show");
    }
}

function adquirirPlan(planName) {
    if (!checkUserSession()) {
        openLoginModal();
        return;
    }
    alert(`¡Felicidades por elegir el ${planName}! Un nutricionista de NutriFit se contactará a tu correo electrónico para diseñar tu plan personalizado.`);
}

/**
 * Carga el modal de reserva y aplica el flujo de pasos
 */
function agendarCita() {
    const session = JSON.parse(localStorage.getItem("nf_session") || "null");
    if (!session) {
        openLoginModal();
        return;
    }

    // 1. Rellenar Paso 1 automáticamente
    document.getElementById("cita-nombre").value = session.nombre || "";
    document.getElementById("cita-correo").value = session.email || "";
    document.getElementById("cita-motivo").value = "";

    // Resetear visualización de pasos
    mostrarCitaPaso(1);

    // Abrir Modal
    document.getElementById("modal-agendar-cita").classList.add("show");
}

function mostrarCitaPaso(n) {
    const paso1 = document.getElementById("cita-paso-1");
    const paso2 = document.getElementById("cita-paso-2");
    const lbl1 = document.getElementById("step1-label");
    const lbl2 = document.getElementById("step2-label");

    if (n === 1) {
        paso1.style.display = "block";
        paso2.style.display = "none";
        lbl1.style.color = "var(--color-primary)";
        lbl1.style.fontWeight = "700";
        lbl2.style.color = "var(--color-text-light)";
        lbl2.style.fontWeight = "500";
    } else {
        paso1.style.display = "none";
        paso2.style.display = "block";
        lbl2.style.color = "var(--color-primary)";
        lbl2.style.fontWeight = "700";
        lbl1.style.color = "var(--color-text-light)";
        lbl1.style.fontWeight = "500";

        // Renderizar nutricionistas activos y horarios del Paso 2
        cargarNutricionistasActivosFlujo();
    }
}

/**
 * Renderiza nutricionistas con estado 'Disponible' y llena horarios del primero seleccionado.
 */
function cargarNutricionistasActivosFlujo() {
    const listContainer = document.getElementById("cita-nutricionistas-list");
    const selectHorario = document.getElementById("cita-horario");

    // Cargar del storage
    staffNutricionistas = JSON.parse(localStorage.getItem("nf_nutricionistas") || "[]");
    
    // Filtrar disponibles
    const activos = staffNutricionistas.filter(n => n.estado === "Disponible");

    if (activos.length === 0) {
        listContainer.innerHTML = `<p style="font-size:12.5px; color:#e53935; font-style:italic;">No hay nutricionistas disponibles en este momento.</p>`;
        selectHorario.innerHTML = `<option value="">Sin horarios disponibles</option>`;
        return;
    }

    listContainer.innerHTML = activos.map((n, index) => `
        <label style="display:flex; align-items:center; gap:10px; background-color:#f8fafc; border:1px solid var(--color-border); padding:10px; border-radius:8px; cursor:pointer;">
            <input type="radio" name="select-nutri-radio" value="${n.id}" ${index === 0 ? "checked" : ""} onchange="actualizarHorariosDisponibles('${n.id}')" style="accent-color:var(--color-primary);">
            <div style="width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0;">
                <img src="${n.imagen}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="text-align:left;">
                <h4 style="font-size:13.5px; font-weight:700; margin:0; color:var(--color-dark);">${n.nombre}</h4>
                <p style="font-size:11px; margin:0; color:var(--color-primary-text);">${n.especialidad}</p>
            </div>
        </label>
    `).join("");

    // Cargar horarios del primer nutricionista por defecto
    actualizarHorariosDisponibles(activos[0].id);
}

/**
 * Actualiza el select box de horarios libres de un nutricionista en específico.
 */
function actualizarHorariosDisponibles(nutriId) {
    const selectHorario = document.getElementById("cita-horario");
    const nutri = staffNutricionistas.find(n => n.id === nutriId);

    if (nutri && nutri.horarios && nutri.horarios.length > 0) {
        selectHorario.innerHTML = nutri.horarios.map(h => `
            <option value="${h}">${h}</option>
        `).join("");
    } else {
        selectHorario.innerHTML = `<option value="">No registra bloques libres</option>`;
    }
}

function initCitaModalListeners() {
    // Cerrar
    document.getElementById("btn-close-cita-modal").addEventListener("click", cerrarCitaModal);
    
    // Navegación de pasos
    document.getElementById("btn-cita-siguiente").addEventListener("click", () => {
        const nombre = document.getElementById("cita-nombre").value.trim();
        const correo = document.getElementById("cita-correo").value.trim();
        if (nombre && correo) {
            mostrarCitaPaso(2);
        } else {
            alert("Por favor, ingresa tu nombre y correo.");
        }
    });

    document.getElementById("btn-cita-atras").addEventListener("click", () => {
        mostrarCitaPaso(1);
    });

    // Form Submit
    document.getElementById("form-agendar-cita").addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("cita-nombre").value;
        const hora = document.getElementById("cita-horario").value;
        const selectNutri = document.querySelector('input[name="select-nutri-radio"]:checked');

        if (!hora) {
            alert("Selecciona un horario disponible.");
            return;
        }

        const nutri = staffNutricionistas.find(n => n.id === selectNutri.value);

        alert(`¡Cita Reservada con éxito!\n\nPaciente: ${nombre}\nProfesional: ${nutri.nombre}\nHorario: ${hora}\n\nSe ha enviado el enlace de Google Meet de la cita a tu correo electrónico.`);
        
        cerrarCitaModal();
    });
}

function cerrarCitaModal() {
    document.getElementById("modal-agendar-cita").classList.remove("show");
}

function irACalculadora() {
    window.location.href = "perfil.html";
}

// Exponer funciones necesarias globalmente
window.adquirirPlan = adquirirPlan;
window.agendarCita = agendarCita;
window.verReceta = verReceta;
window.irACalculadora = irACalculadora;
window.actualizarHorariosDisponibles = actualizarHorariosDisponibles;
