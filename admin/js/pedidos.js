// =========================================================================
// LÓGICA DE GESTIÓN DE PEDIDOS (ADMIN) - NUTRIFIT
// =========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificación de sesión local
    const session = JSON.parse(localStorage.getItem("nf_session") || "null");
    if (!session || session.id_rol !== 1) {
        alert("Acceso denegado. No tienes permisos de administrador.");
        window.location.replace("../index.html");
        return;
    }

    // Poblar información del administrador
    populateAdminInfo(session);

    // Inicializar controles de sidebar
    initSidebarControls();

    // Cargar datos
    await cargarDatosPedidos();

    // Asociar eventos de búsqueda y filtrado
    initFilterEvents();
});

let globalOrders = [];
let globalClaims = [];
let selectedStatusFilter = "todos";

/**
 * Muestra los datos del admin en el sidebar.
 */
function populateAdminInfo(session) {
    const avatarEl = document.querySelector("[data-user-avatar]");
    const nameEl = document.querySelector("[data-user-name]");
    const emailEl = document.querySelector("[data-user-email]");

    if (nameEl) nameEl.textContent = session.nombre || "Administrador";
    if (emailEl) emailEl.textContent = session.email || "admin@nutrifit.com";
    if (avatarEl) avatarEl.textContent = (session.nombre || "A").charAt(0).toUpperCase();
}

/**
 * Controles del menú móvil en la barra lateral.
 */
function initSidebarControls() {
    const btnMenu = document.getElementById("btn-menu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const btnLogout = document.getElementById("btn-logout-sidebar");

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

    if (btnLogout) {
        btnLogout.addEventListener("click", async (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                localStorage.removeItem("nf_session");
                alert("Sesión cerrada correctamente.");
                if (window.supabaseClient) {
                    try {
                        await supabaseClient.auth.signOut();
                    } catch (err) {
                        console.error("Error al cerrar sesión:", err);
                    }
                }
                window.location.replace("../index.html");
            }
        });
    }
}

/**
 * Carga pedidos y reclamos desde Supabase (con fallback local).
 */
async function cargarDatosPedidos() {
    mostrarLoading(true);

    try {
        // A. Cargar pedidos
        if (window.supabaseClient) {
            const { data: dbOrders, error: ordersError } = await supabaseClient
                .from("pedidos")
                .select(`
                    id,
                    fecha_pedido,
                    estado,
                    total,
                    direccion_entrega,
                    telefono,
                    metodo_pago,
                    perfiles(nombre_completo, correo_electronico),
                    detalle_pedidos (
                        id,
                        plato_id,
                        cantidad,
                        precio_unitario,
                        platos (
                            nombre
                        )
                    )
                `)
                .order("fecha_pedido", { ascending: false }); // Strictly newest first (MÁS NUEVO arriba)

            if (ordersError) throw ordersError;
            globalOrders = dbOrders || [];
        } else {
            throw new Error("Supabase no inicializado");
        }
    } catch (err) {
        console.warn("Error cargando pedidos de Supabase. Usando fallback local.", err);
        // Fallback local
        globalOrders = JSON.parse(localStorage.getItem("nf_orders") || "[]");
    }

    try {
        // B. Cargar reclamos
        if (window.supabaseClient) {
            const { data: dbClaims, error: claimsError } = await supabaseClient
                .from("reclamos")
                .select("*")
                .order("fecha_reclamo", { ascending: false });

            if (claimsError) throw claimsError;
            globalClaims = dbClaims || [];
        } else {
            throw new Error("Supabase no inicializado");
        }
    } catch (err) {
        console.warn("Error cargando reclamos de Supabase. Usando fallback local.", err);
        globalClaims = JSON.parse(localStorage.getItem("nf_reclamos") || "[]");
    }

    mostrarLoading(false);
    renderizarTarjetas();
}

/**
 * Renderiza el listado de pedidos aplicando filtros de búsqueda y estado.
 */
function renderizarTarjetas() {
    const container = document.getElementById("admin-orders-container");
    const emptyState = document.getElementById("empty-pedidos");
    if (!container) return;

    const searchTerm = document.getElementById("search-client").value.toLowerCase().trim();

    // Filtrar pedidos
    const filteredOrders = globalOrders.filter(ped => {
        const clienteNombre = (ped.perfiles?.nombre_completo || ped.cliente || "").toLowerCase();
        const telefono = (ped.telefono || "").toLowerCase();
        const idShort = ped.id.substring(0, 8).toUpperCase();
        
        // 1. Filtro de búsqueda textual
        const matchesSearch = clienteNombre.includes(searchTerm) || 
                              telefono.includes(searchTerm) || 
                              ped.id.toLowerCase().includes(searchTerm);

        // 2. Filtro de estado
        let matchesStatus = true;
        const est = String(ped.estado || "").toLowerCase().trim();
        
        if (selectedStatusFilter === "preparando") {
            matchesStatus = (est === "pendiente" || est === "preparando" || est === "en preparación" || est === "preparación");
        } else if (selectedStatusFilter === "en camino") {
            matchesStatus = (est === "en camino" || est === "en_camino");
        } else if (selectedStatusFilter === "entregado") {
            matchesStatus = (est === "entregado" || est === "recibido");
        } else if (selectedStatusFilter === "cancelado") {
            matchesStatus = (est === "cancelado");
        }

        return matchesSearch && matchesStatus;
    });

    if (filteredOrders.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    container.innerHTML = filteredOrders.map(ped => {
        const est = String(ped.estado || "").toLowerCase().trim();
        const shortId = ped.id.substring(0, 8).toUpperCase();
        
        // Traducir clase y texto de estado para el badge superior
        let badgeClass = "preparando";
        let badgeText = "En Preparación";

        if (est === "en camino" || est === "en_camino") {
            badgeClass = "en-camino";
            badgeText = "En Camino";
        } else if (est === "entregado" || est === "recibido") {
            badgeClass = "entregado";
            badgeText = "Entregado";
        } else if (est === "cancelado") {
            badgeClass = "cancelado";
            badgeText = "Cancelado";
        } else if (est === "pendiente") {
            badgeClass = "pendiente";
            badgeText = "Pendiente";
        }

        // Formatear Fecha
        const fechaObj = new Date(ped.fecha_pedido || ped.fecha);
        const fechaFormateada = isNaN(fechaObj.getTime()) ? (ped.fecha || "Sin fecha") : fechaObj.toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        // Platos html
        let platosHTML = "";
        const detalles = ped.detalle_pedidos || ped.items || [];
        if (detalles.length > 0) {
            platosHTML = detalles.map(det => {
                const nombrePlato = det.platos?.nombre || det.nombre || det.plato_id || "Plato";
                return `
                    <div class="admin-order-card__dish-item">
                        <span><span class="dish-qty">${det.cantidad}x</span> ${nombrePlato}</span>
                        <span style="color: var(--color-text-light)">S/ ${((det.precio_unitario || det.precio || 0) * det.cantidad).toFixed(2)}</span>
                    </div>
                `;
            }).join("");
        } else {
            platosHTML = `<div class="admin-order-card__dish-item" style="font-style:italic; color: var(--color-text-light)">Sin platos detallados</div>`;
        }

        // Vincular reclamos a este pedido
        const reclamoAsociado = buscarReclamoPorPedido(ped.id, shortId);
        let reclamoHTML = "";

        if (reclamoAsociado) {
            const esResuelto = reclamoAsociado.estado === "resuelto";
            
            // Analizar el texto del detalle para separar queja y respuesta si ya la tiene
            const partesDetalle = reclamoAsociado.detalle.split("\n[Respuesta del Administrador]: ");
            const quejaTexto = partesDetalle[0];
            const respuestaTexto = partesDetalle[1] || "";

            if (esResuelto) {
                reclamoHTML = `
                    <div class="claim-alert-container">
                        <div class="claim-alert-header" onclick="toggleClaimExpand('${ped.id}')" style="background-color: #d1fae5; color: #065f46;">
                            <i class="fa-solid fa-circle-check"></i> Reclamo Resuelto
                        </div>
                        <div class="claim-expandable" id="claim-box-${ped.id}">
                            <span class="claim-text-title">Queja del cliente</span>
                            <p class="claim-text" style="background-color: #f0fdf4; color: #14532d;">${quejaTexto}</p>
                            <div class="claim-resolved-info">
                                <strong>Respuesta enviada:</strong>
                                <span>${respuestaTexto}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                reclamoHTML = `
                    <div class="claim-alert-container">
                        <div class="claim-alert-header" onclick="toggleClaimExpand('${ped.id}')">
                            <i class="fa-solid fa-triangle-exclamation"></i> ¡Reclamo del Cliente Activo!
                        </div>
                        <div class="claim-expandable" id="claim-box-${ped.id}">
                            <span class="claim-text-title">Queja del cliente</span>
                            <p class="claim-text">${quejaTexto}</p>
                            <span class="claim-text-title">Enviar Respuesta</span>
                            <textarea id="reply-input-${reclamoAsociado.id}" placeholder="Escribe la solución para el cliente..." class="claim-reply-area"></textarea>
                            <button class="btn-submit-reply" onclick="responderReclamo('${reclamoAsociado.id}', '${ped.id}')">
                                <i class="fa-solid fa-paper-plane"></i> Responder al Cliente
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        // Generar selector dropdown
        const esCancelado = est === "cancelado";
        const dropdownHTML = `
            <select class="state-select" onchange="cambiarEstadoPedido('${ped.id}', this.value)" ${esCancelado ? 'disabled' : ''}>
                <option value="pendiente" ${est === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="preparando" ${est === "preparando" || est === "preparación" || est === "en preparación" ? "selected" : ""}>En Preparación</option>
                <option value="en camino" ${est === "en camino" ? "selected" : ""}>En Camino</option>
                <option value="entregado" ${est === "entregado" || est === "recibido" ? "selected" : ""}>Entregado</option>
                ${esCancelado ? '<option value="cancelado" selected disabled>Cancelado</option>' : ''}
            </select>
        `;

        return `
            <article class="admin-order-card" id="card-${ped.id}">
                <div class="admin-order-card__header">
                    <div class="admin-order-card__title-group">
                        <strong>Pedido #${shortId}</strong>
                        <p class="admin-order-card__meta">${ped.perfiles?.nombre_completo || ped.cliente || "Cliente"} · ${fechaFormateada}</p>
                    </div>
                    <span class="admin-order-chip ${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="admin-order-card__section">
                    <div class="admin-order-card__info-row">
                        <i class="fa-solid fa-location-dot"></i> ${ped.direccion_entrega || ped.direccion || "Sin dirección"}
                    </div>
                    <div class="admin-order-card__info-row">
                        <i class="fa-solid fa-phone"></i> ${ped.telefono || "Sin teléfono"}
                    </div>
                </div>

                <div class="admin-order-card__dishes">
                    ${platosHTML}
                </div>

                <div class="admin-order-card__total-section">
                    <div class="admin-order-card__total">
                        <span>Total:</span> <span class="total-val">S/ ${(ped.total || 0).toFixed(2)}</span>
                    </div>
                    ${dropdownHTML}
                </div>

                ${reclamoHTML}
            </article>
        `;
    }).join("");
}

/**
 * Busca un reclamo en la lista global que esté vinculado al ID de pedido.
 */
function buscarReclamoPorPedido(longId, shortId) {
    return globalClaims.find(claim => {
        const desc = String(claim.detalle || "");
        // Comprobar si el texto contiene el ID corto o largo
        return desc.toUpperCase().includes(shortId) || desc.toLowerCase().includes(longId.toLowerCase());
    });
}

/**
 * Expande / colapsa la caja de comentarios de reclamo.
 */
function toggleClaimExpand(pedidoId) {
    const box = document.getElementById(`claim-box-${pedidoId}`);
    if (box) {
        box.classList.toggle("show");
    }
}

/**
 * Cambia el estado de un pedido en la base de datos de Supabase y refresca la UI.
 */
async function cambiarEstadoPedido(orderId, nuevoEstado) {
    try {
        if (window.supabaseClient) {
            const { error } = await supabaseClient
                .from("pedidos")
                .update({ estado: nuevoEstado })
                .eq("id", orderId);

            if (error) throw error;
        } else {
            // Local fallback
            const idx = globalOrders.findIndex(o => o.id === orderId);
            if (idx > -1) {
                globalOrders[idx].estado = nuevoEstado;
                localStorage.setItem("nf_orders", JSON.stringify(globalOrders));
            }
        }

        // Crear una alerta de cambio de estado para que el cliente la reciba como notificación
        registrarAlertaEstadoCliente(orderId, nuevoEstado);

        showToast("Estado de pedido actualizado");
        await cargarDatosPedidos();
    } catch (err) {
        console.error("Error al actualizar estado de pedido:", err);
        showToast("Error al guardar el estado", "error");
    }
}

/**
 * Agrega respuesta a un reclamo y actualiza su estado a 'resuelto'.
 */
async function responderReclamo(claimId, pedidoId) {
    const textEl = document.getElementById(`reply-input-${claimId}`);
    const respuesta = textEl ? textEl.value.trim() : "";

    if (!respuesta) {
        alert("Por favor escribe una solución o respuesta para el cliente.");
        return;
    }

    try {
        const claim = globalClaims.find(c => c.id === claimId);
        if (!claim) return;

        // Añadir el bloque de respuesta al detalle
        const nuevoDetalle = `${claim.detalle}\n[Respuesta del Administrador]: ${respuesta}`;

        if (window.supabaseClient) {
            const { error } = await supabaseClient
                .from("reclamos")
                .update({
                    detalle: nuevoDetalle,
                    estado: "resuelto"
                })
                .eq("id", claimId);

            if (error) throw error;
        } else {
            // Local fallback
            const idx = globalClaims.findIndex(c => c.id === claimId);
            if (idx > -1) {
                globalClaims[idx].detalle = nuevoDetalle;
                globalClaims[idx].estado = "resuelto";
                localStorage.setItem("nf_reclamos", JSON.stringify(globalClaims));
            }
        }

        // Registrar una notificación en el local storage para que el cliente la reciba
        registrarNotificacionRespuestaCliente(pedidoId, respuesta);

        showToast("Respuesta enviada y reclamo resuelto");
        await cargarDatosPedidos();
    } catch (err) {
        console.error("Error al responder reclamo:", err);
        showToast("Error al responder reclamo", "error");
    }
}

/**
 * Guarda una notificación localmente para que el cliente la visualice en su barra global.
 */
function registrarNotificacionRespuestaCliente(pedidoId, respuesta) {
    const shortId = pedidoId.substring(0, 8).toUpperCase();
    const notification = {
        id: "notif-res-" + Date.now(),
        tipo: "respuesta_reclamo",
        mensaje: `NutriFit ha respondido a tu sugerencia del pedido #${shortId}. ¡Haz clic para ver la solución!`,
        leida: false,
        fecha: new Date().toISOString(),
        pedidoId: pedidoId,
        respuestaText: respuesta
    };

    const notifs = JSON.parse(localStorage.getItem("nf_notifications") || "[]");
    notifs.unshift(notification);
    localStorage.setItem("nf_notifications", JSON.stringify(notifs));
}

/**
 * Genera una alerta local de cambio de estado de pedido para el cliente.
 */
function registrarAlertaEstadoCliente(pedidoId, nuevoEstado) {
    const shortId = pedidoId.substring(0, 8).toUpperCase();
    const mappedState = nuevoEstado === "preparando" ? "En Preparación" : nuevoEstado === "en camino" ? "En Camino" : "Entregado";
    const notification = {
        id: "notif-est-" + Date.now(),
        tipo: "estado_pedido",
        mensaje: `Tu pedido #${shortId} ha cambiado de estado: ¡ahora está ${mappedState}!`,
        leida: false,
        fecha: new Date().toISOString(),
        pedidoId: pedidoId
    };

    const notifs = JSON.parse(localStorage.getItem("nf_notifications") || "[]");
    notifs.unshift(notification);
    localStorage.setItem("nf_notifications", JSON.stringify(notifs));
}

/**
 * Inicializa eventos para filtros y búsqueda de texto.
 */
function initFilterEvents() {
    const searchField = document.getElementById("search-client");
    const pills = document.querySelectorAll(".filter-pill");

    if (searchField) {
        searchField.addEventListener("input", () => {
            renderizarTarjetas();
        });
    }

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            selectedStatusFilter = pill.dataset.status;
            renderizarTarjetas();
        });
    });
}

function mostrarLoading(show) {
    const loading = document.getElementById("loading-pedidos");
    if (loading) {
        loading.style.display = show ? "block" : "none";
    }
}

function showToast(message, type = "exito") {
    const toast = document.getElementById("toast-admin");
    const msgEl = document.getElementById("toast-admin-msg");
    const iconEl = document.getElementById("toast-admin-icon");

    if (toast && msgEl && iconEl) {
        msgEl.textContent = message;
        if (type === "exito") {
            iconEl.className = "fa-solid fa-circle-check";
            iconEl.style.color = "var(--color-primary)";
        } else {
            iconEl.className = "fa-solid fa-triangle-exclamation";
            iconEl.style.color = "#cc5c5c";
        }
        
        toast.style.display = "block";
        setTimeout(() => {
            toast.style.display = "none";
        }, 3000);
    }
}

// Exponer funciones necesarias a nivel de ventana global
window.cambiarEstadoPedido = cambiarEstadoPedido;
window.responderReclamo = responderReclamo;
window.toggleClaimExpand = toggleClaimExpand;

// Cargar notificaciones en tiempo real del administrador de forma dinámica
(function() {
  if (!document.getElementById('admin-notif-script')) {
    const script = document.createElement('script');
    script.id = 'admin-notif-script';
    script.src = 'js/admin-notifications.js';
    document.body.appendChild(script);
  }
})();
