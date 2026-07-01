const menuPlatos = [
  // --- DESAYUNOS ---
  { id: "omelette-fit",
     name: "Omelette de Claras y Espinaca", 
     category: "desayuno", 
     goal: "bajar", 
     kcal: 240, 
     proteina: 22, 
     carbohidratos: 18, 
     precio: 14.5,
      image_path: "../assets/img/platos/desayunos/omelette-fit.jpg" },
  { id: "avena-frutos-rojos",
     name: "Bowl de Avena con Arándanos",
      category: "desayuno", 
      goal: "mantener", 
      kcal: 258, 
      proteina: 13,
      carbohidratos: 21, 
      precio: 15.4, 
      image_path: "../assets/img/platos/desayunos/avena-frutos-rojos.jpg" },
  { id: "pancakes-proteicos", 
    name: "Pancakes de Avena y Plátano", 
    category: "desayuno", 
    goal: "ganar",
     kcal: 276, 
    proteina: 14, 
    carbohidratos: 24,
     precio: 16.3, 
     image_path: "../assets/img/platos/desayunos/pancakes-proteicos.jpg" },
  { id: "tostadas-palta",
     name: "Tostadas Integrales con Palta y Huevo", 
     category: "desayuno", 
     goal: "mantener", 
     kcal: 294,
      proteina: 15, 
      carbohidratos: 27,
       precio: 17.2, 
       image_path: "../assets/img/platos/desayunos/tostadas-palta.jpg" },
  { id: "arepa-fit", 
    name: "Arepas de Maíz con Queso Light", 
    category: "desayuno",
     goal: "mantener", 
     kcal: 312, 
     proteina: 16, 
     carbohidratos: 30, 
     precio: 18.1, 
     image_path: "../assets/img/platos/desayunos/arepa-fit.jpg" },
  { id: "quinoa-breakfast", 
    name: "Quinoa con Manzana y Canela",
     category: "desayuno", 
     goal: "ganar",
      kcal: 330, 
      proteina: 17,
       carbohidratos: 33, 
       precio: 19.0, 
       image_path: "../assets/img/platos/desayunos/quinoa-breakfast.jpg" },
  { id: "smoothie-mango",
     name: "Smoothie Bowl de Mango y Chía", 
     category: "desayuno", 
     goal: "bajar",
      kcal: 348, 
      proteina: 18, 
      carbohidratos: 36, 
      precio: 19.9, 
      image_path: "../assets/img/platos/desayunos/smoothie-mango.jpg" },
  { id: "yogurt-granola", 
    name: "Yogurt Griego con Granola Artesanal",
     category: "desayuno", 
     goal: "mantener", 
     kcal: 366, 
     proteina: 19,
      carbohidratos: 39,
       precio: 
      20.8, image_path: "../assets/img/platos/desayunos/yogurt-granola.jpg" },
  { id: "revuelto-vegano", 
    name: "Revuelto de Tofu con Cúrcuma", 
    category: "desayuno", 
    goal: "bajar", 
    kcal: 384,
     proteina: 20,
      carbohidratos: 42,
       precio: 21.7, 
       image_path: "../assets/img/platos/desayunos/revuelto-vegano.jpg" },
  { id: "shake-cafe",
     name: "Batido Energético de Café y Proteína", 
     category: "desayuno", 
     goal: "ganar", 
     kcal: 402, 
     proteina: 21,
      carbohidratos: 45,
       precio: 22.6, 
       image_path: "../assets/img/platos/desayunos/shake-cafe.jpg" },

  // --- ALMUERZOS ---
  { id: "ceviche-clasico", 
    name: "Ceviche de Pescado Clásico", 
    category: "almuerzo", 
    goal: "bajar", 
    kcal: 390, 
    proteina: 22, 
    carbohidratos: 28, 
    precio: 19.0, 
    image_path: "../assets/img/platos/almuerzos/ceviche-clasico.jpg" },
  { id: "aji-gallina-light",
     name: "Ají de Gallina con Arroz Integral", 
     category: "almuerzo", 
     goal: "mantener", 
     kcal: 414,
      proteina: 23, 
      carbohidratos: 32, 
      precio: 20.2, 
      image_path: "../assets/img/platos/almuerzos/aji-gallina-light.jpg" },
  { id: "lomo-saltado-pollo", 
    name: "Lomo Saltado de Pollo con Papas", 
    category: "almuerzo", 
    goal: "ganar", 
    kcal: 438, 
    proteina: 24,
     carbohidratos: 36,
      precio: 21.4, 
      image_path: "../assets/img/platos/almuerzos/lomo-saltado-pollo.jpg" },
  { id: "salmon-grill", 
    name: "Salmón al Horno con Espárragos", 
    category: "almuerzo",
     goal: "bajar", 
     kcal: 462, 
     proteina: 25, 
     carbohidratos: 40, 
     precio: 22.6, 
     image_path: "../assets/img/platos/almuerzos/salmon-grill.jpg" },
  { id: "tacu-tacu-fit",
     name: "Tacu Tacu de Lentejas con Huevo", 
     category: "almuerzo", 
     goal: "ganar",
      kcal: 486,
       proteina: 26, 
       carbohidratos: 44, 
       precio: 23.8, 
       image_path: "../assets/img/platos/almuerzos/tacu-tacu-fit.jpg" },
  { id: "quinoa-bowl-pollo",
     name: "Ensalada de Quinoa con Pollo",
      category: "almuerzo", 
      goal: "mantener",
       kcal: 510,
        proteina: 27, 
        carbohidratos: 48, 
        precio: 25.0, 
        image_path: "../assets/img/platos/almuerzos/quinoa-bowl-pollo.jpg" },
  { id: "pasta-pesto",
     name: "Pasta Integral con Pesto",
      category: "almuerzo", 
      goal: "ganar",
       kcal: 534, 
       proteina: 28, 
       carbohidratos: 52,
        precio: 26.2,
         image_path: "../assets/img/platos/almuerzos/pasta-pesto.jpg" },
  { id: "sudado-pescado", 
    name: "Sudado de Pescado",
     category: "almuerzo", 
     goal: "bajar", 
     kcal: 558,
      proteina: 29, 
      carbohidratos: 56,
       precio: 27.4, 
       image_path: "../assets/img/platos/almuerzos/sudado-pescado.jpg" },
  { id: "arroz-pollo-light",
     name: "Arroz con Pollo Integral", 
     category: "almuerzo", 
     goal: "mantener",
      kcal: 582,
       proteina: 30, 
       carbohidratos: 60, 
       precio: 28.6,
        image_path: "../assets/img/platos/almuerzos/arroz-pollo-light.jpg" },
  { id: "poke-salmon",
     name: "Poke Bowl de Salmón y Edamame", 
     category: "almuerzo",
      goal: "bajar", 
      kcal: 606,
       proteina: 31, 
       carbohidratos: 64,
        precio: 29.8, 
        image_path: "../assets/img/platos/almuerzos/poke-salmon.jpg" },

  // --- CENAS ---
  { id: "sopa-pollo",
     name: "Sopa Dietética de Pollo y Verduras", 
     category: "cena", 
     goal: "bajar", 
     kcal: 280, 
     proteina: 18, 
     carbohidratos: 14, 
     precio: 17.0, 
     image_path: "../assets/img/platos/cenas/sopa-pollo-clara.jpg" },
  { id: "tacos-lechuga", 
    name: "Tacos de Lechuga con Carne Magra", 
    category: "cena", 
    goal: "bajar",
     kcal: 300, 
     proteina: 19, 
     carbohidratos: 17, 
     precio: 18.05, 
     image_path: "../assets/img/platos/cenas/tacos-lechuga.jpg" },
  { id: "pizza-fit",
     name: "Pizza con Base de Coliflor", 
     category: "cena",
      goal: "mantener", 
      kcal: 320, 
      proteina: 20, 
      carbohidratos: 20, 
      precio: 19.1, 
      image_path: "../assets/img/platos/cenas/pizza-fit.jpg" },
  { id: "pollo-limon", 
    name: "Pechuga de Pollo al Limón",
     category: "cena", 
     goal: "mantener", 
     kcal: 340, 
     proteina: 21, 
     carbohidratos: 23, 
     precio: 20.15, 
     image_path: "../assets/img/platos/cenas/pollo-limon.jpg" },
  { id: "burger-lentejas", 
    name: "Hamburguesa de Lentejas",
     category: "cena", 
     goal: "mantener", 
     kcal: 360, 
     proteina: 22, 
     carbohidratos: 26, 
     precio: 21.2, 
     image_path: "../assets/img/platos/cenas/burger-lentejas.jpg" },
  { id: "brochetas-pollo", 
    name: "Brochetas de Pollo y Vegetales", 
    category: "cena", 
    goal: "bajar",
     kcal: 380, 
     proteina: 23, 
     carbohidratos: 29,
      precio: 22.25, image_path: "../assets/img/platos/cenas/brochetas-pollo.jpg" },
  { id: "wrap-atun", 
    name: "Wrap Integral de Atún", 
    category: "cena", 
    goal: "mantener", 
    kcal: 400, 
    proteina: 24, 
    carbohidratos: 32, 
    precio: 23.3, 
    image_path: "../assets/img/platos/cenas/wrap-atun.jpg" },
  { id: "pescado-pure",
     name: "Pescado a la Plancha con Puré", 
     category: "cena", 
     goal: "ganar", 
     kcal: 420, 
     proteina: 25, 
     carbohidratos: 35, 
     precio: 24.35, 
     image_path: "../assets/img/platos/cenas/pescado-pure.jpg" },
  { id: "quesadilla-fit", 
    name: "Quesadilla Integral de Espinaca", 
    category: "cena",
     goal: "mantener", 
     kcal: 440, 
     proteina: 26, 
     carbohidratos: 38, 
     precio: 25.4, 
     image_path: "../assets/img/platos/cenas/quesadilla-fit.jpg" },
  { id: "atun-sesamo", name: "Atún Sellado con Sésamo", category: "cena", goal: "ganar", kcal: 460, proteina: 27, carbohidratos: 41, precio: 26.45, image_path: "../assets/img/platos/cenas/atun-sesamo.jpg" },

  // --- POSTRES ---
  { id: "mousse-palta", 
    name: "Mousse de Chocolate con Palta", 
    category: "postre", 
    goal: "mantener", 
    kcal: 130, 
    proteina: 5, 
    carbohidratos: 16,
     precio: 9.5, 
     image_path: "../assets/img/platos/postres/mousse-palta.jpg" },
  { id: "gelatina-fruta", 
    name: "Gelatina Diet con Frutas",
     category: "postre",
      goal: "bajar",
       kcal: 152, 
       proteina: 6, 
       carbohidratos: 20, 
       precio: 10.45, 
       image_path: "../assets/img/platos/postres/gelatina-fruta.jpg" },
  { id: "barras-proteina", 
    name: "Barritas de Proteína",
     category: "postre",
      goal: "ganar",
       kcal: 174,
        proteina: 7,
         carbohidratos: 24,
          precio: 11.4,
           image_path: "../assets/img/platos/postres/barras-proteina.jpg" },
  { id: "manzana-asada",
     name: "Manzana Asada con Canela", 
     category: "postre",
      goal: "bajar", 
      kcal: 196,
       proteina: 8,
        carbohidratos: 28,
         precio: 12.35,
          image_path: "../assets/img/platos/postres/manzana-asada.jpg" },
  { id: "mazamorra-light",
     name: "Mazamorra Morada Light", 
     category: "postre",
      goal: "mantener", 
      kcal: 218, 
      proteina: 9, 
      carbohidratos: 32,
       precio: 13.3, 
       image_path: "../assets/img/platos/postres/mazamorra-light.jpg" },
  { id: "pudin-tofu",
     name: "Pudín de Chocolate con Tofu",
      category: "postre", 
      goal: "mantener", 
      kcal: 240, proteina: 10,
       carbohidratos: 36, precio: 
       14.25, image_path: "../assets/img/platos/postres/pudin-tofu.jpg" },
  { id: "galletas-avena",
     name: "Galletas de Avena y Cacao", 
     category: "postre", 
     goal: "ganar",
      kcal: 262, 
      proteina: 11,
       carbohidratos: 40,
        precio: 15.2, 
        image_path: "../assets/img/platos/postres/galletas-avena.jpg" },
  { id: "trufas-datiles", 
    name: "Trufas de Dátiles y Coco",
     category: "postre",
      goal: "ganar", 
      kcal: 284, 
      proteina: 12, 
      carbohidratos: 44,
       precio: 16.15, 
       image_path: "../assets/img/platos/postres/trufas-datiles.jpg" },
  { id: "sorbete-mango", 
    name: "Sorbete de Mango Natural",
     category: "postre", 
     goal: "bajar", 
     kcal: 306, 
     proteina: 13, 
     carbohidratos: 48, 
     precio: 17.1, 
     image_path: "../assets/img/platos/postres/sorbete-mango.jpg" },
  { id: "frozen-yogurt",
     name: "Yogurt Helado con Arándanos", 
     category: "postre", 
     goal: "bajar", 
     kcal: 328, 
     proteina: 14,
      carbohidratos: 52, 
      precio: 18.05,
       image_path: "../assets/img/platos/postres/frozen-yogurt.jpg" }
];

// =========================================================================
// SISTEMA GLOBAL DE CARRITO DE COMPRAS (PERSISTENTE EN TODA LA PLATAFORMA)
// =========================================================================

window.obtenerCarrito = function() {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
};

window.guardarCarrito = function(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));
};

window.agregarPlatoAlCarritoGlobal = function(platoId, platoNombre, platoPrecio, platoImagen) {
    if (!localStorage.getItem("nf_session")) {
        const modalLogin = document.getElementById("modal-login");
        if (modalLogin) {
            modalLogin.classList.add("show");
        }
        return false;
    }

    let carrito = window.obtenerCarrito();
    const index = carrito.findIndex(item => item.id === platoId);
    
    if (index > -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push({
            id: platoId,
            nombre: platoNombre,
            precio: parseFloat(platoPrecio),
            imagen: platoImagen,
            cantidad: 1
        });
    }
    
    window.guardarCarrito(carrito);
    console.log(`NutriFit: Plato "${platoNombre}" agregado al carrito global.`);
    return true;
};

window.obtenerTotalesCarrito = function() {
    const carrito = window.obtenerCarrito();
    let total = 0;
    let cantidad = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        cantidad += item.cantidad;
    });
    return { total, cantidad };
};

window.actualizarCestaGlobalUI = function() {
    const { total, cantidad } = window.obtenerTotalesCarrito();
    const elTotal = document.getElementById("cart-total");
    const elCount = document.getElementById("cart-count");
    
    if (elTotal) {
        elTotal.textContent = `S/ ${total.toFixed(2)}`;
    }
    if (elCount) {
        elCount.textContent = cantidad;
    }

    // Actualizar/Crear el botón píldora verde en el navbar (.navegacion)
    const navegacionList = document.querySelector(".navegacion");
    if (navegacionList) {
        let cartPillLi = document.getElementById("cart-pill-item");
        
        // Ocultar por completo si estamos en la página de menú
        const isMenuPage = window.location.pathname.includes("menu-saludable.html");
        if (isMenuPage) {
            if (cartPillLi) {
                cartPillLi.remove();
            }
            return;
        }

        if (!cartPillLi) {
            cartPillLi = document.createElement("li");
            cartPillLi.id = "cart-pill-item";
            
            const authButtons = document.getElementById("auth-buttons");
            if (authButtons) {
                navegacionList.insertBefore(cartPillLi, authButtons);
            } else {
                navegacionList.appendChild(cartPillLi);
            }
        }
        
        const isSubFolder = window.location.pathname.includes("/pages/") || window.location.pathname.includes("/admin/");
        const basePath = isSubFolder ? "../" : "./";
        const cartUrl = `${basePath}pages/carrito.html`;
        
        cartPillLi.innerHTML = `
            <a href="${cartUrl}" class="cart-pill-btn" title="Ver mi cesta de compras">
                <i class="fa-solid fa-cart-shopping"></i>
                <span id="cart-pill-total">S/ ${total.toFixed(2)}</span>
            </a>
        `;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Sincronizar UI de la cesta al cargar la página
    window.actualizarCestaGlobalUI();
    
    // Escuchar cambios globales en el carrito
    window.addEventListener("carritoActualizado", () => {
        window.actualizarCestaGlobalUI();
    });
    
    // Asignar controladores a la barra de cesta de la página actual si existe
    const btnCesta = document.getElementById("btn-ir-cesta");
    const btnContinuar = document.getElementById("btn-continuar");

    if (btnCesta) {
        btnCesta.addEventListener("click", () => {
            if (!localStorage.getItem("nf_session")) {
                const modalLogin = document.getElementById("modal-login");
                if (modalLogin) modalLogin.classList.add("show");
            } else {
                const isSubFolder = window.location.pathname.includes("/pages/") || window.location.pathname.includes("/admin/");
                const basePath = isSubFolder ? "../" : "./";
                window.location.href = `${basePath}pages/carrito.html`;
            }
        });
    }

    if (btnContinuar) {
        btnContinuar.addEventListener("click", () => {
            if (window.location.pathname.includes("carrito.html")) {
                return;
            }
            if (!localStorage.getItem("nf_session")) {
                const modalLogin = document.getElementById("modal-login");
                if (modalLogin) modalLogin.classList.add("show");
            } else {
                const carrito = window.obtenerCarrito();
                if (carrito.length === 0) {
                    alert("Tu cesta está vacía. Agrega platos antes de continuar al pago.");
                    return;
                }
                const isSubFolder = window.location.pathname.includes("/pages/") || window.location.pathname.includes("/admin/");
                const basePath = isSubFolder ? "../" : "./";
                window.location.href = `${basePath}pages/carrito.html?step=2`;
            }
        });
    }

    /* ==========================================
       ELEMENTOS GENERALES
    ========================================== */

    const authButtons = document.getElementById("auth-buttons");
    const modalPendiente = document.getElementById("modal-pendiente");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const btnCompletarPerfil = document.getElementById("btn-completar-perfil");

    const btnHamburguesa = document.getElementById("btn-hamburguesa");
    const menuNavegacion = document.getElementById("menu-navegacion");
    /* ==========================================
   PLATOS POPULARES
========================================== */

const contenedorPopulares =
document.getElementById("contenedor-populares");

// Helper para combinar platos base y creados/editados por el administrador
function obtenerPlatosTotales() {
    const customPlatos = JSON.parse(localStorage.getItem("nf_platos_custom") || "[]");
    const mapPlatos = new Map();
    if (typeof menuPlatos !== "undefined") {
        menuPlatos.forEach(p => mapPlatos.set(p.id, p));
    }
    customPlatos.forEach(p => mapPlatos.set(p.id, {
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
    return Array.from(mapPlatos.values());
}
window.obtenerPlatosTotalesGlobal = obtenerPlatosTotales;

function obtenerClaseObjetivo(goal){
    const g = String(goal).toLowerCase();
    if(g === "bajar") return "goal-bajar";
    if(g === "mantener") return "goal-mantener";
    return "goal-ganar";
}

function renderizarPopulares(){
    if(!contenedorPopulares) return;

    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
    const platos = obtenerPlatosTotales();
    const populares = platos.slice(0, 8);

    contenedorPopulares.innerHTML = populares.map(plato => {
        const infoStock = inventario[plato.id] || { stock: 10, estado: "Disponible" };
        const isAgotado = infoStock.estado === "Agotado" || infoStock.stock <= 0;
        const claseAgotado = isAgotado ? "agotado" : "";
        const badgeAgotado = isAgotado ? `<span class="badge-agotado-flotante">AGOTADO</span>` : "";

        return `
        <article class="plato-card ${claseAgotado}" data-id="${plato.id}">
            <div class="plato-imagen">
                ${badgeAgotado}
                <img src="${plato.image_path}" alt="${plato.name}">
            </div>

            <div class="plato-body">
                <span class="plato-goal ${obtenerClaseObjetivo(plato.goal)}">
                    ${plato.goal.toUpperCase()}
                </span>

                <h3 class="plato-nombre">
                    ${plato.name}
                </h3>

                <div class="plato-macros">
                    <div class="plato-macro">
                        <strong>${plato.kcal}</strong>
                        <span>Kcal</span>
                    </div>
                    <div class="plato-macro">
                        <strong>${plato.proteina}g</strong>
                        <span>Prot</span>
                    </div>
                    <div class="plato-macro">
                        <strong>${plato.carbohidratos}g</strong>
                        <span>Carb</span>
                    </div>
                </div>

                <div class="plato-precio">
                    S/ ${plato.precio.toFixed(2)}
                </div>

                <div class="plato-botones">
                    <button class="btn-agregar" data-id="${plato.id}">
                        Agregar
                    </button>
                    <button class="btn-comprar" data-id="${plato.id}">
                        Ordenar Ahora
                    </button>
                </div>
            </div>
        </article>
        `;
    }).join("");
}

function mostrarToastAesthetic(mensaje, tipo = "success") {
    const pre = document.querySelector(".toast-notif-dynamic-client");
    if (pre) pre.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notif-dynamic-client ${tipo}`;
    const icon = tipo === "error" ? "fa-circle-exclamation" : "fa-circle-check";
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${mensaje}</span>
    `;
    
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.zIndex = "9999";
    toast.style.backgroundColor = "#1f2a24";
    toast.style.color = "#ffffff";
    toast.style.padding = "15px 25px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 10px 30px rgba(31, 42, 36, 0.25)";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "12px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    toast.style.borderLeft = tipo === "error" ? "5px solid #e53935" : "5px solid #4fa876";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 50);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}
window.mostrarToastAesthetic = mostrarToastAesthetic;

renderizarPopulares();

/* ==========================================
   PLATOS RECOMENDADOS (CAROUSEL SLIDER)
========================================== */
async function renderizarRecomendados() {
    const track = document.getElementById("slider-track-recomendados");
    if (!track) return;

    let platos = [];
    try {
        // Consultar platos activos desde Supabase
        const { data, error } = await supabaseClient
            .from("platos")
            .select("*")
            .eq("activo", true)
            .limit(15);

        if (error) throw error;
        platos = data;
    } catch (err) {
        console.warn("No se pudieron cargar los platos desde Supabase, usando locales.", err);
        platos = menuPlatos.slice(0, 15);
    }
    window.listadoRecomendados = platos;

    if (platos.length === 0) {
        track.innerHTML = "<p>No hay platos recomendados en este momento.</p>";
        return;
    }

    function obtenerDescripcionPlato(plato) {
        const nombre = plato.nombre || plato.name;
        const kcal = plato.kcal;
        const proteina = plato.proteina;
        const carbs = plato.carbohidratos;
        return `Disfruta de este delicioso plato elaborado con insumos frescos. Aporta ${kcal} Kcal, con ${proteina}g de proteína magra y ${carbs}g de carbohidratos saludables.`;
    }

    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");

    track.innerHTML = platos.map(plato => {
        const id = plato.id;
        const nombre = plato.nombre || plato.name;
        const precio = plato.precio;
        const imagen = plato.imagen_url || plato.image_path;
        const objetivo = plato.objetivo || plato.goal;
        const precioAntes = precio * 1.25; // Simular un 20% de descuento para el diseño e-commerce

        const infoStock = inventario[id] || { stock: 10, estado: "Disponible" };
        const isAgotado = infoStock.estado === "Agotado" || infoStock.stock <= 0;
        const claseAgotado = isAgotado ? "agotado" : "";
        const badgeAgotado = isAgotado ? `<span class="badge-agotado-flotante">AGOTADO</span>` : "";

        return `
            <article class="plato ${claseAgotado}" data-id="${id}">
                <div class="plato-img-container">
                    ${badgeAgotado}
                    <span class="badge-goal ${obtenerClaseObjetivo(objetivo)}">
                        ${objetivo.toUpperCase()}
                    </span>
                    <img src="${imagen}" class="plato-img" alt="${nombre}">
                </div>
                <div class="plato-body">
                    <div class="plato-header-row">
                        <h3 class="plato-titulo">${nombre}</h3>
                        <button class="btn-favorito" data-id="${id}" aria-label="Añadir a favoritos">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                            </svg>
                        </button>
                    </div>
                    <p class="plato-descripcion">${obtenerDescripcionPlato(plato)}</p>
                    <div class="plato-footer-row">
                        <div class="precio-container">
                            <div class="precio-actual">S/ ${precio.toFixed(2)}</div>
                            <div class="precio-antes-row">
                                <span class="precio-antes">S/ ${precioAntes.toFixed(2)}</span>
                                <span class="descuento-tag">-20%</span>
                            </div>
                        </div>
                        <div class="plato-btn-row">
                            <button class="btn-catalog-action-icon btn-agregar" data-id="${id}" aria-label="Agregar al carrito">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </button>
                            <button class="btn-comprar" data-id="${id}">Comprar</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    // Agregar micro-interacciones de favoritos
    track.querySelectorAll(".btn-favorito").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle("active");
            const icon = btn.querySelector("svg");
            if (btn.classList.contains("active")) {
                icon.setAttribute("fill", "currentColor");
                console.log(`Plato ${btn.dataset.id} añadido a favoritos`);
            } else {
                icon.setAttribute("fill", "none");
                console.log(`Plato ${btn.dataset.id} eliminado de favoritos`);
            }
        });
    });

    // Configuración de los Controles del Carrusel (Slider)
    let currentIndex = 0;
    const btnPrev = document.getElementById("btn-prev-recomendados");
    const btnNext = document.getElementById("btn-next-recomendados");
    const dotsContainer = document.getElementById("slider-dots-recomendados");

    function getItemsVisible() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 850) return 2;
        if (window.innerWidth <= 1100) return 3;
        if (window.innerWidth <= 1400) return 4;
        return 5;
    }

    function renderDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = "";
        const itemsVisible = getItemsVisible();
        const numPages = Math.ceil(platos.length / itemsVisible);

        for (let i = 0; i < numPages; i++) {
            const dot = document.createElement("div");
            dot.className = "slider-dot" + (i === Math.floor(currentIndex / itemsVisible) ? " active" : "");
            dot.dataset.page = i;
            dot.addEventListener("click", () => {
                currentIndex = i * itemsVisible;
                const maxIndex = Math.max(0, platos.length - itemsVisible);
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
                updateSlider();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateActiveDot(itemsVisible) {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll(".slider-dot");
        const currentPage = Math.floor(currentIndex / itemsVisible);
        dots.forEach((dot, idx) => {
            if (idx === currentPage) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function updateSlider() {
        const plates = track.querySelectorAll(".plato");
        if (plates.length === 0) return;

        const itemsVisible = getItemsVisible();
        const maxIndex = Math.max(0, plates.length - itemsVisible);
        
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        const cardWidth = plates[0].offsetWidth;
        const gap = 24;
        const slideAmount = cardWidth + gap;

        track.style.transform = `translateX(-${currentIndex * slideAmount}px)`;

        if (btnPrev) btnPrev.disabled = currentIndex === 0;
        if (btnNext) btnNext.disabled = currentIndex >= maxIndex;

        updateActiveDot(itemsVisible);
    }

    if (btnPrev && btnNext) {
        btnPrev.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        btnNext.addEventListener("click", () => {
            const plates = track.querySelectorAll(".plato");
            const itemsVisible = getItemsVisible();
            const maxIndex = Math.max(0, plates.length - itemsVisible);
            
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });
    }

    // Inicializar y escuchar redimensionamiento de pantalla
    renderDots();
    setTimeout(updateSlider, 300);

    window.addEventListener("resize", () => {
        renderDots();
        updateSlider();
    });
}

renderizarRecomendados();

/* ==========================================
   VALIDACION LOGIN PARA COMPRAR
========================================== */

document.addEventListener("click",(e)=>{

    const botonAgregar = e.target.closest(".btn-agregar");
    const botonComprar = e.target.closest(".btn-comprar") || e.target.closest(".btn-ordenar");

    if(!botonAgregar && !botonComprar){
        return;
    }

    const sesion = localStorage.getItem("nf_session");
    if(!sesion){
        e.preventDefault();
        const modalLogin = document.getElementById("modal-login");
        if (modalLogin) {
            modalLogin.classList.add("show");
        }
        return;
    }

    // VALIDACIÓN DE DEUDOR (Usuario Bloqueado)
    const usuarioSesion = JSON.parse(sesion);
    if (usuarioSesion.id_rol !== 1) {
        const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
        const estadoInfo = clientesEstado[usuarioSesion.id];
        if (estadoInfo && estadoInfo.estado === "Deudor") {
            e.preventDefault();
            e.stopPropagation();
            if (window.mostrarToastAesthetic) {
                window.mostrarToastAesthetic("Operación denegada. Registras un saldo pendiente en tu cuenta.", "error");
            } else {
                alert("Operación denegada. Registras un saldo pendiente en tu cuenta.");
            }
            return;
        }
    }

    const boton = botonAgregar || botonComprar;
    const idPlato = boton.dataset.id;

    // VALIDACIÓN DE STOCK (Plato Agotado)
    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
    const infoStock = inventario[idPlato] || { stock: 10, estado: "Disponible" };
    if (infoStock.estado === "Agotado" || infoStock.stock <= 0) {
        e.preventDefault();
        e.stopPropagation();
        window.mostrarToastAesthetic("Este plato se encuentra temporalmente agotado", "error");
        return;
    }

    let plato = null;
    if (window.listadoRecomendados) {
        plato = window.listadoRecomendados.find(p => p.id === idPlato);
    }
    if (!plato && typeof menuPlatos !== "undefined") {
        plato = menuPlatos.find(p => p.id === idPlato);
    }

    if (plato) {
        const nombre = plato.nombre || plato.name;
        const precio = plato.precio;
        const imagen = plato.imagen_url || plato.image_path;
        
        const agregado = window.agregarPlatoAlCarritoGlobal(idPlato, nombre, precio, imagen);
        
        if (agregado && botonComprar) {
            const isSubFolder = window.location.pathname.includes("/pages/") || window.location.pathname.includes("/admin/");
            const basePath = isSubFolder ? "../" : "./";
            window.location.href = `${basePath}pages/carrito.html?step=2`;
        }
    } else {
        console.warn("Plato no encontrado para id:", idPlato);
    }
});

    /* ==========================================
       MODALES LOGIN / REGISTRO
    ========================================== */

    const modalLogin = document.getElementById("modal-login");
    const modalRegistro = document.getElementById("modal-registro");

    const abrirLogin = document.getElementById("abrir-login");
    const abrirRegistro = document.getElementById("abrir-registro");

    const switchToRegister = document.getElementById("switch-to-register");
    const switchToLogin = document.getElementById("switch-to-login");

    /* ==========================================
       MENU HAMBURGUESA
    ========================================== */

    if (btnHamburguesa) {
        btnHamburguesa.addEventListener("click", () => {
            menuNavegacion.classList.toggle("show");
        });
    }

    /* ==========================================
       ABRIR MODALES
    ========================================== */

    abrirLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        modalLogin.classList.add("show");
    });

    abrirRegistro?.addEventListener("click", (e) => {
        e.preventDefault();
        modalRegistro.classList.add("show");
    });

    switchToRegister?.addEventListener("click", (e) => {
        e.preventDefault();
        modalLogin.classList.remove("show");
        modalRegistro.classList.add("show");
    });

    switchToLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        modalRegistro.classList.remove("show");
        modalLogin.classList.add("show");
    });

    /* ==========================================
       CERRAR MODALES
    ========================================== */

    document.querySelectorAll(".cerrar-modal").forEach((btn) => {
        btn.addEventListener("click", () => {
            const idModal = btn.getAttribute("data-close");
            document.getElementById(idModal).classList.remove("show");
        });
    });

    [modalLogin, modalRegistro].forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
            }
        });
    });

    /* ==========================================
       SESION
    ========================================== */

    const sesionActiva = localStorage.getItem("nf_session");

    if (sesionActiva) {
        const usuario = JSON.parse(sesionActiva);
        const nombre = (usuario.nombre || "Usuario").split(" ")[0];

        // Detectar si estamos en una carpeta secundaria (pages/ o admin/) para ajustar rutas relativas
        const isSubFolder = window.location.pathname.includes("/pages/") || window.location.pathname.includes("/admin/");
        const basePath = isSubFolder ? "../" : "./";

        // Suscribirse a notificaciones de respuestas a reclamos en tiempo real
        setTimeout(() => {
            escucharRespuestasReclamosCliente(usuario.id, basePath);
        }, 1000);

        let opcionesMenu = `
            <a href="${basePath}pages/perfil.html">Mi Perfil</a>
            <a href="${basePath}pages/mis_pedidos.html">Mis Pedidos</a>
        `;

        if (usuario.id_rol === 1 || usuario.email === "admin@nutrifit.com" || usuario.email === "cruzvasquezyhom@gmail.com") {
            opcionesMenu = `
                <a href="${basePath}admin/dashboard.html" class="menu-admin-highlight" style="background-color: var(--color-primary); color: white !important; font-weight: bold; text-align: center; border-radius: 8px; margin: 4px 10px; padding: 10px 14px; display: block;">Dashboard Administrador</a>
                <a href="${basePath}pages/perfil.html">Mi Perfil</a>
                <a href="${basePath}pages/mis_pedidos.html">Mis Pedidos</a>
            `;
        }

        authButtons.innerHTML = `
            <!-- Centro de Notificaciones -->
            <div class="notif-menu" id="notif-menu-wrapper">
                <div class="notif-toggle" id="notif-toggle-btn" aria-label="Notificaciones">
                    <i class="fa-regular fa-bell bell-icon"></i>
                    <span class="notif-badge" id="notif-badge-count" style="display: none;">0</span>
                </div>
                <div class="notif-dropdown" id="notif-dropdown">
                    <div class="notif-dropdown__header">
                        <span>Notificaciones</span>
                        <button class="btn-clear-notifs" id="btn-clear-all-notifs">Limpiar todo</button>
                    </div>
                    <div class="notif-dropdown__list" id="notif-dropdown-list">
                        <div class="notif-item empty">Cargando alertas...</div>
                    </div>
                </div>
            </div>

            <div class="usuario-menu">
                <div class="usuario-toggle">Hola, ${nombre} ▼</div>
                <div class="usuario-dropdown" id="usuario-dropdown">
                    ${opcionesMenu}
                    <a href="#" id="btn-cerrar-sesion">Cerrar Sesión</a>
                </div>
            </div>
        `;

        const usuarioToggle = document.querySelector(".usuario-toggle");
        const usuarioDropdown = document.getElementById("usuario-dropdown");
        const notifToggle = document.getElementById("notif-toggle-btn");
        const notifDropdown = document.getElementById("notif-dropdown");

        usuarioToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            usuarioDropdown.classList.toggle("show");
            if (notifDropdown) notifDropdown.classList.remove("show");
        });

        if (notifToggle) {
            notifToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                notifDropdown.classList.toggle("show");
                if (usuarioDropdown) usuarioDropdown.classList.remove("show");
                renderNavbarNotifications(basePath);
            });
        }

        document.addEventListener("click", () => {
            if (usuarioDropdown) usuarioDropdown.classList.remove("show");
            if (notifDropdown) notifDropdown.classList.remove("show");
        });

        // Initialize notifications and count badge
        actualizarBadgeNotificaciones();

        // Clear all notifications
        const btnClearNotifs = document.getElementById("btn-clear-all-notifs");
        if (btnClearNotifs) {
            btnClearNotifs.addEventListener("click", (e) => {
                e.stopPropagation();
                localStorage.setItem("nf_notifications", JSON.stringify([]));
                actualizarBadgeNotificaciones();
                renderNavbarNotifications(basePath);
            });
        }

        function getNotifications() {
            let notifs = JSON.parse(localStorage.getItem("nf_notifications") || "null");
            if (notifs === null) {
                notifs = [
                    {
                        id: "notif-sim-1",
                        tipo: "respuesta_reclamo",
                        mensaje: "NutriFit ha respondido a tu sugerencia del pedido #NF-2026-001. ¡Haz clic para ver la solución!",
                        leida: false,
                        fecha: new Date().toISOString(),
                        pedidoId: "NF-2026-001"
                    },
                    {
                        id: "notif-sim-2",
                        tipo: "cupon",
                        mensaje: "¡Cupón de fin de semana! Obtén 15% de descuento en platos seleccionados usando NUTRIDEAL.",
                        leida: false,
                        fecha: new Date(Date.now() - 3600000).toISOString()
                    }
                ];
                localStorage.setItem("nf_notifications", JSON.stringify(notifs));
            }
            return notifs;
        }

        function actualizarBadgeNotificaciones() {
            const badge = document.getElementById("notif-badge-count");
            if (!badge) return;
            const notifs = getNotifications();
            const unreadCount = notifs.filter(n => !n.leida).length;
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = "flex";
            } else {
                badge.style.display = "none";
            }
        }

        function renderNavbarNotifications(basePath) {
            const listContainer = document.getElementById("notif-dropdown-list");
            if (!listContainer) return;
            const notifs = getNotifications();
            if (notifs.length === 0) {
                listContainer.innerHTML = '<div class="notif-item empty">No tienes notificaciones nuevas</div>';
                return;
            }

            listContainer.innerHTML = notifs.map(n => {
                const isUnread = !n.leida;
                const dateObj = new Date(n.fecha);
                const timeStr = isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' });
                
                let iconClass = "fa-solid fa-gift";
                let iconColor = "var(--color-primary)";
                if (n.tipo === "respuesta_reclamo") {
                    iconClass = "fa-solid fa-envelope-open-text";
                    iconColor = "#2b7a78";
                } else if (n.tipo === "estado_pedido") {
                    iconClass = "fa-solid fa-truck-fast";
                    iconColor = "#0284c7";
                }

                return `
                    <div class="notif-item ${isUnread ? 'unread' : ''}" onclick="clicNotificacion('${n.id}', '${basePath}')">
                        <div class="notif-item__icon-wrapper" style="background-color: ${iconColor}15; color: ${iconColor};">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="notif-item__content">
                            <p class="notif-item__text">${n.mensaje}</p>
                            <span class="notif-item__time">${timeStr}</span>
                        </div>
                        ${isUnread ? '<span class="unread-dot"></span>' : ''}
                    </div>
                `;
            }).join("");
        }

        window.clicNotificacion = (notifId, basePath) => {
            const notifs = JSON.parse(localStorage.getItem("nf_notifications") || "[]");
            const idx = notifs.findIndex(n => n.id === notifId);
            if (idx > -1) {
                notifs[idx].leida = true;
                localStorage.setItem("nf_notifications", JSON.stringify(notifs));
                actualizarBadgeNotificaciones();
                
                const notif = notifs[idx];
                if (notif.tipo === "respuesta_reclamo" || notif.tipo === "estado_pedido") {
                    window.location.href = `${basePath}pages/mis_pedidos.html?pedido_id=${notif.pedidoId || ''}`;
                } else if (notif.tipo === "cupon") {
                    alert("¡Cupón copiado! Usa el código NUTRIDEAL para obtener un 15% de descuento.");
                    navigator.clipboard.writeText("NUTRIDEAL");
                }
            }
        };

        document.getElementById("btn-cerrar-sesion").addEventListener("click", async (e) => {
            e.preventDefault();
            localStorage.removeItem("nf_session");

            if (window.supabaseClient) {
                await supabaseClient.auth.signOut();
            }
            window.location.reload();
        });

        /* ==========================================
           MODAL PERFIL PENDIENTE
        ========================================== */

        if (usuario.id_rol === 2 && usuario.perfilCompleto === false) {
            setTimeout(() => {
                modalPendiente.classList.add("show");
            }, 1500);
        }
    }

    /* ==========================================
       BOTONES MODAL PERFIL
    ========================================== */

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener("click", () => {
            modalPendiente.classList.remove("show");
        });
    }

    if (btnCompletarPerfil) {
        btnCompletarPerfil.addEventListener("click", () => {
            window.location.href = "pages/perfil.html";
        });
    }

    /* ==========================================
       LOGIN
    ========================================== */

    const formLogin = document.getElementById("form-login");
    const errorLogin = document.getElementById("error-login");

    formLogin?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorLogin) {
            errorLogin.classList.remove("show");
            errorLogin.textContent = "";
        }

        const correo = document.getElementById("log-correo").value.trim();
        const contrasena = document.getElementById("log-contrasena").value;

        try {
            const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                email: correo,
                password: contrasena
            });

            if (authError) throw authError;

            if (authData.user) {
                let nombre_completo = "Usuario NutriFit";
                let id_rol = 2;
                let estaCompleto = false;

                try {
                    const { data: perfilData, error: perfilError } = await supabaseClient
                        .from("perfiles")
                        .select("nombre_completo, id_rol, peso, talla")
                        .eq("id", authData.user.id)
                        .single();

                    if (!perfilError && perfilData) {
                        nombre_completo = perfilData.nombre_completo || nombre_completo;
                        id_rol = perfilData.id_rol || id_rol;
                        estaCompleto = !!(perfilData.peso && perfilData.talla);
                    }
                } catch (perfilErr) {
                    console.warn("No se pudo obtener el perfil del usuario de la base de datos:", perfilErr);
                }

                // Validación crítica del administrador: forzar id_rol a 1 si el correo es el del administrador
                if (correo.toLowerCase() === "admin@nutrifit.com" || correo.toLowerCase() === "cruzvasquezyhom@gmail.com") {
                    id_rol = 1;
                    nombre_completo = correo.toLowerCase() === "cruzvasquezyhom@gmail.com" ? "Yhom Cruz Vasquez" : "Administrador";
                }

                const datosSesion = {
                    id: authData.user.id,
                    nombre: nombre_completo,
                    email: correo,
                    id_rol: id_rol,
                    perfilCompleto: estaCompleto
                };

                localStorage.setItem("nf_session", JSON.stringify(datosSesion));
                modalLogin.classList.remove("show");
                formLogin.reset();
                window.location.reload();
            }
        } catch (error) {
            console.error("Error en inicio de sesión:", error);
            let msg = "Credenciales incorrectas o usuario inexistente.";
            const errMsg = String(error.message || "").toLowerCase();
            if (errMsg.includes("invalid grant") || errMsg.includes("invalid credentials")) {
                msg = "Correo o contraseña incorrectos.";
            } else if (errMsg.includes("email not confirmed")) {
                msg = "Por favor, confirma tu correo electrónico antes de ingresar.";
            } else {
                msg = error.message || msg;
            }
            if (errorLogin) {
                errorLogin.textContent = msg;
                errorLogin.classList.add("show");
            }
        }
    });

    /* ==========================================
       REGISTRO
    ========================================== */

    const formRegistro = document.getElementById("form-registro");
    const errorRegistro = document.getElementById("error-registro");

    formRegistro?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorRegistro) {
            errorRegistro.classList.remove("show");
            errorRegistro.textContent = "";
        }

        const nombre = document.getElementById("reg-nombre").value.trim();
        const correo = document.getElementById("reg-correo").value.trim();
        const contrasena = document.getElementById("reg-contrasena").value;

        if (contrasena.length < 6) {
            if (errorRegistro) {
                errorRegistro.textContent = "La contraseña debe tener al menos 6 caracteres.";
                errorRegistro.classList.add("show");
            }
            return;
        }

        try {
            // El registro de la web siempre crea usuarios de rol Cliente (id_rol: 2)
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: correo,
                password: contrasena,
                options: {
                    data: {
                        nombre_completo: nombre,
                        id_rol: 2
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // El trigger handle_new_user ya crea el perfil automáticamente.
                // Intentamos actualizar o guardar el perfil desde el frontend como respaldo,
                // pero si falla debido a RLS o falta de confirmación de sesión, no interrumpimos el registro.
                try {
                    await supabaseClient
                        .from("perfiles")
                        .upsert([{
                            id: authData.user.id,
                            nombre_completo: nombre,
                            correo_electronico: correo,
                            id_rol: 2
                        }]);
                } catch (perfilErr) {
                    console.warn("Advertencia no crítica al actualizar perfil en el frontend:", perfilErr);
                }

                // Si se configuró confirmación de email y la sesión no se inicia automáticamente
                if (!authData.session) {
                    alert("¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.");
                    modalRegistro.classList.remove("show");
                    formRegistro.reset();
                    return;
                }

                const sesionCliente = {
                    id: authData.user.id,
                    nombre: nombre,
                    email: correo,
                    id_rol: 2,
                    perfilCompleto: false
                };

                localStorage.setItem("nf_session", JSON.stringify(sesionCliente));
                modalRegistro.classList.remove("show");
                formRegistro.reset();
                window.location.reload();
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            let msg = "Ocurrió un problema inesperado.";
            const errMsg = String(error.message || "").toLowerCase();
            if (errMsg.includes("invalid") || errMsg.includes("formato")) {
                msg = "El correo electrónico ingresado no tiene un formato válido.";
            } else if (errMsg.includes("already registered") || errMsg.includes("exists")) {
                msg = "Este correo electrónico ya está registrado.";
            } else if (errMsg.includes("weak")) {
                msg = "La contraseña debe tener al menos 6 caracteres.";
            } else {
                msg = error.message || msg;
            }
            if (errorRegistro) {
                errorRegistro.textContent = msg;
                errorRegistro.classList.add("show");
            }
        }
    // Verificar estado de deudor del cliente
    verificarEstadoDeudorUsuario();
});

// Lógica de validación de deudor global en el cliente
function verificarEstadoDeudorUsuario() {
    const sesionActiva = localStorage.getItem("nf_session");
    const bannerExistente = document.getElementById("banner-deudor-fijo");
    if (bannerExistente) bannerExistente.remove();

    if (!sesionActiva) return;
    const usuario = JSON.parse(sesionActiva);
    
    // El administrador no se ve afectado
    if (usuario.id_rol === 1) return;

    const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
    const estadoInfo = clientesEstado[usuario.id];

    if (estadoInfo && estadoInfo.estado === "Deudor") {
        // Inyectar banner rojo fijo en el tope de la ventana
        const banner = document.createElement("div");
        banner.id = "banner-deudor-fijo";
        banner.style.backgroundColor = "#e53935";
        banner.style.color = "#ffffff";
        banner.style.textAlign = "center";
        banner.style.padding = "12px 20px";
        banner.style.fontSize = "14px";
        banner.style.fontWeight = "700";
        banner.style.position = "relative"; // Fluye antes del resto de la página
        banner.style.zIndex = "99999";
        banner.style.width = "100%";
        banner.style.boxShadow = "0 4px 10px rgba(229, 57, 53, 0.25)";
        banner.style.display = "flex";
        banner.style.alignItems = "center";
        banner.style.justifyContent = "center";
        banner.style.gap = "10px";

        banner.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 16px;"></i>
            <span>Estimado usuario, registra un saldo pendiente en su cuenta. Por favor, regularice su pago para seguir disfrutando de NutriFit.</span>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);

        // Deshabilitar botones visuales (si existen en el DOM)
        document.querySelectorAll(".btn-agregar, .btn-comprar, .btn-ordenar, .add, .buy").forEach(btn => {
            btn.classList.add("deudor-disabled");
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
            btn.title = "Tu cuenta registra un saldo pendiente. Regulariza tu pago en tu Perfil.";
        });
    }
}

// Escuchar cambios de estado para actualizar la UI en vivo
window.addEventListener("nf_clientes_estado_modificado", verificarEstadoDeudorUsuario);

// Suscribirse a cambios de platos (stock/estado) en tiempo real
suscribirseCambiosStockIndex();
});

/**
 * Escucha en tiempo real (Supabase Realtime) las respuestas a los reclamos del usuario
 */
function escucharRespuestasReclamosCliente(usuarioId, basePath) {
    if (window.supabaseClient) {
        window.supabaseClient
            .channel('respuestas-reclamos-' + usuarioId)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'reclamos',
                    filter: `usuario_id=eq.${usuarioId}`
                },
                (payload) => {
                    console.log('Cliente Realtime: Reclamo actualizado:', payload.new);
                    const reclamo = payload.new;
                    
                    if (reclamo.estado === 'resuelto') {
                        // Extraer la respuesta del administrador de la columna detalle
                        let respuestaText = "Tu sugerencia ha sido resuelta.";
                        const parts = reclamo.detalle.split('\n[Respuesta del Administrador]: ');
                        if (parts.length > 1) {
                            respuestaText = parts[1].trim();
                        }
                        
                        // Encontrar la orden asociada a este reclamo
                        let orderId = "";
                        const match = reclamo.detalle.match(/Pedido\s+#([A-Za-z0-9-]+)/i);
                        if (match && match[1]) {
                            const shortId = match[1].toUpperCase();
                            const orders = JSON.parse(localStorage.getItem("nf_orders") || "[]");
                            const found = orders.find(o => o.id.toUpperCase().startsWith(shortId) || o.id.slice(0, 8).toUpperCase() === shortId);
                            if (found) {
                                orderId = found.id;
                            }
                        }

                        const msg = `NutriFit ha respondido a tu sugerencia. ¡Haz clic para ver la solución!`;
                        const notifId = `notif-res-${reclamo.id}`;
                        const notifs = JSON.parse(localStorage.getItem("nf_notifications") || "[]");
                        
                        // Evitar agregar duplicados
                        if (!notifs.some(n => n.id === notifId)) {
                            notifs.unshift({
                                id: notifId,
                                tipo: "respuesta_reclamo",
                                mensaje: msg,
                                leida: false,
                                fecha: new Date().toISOString(),
                                pedidoId: orderId || reclamo.id,
                                respuestaText: respuestaText
                            });
                            localStorage.setItem("nf_notifications", JSON.stringify(notifs));
                            
                            // Mostrar toast aesthetic al cliente
                            if (typeof window.mostrarToastAesthetic === 'function') {
                                window.mostrarToastAesthetic(msg, "exito");
                            } else {
                                alert(msg);
                            }
                            
                            // Actualizar la interfaz del navbar
                            const badge = document.getElementById("notif-badge-count");
                            if (badge) {
                                const unreadCount = notifs.filter(n => !n.leida).length;
                                if (unreadCount > 0) {
                                    badge.textContent = unreadCount;
                                    badge.style.display = "flex";
                                } else {
                                    badge.style.display = "none";
                                }
                            }
                            
                            // Si el dropdown de notificaciones está visible, re-renderizarlo
                            const dropdownList = document.getElementById("notif-dropdown-list");
                            if (dropdownList && dropdownList.offsetParent !== null) {
                                dropdownList.innerHTML = notifs.map(n => {
                                    const isUnread = !n.leida;
                                    const dateObj = new Date(n.fecha);
                                    const timeStr = isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' });
                                    let iconClass = "fa-solid fa-envelope-open-text";
                                    let iconColor = "#2b7a78";
                                    
                                    return `
                                        <div class="notif-item ${isUnread ? 'unread' : ''}" onclick="clicNotificacion('${n.id}', '${basePath}')">
                                            <div class="notif-item__icon-wrapper" style="background-color: ${iconColor}15; color: ${iconColor};">
                                                <i class="${iconClass}"></i>
                                            </div>
                                            <div class="notif-item__content">
                                                <p class="notif-item__text">${n.mensaje}</p>
                                                <span class="notif-item__time">${timeStr}</span>
                                            </div>
                                            ${isUnread ? '<span class="unread-dot"></span>' : ''}
                                        </div>
                                    `;
                                }).join("");
                            }
                        }
                    }
                }
            )
            .subscribe();
            
        console.log("NutriFit: Suscrito a respuestas de reclamos en tiempo real.");
    }
}

/**
 * Escucha cambios de la tabla 'platos' en tiempo real vía Supabase Realtime para la página de inicio.
 */
function suscribirseCambiosStockIndex() {
    if (window.supabaseClient) {
        window.supabaseClient
            .channel('cambios-platos-realtime-index')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'platos'
                },
                (payload) => {
                    console.log('Cliente Index Realtime: Cambio recibido para plato:', payload.new);
                    const platoActualizado = payload.new;
                    
                    // Actualizar el inventario local en localStorage
                    const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
                    inventario[platoActualizado.id] = {
                        stock: platoActualizado.stock !== undefined && platoActualizado.stock !== null ? platoActualizado.stock : (inventario[platoActualizado.id]?.stock || 10),
                        estado: platoActualizado.estado || (inventario[platoActualizado.id]?.estado || 'Disponible')
                    };
                    localStorage.setItem("nf_inventario", JSON.stringify(inventario));
                    
                    // Lógica de actualización inmediata en la interfaz sin recargar
                    const id = platoActualizado.id;
                    const estado = platoActualizado.estado || 'Disponible';
                    const stock = platoActualizado.stock;
                    const isAgotado = estado === 'Agotado' || (stock !== undefined && stock <= 0);
                    
                    // Buscar los elementos contenedores de este plato
                    const cards = document.querySelectorAll(`article[data-id="${id}"], .plato-card[data-id="${id}"]`);
                    
                    // Determinar si el usuario logueado es deudor
                    const session = JSON.parse(localStorage.getItem("nf_session") || "null");
                    let isDeudor = false;
                    if (session && session.id_rol !== 1) {
                        const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
                        const estadoInfo = clientesEstado[session.id];
                        if (estadoInfo && estadoInfo.estado === "Deudor") {
                            isDeudor = true;
                        }
                    }

                    cards.forEach(card => {
                        // Cambiar clase de diseño
                        if (isAgotado) {
                            card.classList.add("agotado");
                        } else {
                            card.classList.remove("agotado");
                        }
                        
                        // Añadir o remover etiqueta visual de AGOTADO
                        const imgContainer = card.querySelector(".plato-img-container, .plato-imagen");
                        if (imgContainer) {
                            let badge = imgContainer.querySelector(".badge-agotado-flotante");
                            if (isAgotado) {
                                if (!badge) {
                                    imgContainer.insertAdjacentHTML("afterbegin", `<span class="badge-agotado-flotante">AGOTADO</span>`);
                                }
                            } else {
                                if (badge) {
                                    badge.remove();
                                }
                            }
                        }
                        
                        // Deshabilitar o restaurar los botones de agregar/comprar
                        const buttons = card.querySelectorAll(".btn-agregar, .btn-comprar, .btn-catalog-action-icon, .btn-catalog-action");
                        buttons.forEach(btn => {
                            if (isAgotado) {
                                btn.disabled = true;
                                btn.style.opacity = "0.5";
                                btn.style.cursor = "not-allowed";
                                btn.style.pointerEvents = "none";
                            } else {
                                if (isDeudor) {
                                    btn.disabled = true;
                                    btn.style.opacity = "0.5";
                                    btn.style.cursor = "not-allowed";
                                    btn.style.pointerEvents = "none";
                                } else {
                                    btn.disabled = false;
                                    btn.style.opacity = "";
                                    btn.style.cursor = "";
                                    btn.style.pointerEvents = "";
                                }
                            }
                        });
                    });
                }
            )
            .subscribe();
            
        console.log("NutriFit: Suscrito a cambios de stock en tiempo real (Página de Inicio).");
    }
}