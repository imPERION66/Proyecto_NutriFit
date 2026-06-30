// =========================================================================
// LÓGICA DE CONTROL DE RECLAMOS Y SUGERENCIAS (ADMIN) - NUTRIFIT
// =========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificación de sesión local
    const session = JSON.parse(localStorage.getItem("nf_session") || "null");
    if (!session || session.id_rol !== 1) {
        alert("Acceso denegado. No tienes permisos de administrador.");
        window.location.replace("../index.html");
        return;
    }

    // Poblar datos del administrador
    populateAdminInfo(session);

    // Inicializar controles del sidebar móvil
    initSidebarControls();

    // Cargar datos de reclamos
    await cargarReclamos();

    // Filtros de búsqueda
    initFilterEvents();
});

let globalClaims = [];
let selectedStatusFilter = "todos";

/**
 * Muestra información del admin en el panel lateral.
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
 * Inicializa menús laterales móviles y cierre de sesión.
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
            localStorage.removeItem("nf_session");
            if (window.supabaseClient) {
                try {
                    await supabaseClient.auth.signOut();
                } catch (err) {
                    console.error("Error al cerrar sesión:", err);
                }
            }
            window.location.replace("../index.html");
        });
    }
}

/**
 * Recupera la lista de reclamos desde la base de datos o almacenamiento local.
 */
async function cargarReclamos() {
    const tbody = document.getElementById("claims-table-body");
    if (!tbody) return;

    try {
        if (window.supabaseClient) {
            const { data: dbClaims, error: claimsError } = await supabaseClient
                .from("reclamos")
                .select("*")
                .order("fecha_reclamo", { ascending: false });

            if (claimsError) throw claimsError;
            globalClaims = dbClaims || [];
        } else {
            throw new Error("Supabase client no cargado.");
        }
    } catch (err) {
        console.warn("No se pudieron cargar reclamos desde Supabase. Usando fallback local.", err.message);
        globalClaims = JSON.parse(localStorage.getItem("nf_reclamos") || "[]");
    }

    renderizarTabla();
}

/**
 * Dibuja las filas de la tabla según los filtros activos.
 */
function renderizarTabla() {
    const tbody = document.getElementById("claims-table-body");
    const emptyState = document.getElementById("empty-claims");
    if (!tbody) return;

    const searchTerm = document.getElementById("search-claim").value.toLowerCase().trim();

    // Filtrar reclamos
    const filteredClaims = globalClaims.filter(claim => {
        const clienteNombre = (claim.nombre_completo || "").toLowerCase();
        const correo = (claim.correo || "").toLowerCase();
        const detalle = (claim.detalle || "").toLowerCase();
        
        // Match de texto
        const matchesSearch = clienteNombre.includes(searchTerm) || 
                              correo.includes(searchTerm) || 
                              detalle.includes(searchTerm);

        // Match de estado
        let matchesStatus = true;
        const est = String(claim.estado || "").toLowerCase().trim();

        if (selectedStatusFilter === "pendiente") {
            matchesStatus = (est === "pendiente" || est === "en revision" || est === "en_revision");
        } else if (selectedStatusFilter === "resuelto") {
            matchesStatus = (est === "resuelto");
        }

        return matchesSearch && matchesStatus;
    });

    if (filteredClaims.length === 0) {
        tbody.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    tbody.innerHTML = filteredClaims.map(claim => {
        const est = String(claim.estado || "").toLowerCase().trim();
        const esResuelto = est === "resuelto";
        
        // Parsear ID de pedido corto desde el detalle
        const orderIdMatch = claim.detalle.match(/Pedido\s+#([0-9A-F]{8})/i);
        const orderShortId = orderIdMatch ? orderIdMatch[1] : "S/N";

        // Parsear calificación
        const starMatch = claim.detalle.match(/\[Calificación:\s*(\d+)\s*estrellas\]/);
        const starCount = starMatch ? parseInt(starMatch[1]) : 5;

        // Limpiar el texto original del reclamo para ocultar la calificación y ID Pedido
        let cleanText = claim.detalle.split("\n[Respuesta del Administrador]: ");
        const originalMessage = cleanText[0]
            .replace(/\[Calificación:\s*\d+\s*estrellas\]\s*-\s*/gi, "")
            .replace(/Sugerencia\/Reclamo del Pedido\s+#[0-9A-F]{8}:\s*/gi, "");

        const respuestaAdmin = cleanText[1] || "";

        // Badge de estado
        const badgeHTML = esResuelto 
            ? `<span class="badge-status resuelto">Resuelto</span>` 
            : `<span class="badge-status pendiente">Pendiente</span>`;

        // Estrellas
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= starCount 
                ? '<i class="fa-solid fa-star"></i>' 
                : '<i class="fa-regular fa-star"></i>';
        }

        // Acciones
        let accionesHTML = "";
        if (esResuelto) {
            accionesHTML = `
                <div class="response-locked-box">
                    <strong>Respuesta enviada:</strong>
                    <span>${respuestaAdmin}</span>
                </div>
            `;
        } else {
            accionesHTML = `
                <div class="action-reply-container">
                    <textarea id="reply-table-${claim.id}" placeholder="Escribe la solución..." class="action-reply-textarea"></textarea>
                    <button class="btn-reply-claim" onclick="responderReclamoTabla('${claim.id}', '${orderShortId}')">
                        <i class="fa-solid fa-paper-plane"></i> Responder
                    </button>
                </div>
            `;
        }

        // Formatear Fecha
        const fechaObj = new Date(claim.fecha_reclamo);
        const fechaFormateada = isNaN(fechaObj.getTime()) ? (claim.fecha_reclamo || "Sin fecha") : fechaObj.toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        return `
            <tr id="row-${claim.id}">
                <td><strong>#${orderShortId}</strong></td>
                <td>
                    <div style="font-weight: 700; color: var(--color-dark);">${claim.nombre_completo}</div>
                    <div style="font-size: 11px; color: var(--color-text-light); word-break: break-all;">${claim.correo}</div>
                </td>
                <td>
                    <span class="stars-display">${starsHTML}</span>
                    <p class="claim-desc-text">${originalMessage}</p>
                    ${claim.telefono ? `<div class="claim-phone-meta"><i class="fa-solid fa-phone"></i> Tel: ${claim.telefono}</div>` : ""}
                </td>
                <td>${fechaFormateada}</td>
                <td>${badgeHTML}</td>
                <td>${accionesHTML}</td>
            </tr>
        `;
    }).join("");
}

/**
 * Resuelve y responde a un reclamo desde la tabla.
 */
async function responderReclamoTabla(claimId, orderShortId) {
    const textEl = document.getElementById(`reply-table-${claimId}`);
    const respuesta = textEl ? textEl.value.trim() : "";

    if (!respuesta) {
        alert("Por favor escribe una solución o respuesta para el cliente.");
        return;
    }

    try {
        const claim = globalClaims.find(c => c.id === claimId);
        if (!claim) return;

        // Concatenar respuesta al detalle
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

        // Buscar el ID largo del pedido asociado para poder registrar la notificación
        let longOrderId = claimId; // fallback
        const ordersList = JSON.parse(localStorage.getItem("nf_orders") || "[]");
        const foundPed = ordersList.find(o => o.id.substring(0, 8).toUpperCase() === orderShortId);
        if (foundPed) {
            longOrderId = foundPed.id;
        }

        // Registrar una notificación en el local storage para que el cliente la reciba
        registrarNotificacionRespuestaCliente(longOrderId, respuesta);

        showToast("Reclamo resuelto y respuesta enviada");
        await cargarReclamos();
    } catch (err) {
        console.error("Error al responder reclamo desde tabla:", err);
        showToast("Error al registrar la respuesta", "error");
    }
}

/**
 * Registra una notificación local para el cliente.
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
 * Inicializa eventos para filtros y búsqueda de texto.
 */
function initFilterEvents() {
    const searchField = document.getElementById("search-claim");
    const pills = document.querySelectorAll(".filter-pill");

    if (searchField) {
        searchField.addEventListener("input", () => {
            renderizarTabla();
        });
    }

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            selectedStatusFilter = pill.dataset.status;
            renderizarTabla();
        });
    });
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

// Exponer a nivel global para compatibilidad con onclicks
window.responderReclamoTabla = responderReclamoTabla;
