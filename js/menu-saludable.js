// =========================================================================
// LÓGICA DE LA CARTA SALUDABLE (CATÁLOGO DINÁMICO) - NUTRIFIT
// =========================================================================

// Variables de estado del catálogo
let catalogPlatos = [];
let searchQuery = "";
let selectedCategory = "todos";
let selectedGoal = "todos";

// Variables de estado de la cesta (reactiva)
let cartTotal = 0;
let cartCount = 0;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Cargar platos desde Supabase con fallback local
    await cargarPlatos();
    
    // 2. Inicializar los controles de filtro y búsqueda
    initFilters();
    
    // 3. Inicializar botones de la cesta de compras
    initCartActions();
    
    // 4. Renderizar el catálogo por primera vez
    renderCatalog();
});

/**
 * Obtiene el descuento simulado para un plato según su ID.
 */
function calcularDescuentoPlato(id) {
    if (['omelette-fit', 'ceviche-clasico', 'pizza-fit', 'mousse-palta', 'lomo-saltado-pollo'].includes(id)) {
        return 20;
    }
    if (['avena-frutos-rojos', 'salmon-grill', 'burger-lentejas', 'galletas-avena'].includes(id)) {
        return 15;
    }
    if (['quinoa-breakfast', 'poke-salmon', 'brochetas-pollo'].includes(id)) {
        return 10;
    }
    return 0;
}

/**
 * Carga los platos desde la base de datos de Supabase o utiliza el array local como fallback.
 */
async function cargarPlatos() {
    try {
        if (window.supabaseClient) {
            const { data, error } = await supabaseClient
                .from("platos")
                .select("*")
                .eq("activo", true);
                
            if (error) throw error;
            
            catalogPlatos = data.map(p => ({
                id: p.id,
                name: p.nombre,
                category: p.categoria,
                goal: p.objetivo,
                kcal: p.kcal,
                proteina: p.proteina,
                carbohidratos: p.carbohidratos,
                precio: parseFloat(p.precio || 0),
                image_path: p.imagen_url,
                descuento: calcularDescuentoPlato(p.id)
            }));
            console.log("NutriFit: Catálogo cargado exitosamente desde Supabase.");
        } else {
            throw new Error("Supabase client no definido.");
        }
    } catch (err) {
        console.warn("NutriFit: No se pudo cargar catálogo desde Supabase. Usando array local.", err.message);
        
        // Mapear el array local 'menuPlatos' definido en index.js
        if (typeof menuPlatos !== "undefined") {
            catalogPlatos = menuPlatos.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                goal: p.goal,
                kcal: p.kcal,
                proteina: p.proteina,
                carbohidratos: p.carbohidratos,
                precio: p.precio,
                image_path: p.image_path,
                descuento: calcularDescuentoPlato(p.id)
            }));
        } else {
            catalogPlatos = [];
        }
    }

    // Unificar platos de LocalStorage (añadidos o editados por el administrador)
    const customPlatos = JSON.parse(localStorage.getItem("nf_platos_custom") || "[]");
    const mapPlatos = new Map();
    catalogPlatos.forEach(p => mapPlatos.set(p.id, p));
    customPlatos.forEach(p => mapPlatos.set(p.id, {
        id: p.id,
        name: p.name,
        category: p.category,
        goal: p.goal,
        kcal: p.kcal,
        proteina: p.proteina,
        carbohidratos: p.carbohidratos,
        precio: p.precio,
        image_path: p.image_path,
        descuento: calcularDescuentoPlato(p.id)
    }));
    catalogPlatos = Array.from(mapPlatos.values());
}

/**
 * Inicializa los controladores de eventos para búsqueda y filtrado.
 */
function initFilters() {
    const searchInput = document.getElementById("search-input");
    const categorySelect = document.getElementById("category-select");
    const filterButtons = document.querySelectorAll("#goal-filters-container .btn-filter");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderCatalog();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", (e) => {
            selectedCategory = e.target.value;
            renderCatalog();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Alternar clase active en los botones
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            selectedGoal = btn.dataset.goal;
            renderCatalog();
        });
    });
}

/**
 * Obtiene la clase CSS según el objetivo del plato.
 */
function obtenerClaseObjetivo(goal) {
    const g = String(goal).toLowerCase().trim();
    if (g === "bajar") return "goal-bajar";
    if (g === "mantener") return "goal-mantener";
    return "goal-ganar";
}

/**
 * Filtra y renderiza las tarjetas de platos en el catálogo.
 */
function renderCatalog() {
    const grid = document.getElementById("menu-catalog-grid");
    if (!grid) return;

    // Aplicar filtros en memoria
    const filtered = catalogPlatos.filter(plato => {
        const matchesSearch = plato.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "todos" || plato.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesGoal = selectedGoal === "todos" || plato.goal.toLowerCase() === selectedGoal.toLowerCase();
        return matchesSearch && matchesCategory && matchesGoal;
    });

    // Vista vacía en caso de no haber resultados
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-face-frown" style="font-size: 36px; margin-bottom: 12px; color: var(--color-text-light); display: block;"></i>
                No se encontraron platos que coincidan con los filtros seleccionados.
            </div>
        `;
        return;
    }

    // Cargar favoritos de localStorage
    const favorites = JSON.parse(localStorage.getItem("nf_favorites") || "[]");
    // Cargar inventario para comprobar stock
    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");

    // Cargar estado de deudor del usuario
    const session = JSON.parse(localStorage.getItem("nf_session") || "null");
    let isDeudor = false;
    if (session && session.id_rol !== 1) {
        const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
        const estadoInfo = clientesEstado[session.id];
        if (estadoInfo && estadoInfo.estado === "Deudor") {
            isDeudor = true;
        }
    }

    // Renderizar tarjetas
    grid.innerHTML = filtered.map(plato => {
        const goalLabel = translateGoal(plato.goal);
        const isFavorite = favorites.includes(plato.id);
        const fillValue = isFavorite ? "currentColor" : "none";
        const activeClass = isFavorite ? "active" : "";

        // Descripción dinámica del plato (macros)
        const descriptionText = `Disfruta de este delicioso plato elaborado con insumos frescos. Aporta ${plato.kcal} Kcal, con ${plato.proteina}g de proteína magra y ${plato.carbohidratos}g de carbohidratos saludables.`;

        // Sistema de ofertas
        const precioActual = plato.precio;
        const hasDiscount = (plato.descuento && plato.descuento > 0);
        let precioOriginal = precioActual;
        if (hasDiscount) {
            if (plato.descuento === 20) {
                precioOriginal = precioActual * 1.25;
            } else {
                precioOriginal = precioActual / (1 - (plato.descuento / 100));
            }
        }

        const infoStock = inventario[plato.id] || { stock: 10, estado: "Disponible" };
        const isAgotado = infoStock.estado === "Agotado" || infoStock.stock <= 0;
        const claseAgotado = isAgotado ? "agotado" : "";
        const badgeAgotado = isAgotado ? `<span class="badge-agotado-flotante">AGOTADO</span>` : "";

        const discountBadgeHtml = (hasDiscount && !isAgotado) 
            ? `<span class="descuento-tag-flotante">-${plato.descuento}%</span>` 
            : "";

        const priceHtml = hasDiscount
            ? `<div class="precio-container">
                    <div class="precio-actual">S/ ${precioActual.toFixed(2)}</div>
                    <div class="precio-antes-row">
                        <span class="precio-antes">S/ ${precioOriginal.toFixed(2)}</span>
                        <span class="descuento-tag">-${plato.descuento}%</span>
                    </div>
               </div>`
            : `<div class="precio-container">
                    <div class="precio-actual">S/ ${precioActual.toFixed(2)}</div>
               </div>`;

        return `
            <article class="plato ${claseAgotado}" data-id="${plato.id}">
                <div class="plato-img-container">
                    ${badgeAgotado}
                    <span class="badge-goal ${obtenerClaseObjetivo(plato.goal)}">
                        ${goalLabel.toUpperCase()}
                    </span>
                    ${discountBadgeHtml}
                    <img src="${plato.image_path}" class="plato-img" alt="${plato.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'">
                </div>
                <div class="plato-body">
                    <div class="plato-header-row">
                        <h3 class="plato-titulo">${plato.name}</h3>
                        <button class="btn-favorito ${activeClass}" data-id="${plato.id}" aria-label="Añadir a favoritos">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${fillValue}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                            </svg>
                        </button>
                    </div>
                    <p class="plato-descripcion">${descriptionText}</p>
                    <div class="plato-footer-row">
                        ${priceHtml}
                        <div class="plato-btn-row">
                            <button class="btn-catalog-action-icon add ${isDeudor ? 'deudor-disabled' : ''}" onclick="agregarAlCarrito('${plato.id}')" aria-label="Agregar al carrito" ${isDeudor ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                                <i class="fa-solid fa-cart-shopping"></i>
                            </button>
                            <button class="btn-catalog-action buy ${isDeudor ? 'deudor-disabled' : ''}" onclick="ordenarAhora('${plato.id}')" ${isDeudor ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>Comprar</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

/**
 * Traduce el objetivo del plato a un formato de visualización.
 */
function translateGoal(goal) {
    const g = String(goal).toLowerCase().trim();
    if (g === "bajar") return "Bajar";
    if (g === "mantener") return "Mantener";
    if (g === "ganar") return "Ganar Masa";
    return goal;
}

/**
 * Verifica si el usuario tiene una sesión activa en la plataforma.
 */
function checkUserSession() {
    return !!localStorage.getItem("nf_session");
}

/**
 * Abre el modal de inicio de sesión.
 */
function openLoginModal() {
    const modalLogin = document.getElementById("modal-login");
    if (modalLogin) {
        modalLogin.classList.add("show");
    }
}

/**
 * Añade un plato al carrito reactivo (requiere inicio de sesión).
 */
function agregarAlCarrito(id) {
    if (!checkUserSession()) {
        openLoginModal();
        return;
    }

    // VALIDACIÓN DE DEUDOR (Usuario Bloqueado)
    const sessionVal = JSON.parse(localStorage.getItem("nf_session") || "null");
    if (sessionVal && sessionVal.id_rol !== 1) {
        const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
        const estadoInfo = clientesEstado[sessionVal.id];
        if (estadoInfo && estadoInfo.estado === "Deudor") {
            if (window.mostrarToastAesthetic) {
                window.mostrarToastAesthetic("Operación denegada. Registras un saldo pendiente en tu cuenta.", "error");
            } else {
                alert("Operación denegada. Registras un saldo pendiente en tu cuenta.");
            }
            return;
        }
    }

    // VALIDACIÓN DE STOCK (Plato Agotado)
    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
    const infoStock = inventario[id] || { stock: 10, estado: "Disponible" };
    if (infoStock.estado === "Agotado" || infoStock.stock <= 0) {
        if (window.mostrarToastAesthetic) {
            window.mostrarToastAesthetic("Este plato se encuentra temporalmente agotado", "error");
        } else {
            alert("Este plato se encuentra temporalmente agotado");
        }
        return;
    }

    const plato = catalogPlatos.find(p => p.id === id);
    if (!plato) return;

    window.agregarPlatoAlCarritoGlobal(plato.id, plato.name, plato.precio, plato.image_path);
}

/**
 * Compra directamente un plato (requiere inicio de sesión).
 */
function ordenarAhora(id) {
    if (!checkUserSession()) {
        openLoginModal();
        return;
    }

    // VALIDACIÓN DE DEUDOR (Usuario Bloqueado)
    const sessionVal = JSON.parse(localStorage.getItem("nf_session") || "null");
    if (sessionVal && sessionVal.id_rol !== 1) {
        const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
        const estadoInfo = clientesEstado[sessionVal.id];
        if (estadoInfo && estadoInfo.estado === "Deudor") {
            if (window.mostrarToastAesthetic) {
                window.mostrarToastAesthetic("Operación denegada. Registras un saldo pendiente en tu cuenta.", "error");
            } else {
                alert("Operación denegada. Registras un saldo pendiente en tu cuenta.");
            }
            return;
        }
    }

    // VALIDACIÓN DE STOCK (Plato Agotado)
    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
    const infoStock = inventario[id] || { stock: 10, estado: "Disponible" };
    if (infoStock.estado === "Agotado" || infoStock.stock <= 0) {
        if (window.mostrarToastAesthetic) {
            window.mostrarToastAesthetic("Este plato se encuentra temporalmente agotado", "error");
        } else {
            alert("Este plato se encuentra temporalmente agotado");
        }
        return;
    }

    const plato = catalogPlatos.find(p => p.id === id);
    if (!plato) return;

    // Agregar (push) al carrito existente utilizando la función global
    window.agregarPlatoAlCarritoGlobal(plato.id, plato.name, plato.precio, plato.image_path);
    window.location.href = "carrito.html?step=2";
}

/**
 * Actualiza los elementos del contador y total a pagar de la cesta.
 */
function actualizarCestaUI() {
    window.actualizarCestaGlobalUI();
}

/**
 * Inicializa las acciones de los botones "Ir a la cesta" y "Continuar" de la cesta.
 */
function initCartActions() {
    const btnCesta = document.getElementById("btn-ir-cesta");
    const btnContinuar = document.getElementById("btn-continuar");

    if (btnCesta) {
        btnCesta.addEventListener("click", () => {
            if (!checkUserSession()) {
                openLoginModal();
            } else {
                window.location.href = "carrito.html";
            }
        });
    }

    if (btnContinuar) {
        btnContinuar.addEventListener("click", () => {
            if (!checkUserSession()) {
                openLoginModal();
            } else {
                alert("Procesando pago y entrega de tus platos...");
            }
        });
    }
}

// Exponer las funciones para los handlers de onclick inline de las tarjetas generadas
window.agregarAlCarrito = agregarAlCarrito;
window.ordenarAhora = ordenarAhora;

// Delegación de eventos para los botones de favoritos interactivos
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-favorito");
    if (btn) {
        e.preventDefault();
        e.stopPropagation();
        
        const id = btn.dataset.id;
        let favorites = JSON.parse(localStorage.getItem("nf_favorites") || "[]");
        
        btn.classList.toggle("active");
        const svg = btn.querySelector("svg");
        
        if (btn.classList.contains("active")) {
            if (svg) svg.setAttribute("fill", "currentColor");
            if (!favorites.includes(id)) {
                favorites.push(id);
            }
            console.log(`NutriFit: Plato ${id} añadido a favoritos`);
        } else {
            if (svg) svg.setAttribute("fill", "none");
            favorites = favorites.filter(favId => favId !== id);
            console.log(`NutriFit: Plato ${id} eliminado de favoritos`);
        }
        
        localStorage.setItem("nf_favorites", JSON.stringify(favorites));
    }
});
