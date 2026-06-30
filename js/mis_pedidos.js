// Lógica de Historial de Pedidos y Valoraciones de NutriFit
document.addEventListener("DOMContentLoaded", async () => {
    // ----------------------------------------------------
    // 1. VERIFICACIÓN DE SESIÓN Y SEGURIDAD
    // ----------------------------------------------------
    const sesionActiva = localStorage.getItem("nf_session");
    if (!sesionActiva) {
        console.warn("NutriFit: Sesión no activa. Redirigiendo...");
        window.location.href = "../index.html?login=required";
        return;
    }

    const usuario = JSON.parse(sesionActiva);

    // ----------------------------------------------------
    // 2. DECLARACIÓN DE VARIABLES Y ELEMENTOS
    // ----------------------------------------------------
    const listaContainer = document.getElementById("pedidos-lista-container");
    const panelVacio = document.getElementById("pedidos-vacio");
    const filterDate = document.getElementById("filter-date");
    const btnClearFilter = document.getElementById("btn-clear-filter");

    const toastNotif = document.getElementById("toast-notificacion");
    const toastIcon = document.getElementById("toast-icon");
    const toastMessage = document.getElementById("toast-message");

    let listadoPedidos = []; // Lista original de pedidos
    let listadoFiltrado = []; // Lista filtrada en pantalla
    let listadoReclamos = []; // Lista de reclamos del usuario

    // ----------------------------------------------------
    // 3. CARGA DE PEDIDOS Y RECLAMOS DESDE SUPABASE
    // ----------------------------------------------------
    async function cargarPedidos() {
        if (typeof supabaseClient === "undefined" || !supabaseClient) {
            console.warn("Conexión de base de datos no disponible.");
            mostrarMensajeError("El servicio de base de datos no está disponible. Inténtalo de nuevo más tarde.");
            return;
        }

        try {
            // A. Cargar reclamos del usuario para sincronizar respuestas
            try {
                if (window.supabaseClient) {
                    const { data: claims, error: claimsErr } = await supabaseClient
                        .from("reclamos")
                        .select("*")
                        .eq("usuario_id", usuario.id);
                    if (!claimsErr) {
                        listadoReclamos = claims || [];
                    }
                }
            } catch (errClaims) {
                console.warn("Error cargando reclamos. Cargando fallback local.", errClaims);
                listadoReclamos = JSON.parse(localStorage.getItem("nf_reclamos") || "[]")
                    .filter(c => c.usuario_id === usuario.id);
            }

            // B. Cargar pedidos
            const { data, error } = await supabaseClient
                .from("pedidos")
                .select(`
                    id,
                    fecha_pedido,
                    estado,
                    total,
                    direccion_entrega,
                    telefono,
                    metodo_pago,
                    detalle_pedidos (
                        id,
                        plato_id,
                        cantidad,
                        precio_unitario,
                        platos (
                            nombre,
                            imagen_url
                        )
                    )
                `)
                .eq("usuario_id", usuario.id)
                .order("fecha_pedido", { ascending: true });

            if (error) throw error;

            listadoPedidos = data || [];
            listadoFiltrado = [...listadoPedidos];
            renderizarPedidos();

            // C. Verificar si se debe resaltar algún pedido procedente de notificación
            verificarPedidoResaltado();

        } catch (err) {
            console.error("Error al cargar pedidos de Supabase:", err);
            // Fallback completo local
            const localOrders = JSON.parse(localStorage.getItem("nf_orders") || "[]");
            listadoPedidos = localOrders.filter(o => o.usuario_id === usuario.id || !o.usuario_id);
            listadoFiltrado = [...listadoPedidos];
            
            listadoReclamos = JSON.parse(localStorage.getItem("nf_reclamos") || "[]")
                .filter(c => c.usuario_id === usuario.id);
                
            renderizarPedidos();
            verificarPedidoResaltado();
        }
    }

    // Mostrar notificaciones Toast
    function mostrarNotificacion(mensaje, tipo = "exito") {
        if (!toastNotif) return;
        toastMessage.textContent = mensaje;
        if (tipo === "exito") {
            toastIcon.className = "fa-solid fa-circle-check toast-pago-icon";
            toastIcon.style.color = "var(--color-primary)";
        } else {
            toastIcon.className = "fa-solid fa-circle-exclamation toast-pago-icon";
            toastIcon.style.color = "var(--color-accent-red)";
        }
        toastNotif.style.display = "block";
        setTimeout(() => {
            toastNotif.style.display = "none";
        }, 2500);
    }

    function mostrarMensajeError(msg) {
        if (listaContainer) {
            listaContainer.innerHTML = `<p class="loading-msg" style="color: var(--color-accent-red);"><i class="fa-solid fa-triangle-exclamation"></i> ${msg}</p>`;
        }
    }

    /* =========================================================================
       4. RENDERIZADO DE TARJETAS DE PEDIDO
       ========================================================================= */

    function renderizarPedidos() {
        if (listadoFiltrado.length === 0) {
            listaContainer.style.display = "none";
            panelVacio.style.display = "block";
            return;
        }

        listaContainer.style.display = "flex";
        panelVacio.style.display = "none";

        listaContainer.innerHTML = listadoFiltrado.map(pedido => {
            const est = String(pedido.estado || "").toLowerCase().trim();
            const esRecibido = (est === "entregado" || est === "recibido");
            const esEnCamino = (est === "en camino" || est === "en_camino");
            const esPreparando = (est === "pendiente" || est === "preparando" || est === "en preparación" || est === "preparación");
            const esCancelado = (est === "cancelado");

            // Traducir estados
            let badgeClass = "status-preparacion";
            let badgeText = "En Preparación";
            if (esEnCamino) {
                badgeClass = "status-camino";
                badgeText = "En Camino";
            } else if (esRecibido) {
                badgeClass = "status-recibido";
                badgeText = "Recibido";
            } else if (esCancelado) {
                badgeClass = "status-preparacion"; // fallback
                badgeText = "Cancelado";
            }

            // Formatear Fecha
            const fechaObj = new Date(pedido.fecha_pedido || pedido.fecha);
            const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const fechaFormateada = isNaN(fechaObj.getTime()) ? (pedido.fecha || "Sin fecha") : fechaObj.toLocaleDateString('es-ES', opcionesFecha);

            // Mapear platos
            const detalles = pedido.detalle_pedidos || pedido.items || [];
            const platosHTML = detalles.map(detalle => {
                const nombrePlato = detalle.platos ? detalle.platos.nombre : (detalle.nombre || detalle.plato_id || "Plato");
                const unitPrice = parseFloat(detalle.precio_unitario || detalle.precio || 0);
                return `
                    <div class="pedido-plato-item">
                        <div class="plato-item-details">
                            <span class="plato-item-qty">${detalle.cantidad}</span>
                            <span class="plato-item-name">${nombrePlato}</span>
                        </div>
                        <span class="plato-item-price">S/ ${(unitPrice * detalle.cantidad).toFixed(2)}</span>
                    </div>
                `;
            }).join("");

            // Generar ID estético de orden acortada
            const shortId = pedido.id.length > 12 ? pedido.id.slice(0, 8).toUpperCase() : pedido.id;

            // Verificar si este pedido ya tiene valoración o reclamo resuelto
            const yaValorado = localStorage.getItem(`nf_valorado_${pedido.id}`) === "true";
            const reclamoAsociado = listadoReclamos.find(r => r.detalle.toUpperCase().includes(shortId) || r.detalle.toLowerCase().includes(pedido.id.toLowerCase()));
            
            let adminResponseHTML = "";
            let tieneRespuesta = false;

            if (reclamoAsociado && reclamoAsociado.estado === "resuelto") {
                tieneRespuesta = true;
                const partes = reclamoAsociado.detalle.split("\n[Respuesta del Administrador]: ");
                const respuesta = partes[1] || "Tu sugerencia ha sido resuelta.";
                adminResponseHTML = `
                    <div class="admin-response-block" style="background-color: #f0fdf4; border: 1px solid #d1fae5; border-radius: 8px; padding: 12px; margin-top: 12px;">
                        <strong style="color: #0f5132; font-size: 12px; display: block; margin-bottom: 4px;"><i class="fa-solid fa-reply"></i> Respuesta de NutriFit:</strong>
                        <p style="color: #14532d; font-size: 13px; margin: 0; line-height: 1.4;">${respuesta}</p>
                    </div>
                `;
            }

            // Decidir si mostramos la sección de feedback (de forma bloqueada si ya valorado)
            const showFeedbackSec = yaValorado || tieneRespuesta;

            return `
                <article class="pedido-card" id="card-${pedido.id}" data-id="${pedido.id}">
                    <div class="pedido-header">
                        <div class="pedido-id-group">
                            <span class="pedido-id">Orden #${shortId}</span>
                            <span class="pedido-fecha">${fechaFormateada}</span>
                        </div>
                        <span class="pedido-status-badge ${badgeClass}" id="badge-${pedido.id}">${badgeText}</span>
                    </div>

                    <div class="pedido-platos-list">
                        ${platosHTML}
                    </div>

                    <div class="pedido-footer">
                        <div class="pedido-total-group">
                            <span class="pedido-total-label">Total:</span>
                            <span class="pedido-total-val">S/ ${(pedido.total || 0).toFixed(2)}</span>
                        </div>
                        
                        <div class="pedido-footer-actions">
                            ${esPreparando ? `
                                <button class="btn-cancelar-pedido" data-action="cancelar" data-id="${pedido.id}">
                                    Cancelar Pedido
                                </button>
                            ` : ''}
                            ${esEnCamino ? `
                                <button class="btn-confirmar-recepcion" data-action="confirmar" data-id="${pedido.id}">
                                    Confirmar Recepción
                                </button>
                                <button class="btn-cancelar-pedido disabled" disabled style="background-color: var(--color-border); color: var(--color-text-light); border-color: var(--color-border); cursor: not-allowed; opacity: 0.6;" title="No se puede cancelar comida en ruta">
                                    Cancelar Bloqueado
                                </button>
                            ` : ''}
                            ${esRecibido ? `
                                <button class="btn-solicitar-devolucion" data-action="devolucion" data-id="${pedido.id}">
                                    <i class="fa-solid fa-comment-dots"></i> Reportar Problema
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- CAJA DE CONFIRMACIÓN ESTÁTICA PARA CANCELACIÓN -->
                    <div class="confirm-cancel-box" id="confirm-box-${pedido.id}" style="display: none; background-color: #fdf2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-top: 10px; text-align: center;">
                        <p style="color: #7f1d1d; font-size: 13px; font-weight: bold; margin-bottom: 8px;">¿Estás seguro de que deseas cancelar este pedido?</p>
                        <button class="btn-confirm-yes" onclick="cancelarPedidoEjecutar('${pedido.id}')" style="background-color: #cc5c5c; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-right: 8px;">Sí, cancelar</button>
                        <button class="btn-confirm-no" onclick="cancelarPedidoOcultar('${pedido.id}')" style="background-color: var(--color-border); color: var(--color-text); border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">No</button>
                    </div>

                    <!-- SECCIÓN DE FEEDBACK / VALORACIÓN -->
                    <div class="feedback-section" id="feedback-sec-${pedido.id}" style="display: ${showFeedbackSec ? 'block' : 'none'};">
                        <div class="feedback-header-row">
                            <span class="feedback-title"><i class="fa-solid fa-star"></i> Valorar platos / Enviar Reclamo</span>
                            <div class="stars-container ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}" data-id="${pedido.id}">
                                <i class="fa-regular fa-star star-icon ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}" data-value="1"></i>
                                <i class="fa-regular fa-star star-icon ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}" data-value="2"></i>
                                <i class="fa-regular fa-star star-icon ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}" data-value="3"></i>
                                <i class="fa-regular fa-star star-icon ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}" data-value="4"></i>
                                <i class="fa-regular fa-star star-icon ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}" data-value="5"></i>
                            </div>
                        </div>

                        <div class="feedback-comment-wrapper">
                            <textarea 
                                class="feedback-textarea" 
                                id="comment-${pedido.id}" 
                                placeholder="Escribe tus comentarios, sugerencias o reclamos sobre este pedido..." 
                                ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}
                            >${yaValorado || tieneRespuesta ? (reclamoAsociado ? reclamoAsociado.detalle.split('\n[Respuesta')[0] : '¡Muchas gracias por tus comentarios!') : ''}</textarea>
                            
                            <button 
                                class="btn-submit-feedback" 
                                data-action="comentario" 
                                data-id="${pedido.id}" 
                                ${!esRecibido || yaValorado || tieneRespuesta ? 'disabled' : ''}
                            >
                                ${yaValorado || tieneRespuesta ? 'Comentario enviado' : 'Enviar Comentario'}
                            </button>
                        </div>
                        ${adminResponseHTML}
                    </div>
                </article>
            `;
        }).join("");

        adjuntarEventosCards();
    }

    /* =========================================================================
       5. INTERACCIONES EN LAS TARJETAS (ESTRELLAS, BOTONES Y FORMULARIOS)
       ========================================================================= */

    function adjuntarEventosCards() {
        // Evento: Confirmar Recepción
        listaContainer.querySelectorAll('[data-action="confirmar"]').forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

                let guardado = false;
                if (window.supabaseClient) {
                    try {
                        const { error } = await supabaseClient
                            .from("pedidos")
                            .update({ estado: "entregado" })
                            .eq("id", id);

                        if (error) throw error;
                        guardado = true;
                    } catch (err) {
                        console.error("Error al actualizar estado del pedido a entregado:", err);
                        mostrarNotificacion("Error al actualizar la base de datos", "error");
                        btn.disabled = false;
                        btn.textContent = "Confirmar Recepción";
                    }
                } else {
                    guardado = true; // Fallback
                }

                if (guardado) {
                    mostrarNotificacion("Recepción confirmada. ¡Valora tu pedido!");
                    
                    // Actualizar el objeto local
                    const index = listadoPedidos.findIndex(p => p.id === id);
                    if (index > -1) {
                        listadoPedidos[index].estado = "entregado";
                    }
                    
                    const fIdx = listadoFiltrado.findIndex(p => p.id === id);
                    if (fIdx > -1) {
                        listadoFiltrado[fIdx].estado = "entregado";
                    }

                    renderizarPedidos();
                }
            });
        });

        // Evento: Clic en "Reportar Problema" para toggler feedback
        listaContainer.querySelectorAll('[data-action="devolucion"]').forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                window.toggleFeedbackSection(id);
            });
        });

        // Evento: Cancelar Pedido (mostrar confirmación)
        listaContainer.querySelectorAll('[data-action="cancelar"]').forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                window.cancelarPedidoConfirmar(id);
            });
        });

        // Evento: Clic en Estrellas
        listaContainer.querySelectorAll(".stars-container:not(.disabled) .star-icon").forEach(star => {
            star.addEventListener("click", () => {
                const container = star.parentElement;
                const value = parseInt(star.dataset.value);
                const orderId = container.dataset.id;

                container.dataset.selectedValue = value;

                const stars = container.querySelectorAll(".star-icon");
                stars.forEach(s => {
                    const val = parseInt(s.dataset.value);
                    if (val <= value) {
                        s.classList.remove("fa-regular");
                        s.classList.add("fa-solid", "selected");
                    } else {
                        s.classList.remove("fa-solid", "selected");
                        s.classList.add("fa-regular");
                    }
                });
            });
        });

        // Evento: Enviar Comentarios / Reclamos
        listaContainer.querySelectorAll('[data-action="comentario"]').forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const txtArea = document.getElementById(`comment-${id}`);
                const commentVal = txtArea ? txtArea.value.trim() : "";

                if (commentVal === "") {
                    alert("Por favor escribe tu comentario o sugerencia antes de enviar.");
                    return;
                }

                const starsContainer = document.querySelector(`.stars-container[data-id="${id}"]`);
                const starsVal = starsContainer && starsContainer.dataset.selectedValue ? parseInt(starsContainer.dataset.selectedValue) : 5;

                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

                let enviado = false;
                const detalleTexto = `[Calificación: ${starsVal} estrellas] - Sugerencia/Reclamo del Pedido #${id.slice(0,8).toUpperCase()}: ${commentVal}`;
                const pedido = listadoPedidos.find(p => p.id === id) || {};
                const telefonoPedido = pedido.telefono || usuario.telefono || null;

                if (window.supabaseClient) {
                    try {
                        const { error } = await supabaseClient
                            .from("reclamos")
                            .insert([{
                                usuario_id: usuario.id,
                                nombre_completo: usuario.nombre,
                                correo: usuario.email,
                                telefono: telefonoPedido,
                                detalle: detalleTexto,
                                estado: 'pendiente'
                            }]);

                        if (error) throw error;
                        enviado = true;
                    } catch (err) {
                        console.error("Error al registrar comentario en Supabase:", err);
                        mostrarNotificacion("Error al registrar comentario", "error");
                        btn.disabled = false;
                        btn.textContent = "Enviar Comentario";
                    }
                } else {
                    // Fallback local storage
                    const localClaims = JSON.parse(localStorage.getItem("nf_reclamos") || "[]");
                    localClaims.unshift({
                        id: "claim-" + Date.now(),
                        usuario_id: usuario.id,
                        nombre_completo: usuario.nombre,
                        correo: usuario.email,
                        telefono: telefonoPedido,
                        detalle: detalleTexto,
                        fecha_reclamo: new Date().toISOString(),
                        estado: 'pendiente'
                    });
                    localStorage.setItem("nf_reclamos", JSON.stringify(localClaims));
                    enviado = true;
                }

                if (enviado) {
                    mostrarNotificacion("¡Muchas gracias por tu valoración!");
                    localStorage.setItem(`nf_valorado_${id}`, "true");
                    await cargarPedidos(); // Recargar para reflejar estado valorado
                }
            });
        });
    }

    /* =========================================================================
       WINDOW GLOBALS PARA EVENTOS
       ========================================================================= */

    window.toggleFeedbackSection = (pedidoId) => {
        const sec = document.getElementById(`feedback-sec-${pedidoId}`);
        if (sec) {
            if (sec.style.display === "none") {
                sec.style.display = "block";
                sec.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                sec.style.display = "none";
            }
        }
    };

    window.cancelarPedidoConfirmar = (pedidoId) => {
        const box = document.getElementById(`confirm-box-${pedidoId}`);
        if (box) box.style.display = "block";
    };

    window.cancelarPedidoOcultar = (pedidoId) => {
        const box = document.getElementById(`confirm-box-${pedidoId}`);
        if (box) box.style.display = "none";
    };

    window.cancelarPedidoEjecutar = async (pedidoId) => {
        let cancelado = false;

        if (window.supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from("pedidos")
                    .update({ estado: "cancelado" })
                    .eq("id", pedidoId);

                if (error) throw error;
                cancelado = true;
            } catch (err) {
                console.error("Error al cancelar pedido:", err);
                mostrarNotificacion("Error al cancelar en base de datos", "error");
            }
        } else {
            // Local fallback
            const localOrders = JSON.parse(localStorage.getItem("nf_orders") || "[]");
            const idx = localOrders.findIndex(o => o.id === pedidoId);
            if (idx > -1) {
                localOrders[idx].estado = "cancelado";
                localStorage.setItem("nf_orders", JSON.stringify(localOrders));
            }
            cancelado = true;
        }

        if (cancelado) {
            // Generar alerta de cancelación local en notificaciones
            const shortId = pedidoId.substring(0, 8).toUpperCase();
            const notification = {
                id: "notif-can-" + Date.now(),
                tipo: "estado_pedido",
                mensaje: `Tu pedido #${shortId} ha sido cancelado con éxito.`,
                leida: false,
                fecha: new Date().toISOString(),
                pedidoId: pedidoId
            };
            const notifs = JSON.parse(localStorage.getItem("nf_notifications") || "[]");
            notifs.unshift(notification);
            localStorage.setItem("nf_notifications", JSON.stringify(notifs));

            mostrarNotificacion("Pedido cancelado exitosamente.");
            await cargarPedidos();
        }
    };

    function verificarPedidoResaltado() {
        const urlParams = new URLSearchParams(window.location.search);
        const targetPedidoId = urlParams.get("pedido_id");
        if (targetPedidoId) {
            setTimeout(() => {
                const card = document.getElementById(`card-${targetPedidoId}`);
                if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "center" });
                    card.classList.add("pedido-card-highlight");
                    
                    const sec = document.getElementById(`feedback-sec-${targetPedidoId}`);
                    if (sec) sec.style.display = "block";

                    // Remover resaltado después de unos segundos
                    setTimeout(() => {
                        card.classList.remove("pedido-card-highlight");
                    }, 6000);
                }
            }, 800);
        }
    }

    /* =========================================================================
       6. LÓGICA DEL FILTRADO DE CALENDARIO
       ========================================================================= */

    // Filtrar al seleccionar una fecha
    if (filterDate) {
        filterDate.addEventListener("change", () => {
            const selectedDateStr = filterDate.value; // Formato YYYY-MM-DD
            if (selectedDateStr === "") {
                listadoFiltrado = [...listadoPedidos];
            } else {
                listadoFiltrado = listadoPedidos.filter(pedido => {
                    const orderDateObj = new Date(pedido.fecha_pedido || pedido.fecha);
                    const year = orderDateObj.getFullYear();
                    const month = String(orderDateObj.getMonth() + 1).padStart(2, "0");
                    const day = String(orderDateObj.getDate()).padStart(2, "0");
                    const orderDateStr = `${year}-${month}-${day}`;
                    return orderDateStr === selectedDateStr;
                });
            }
            renderizarPedidos();
        });
    }

    // Limpiar Filtro
    if (btnClearFilter) {
        btnClearFilter.addEventListener("click", () => {
            if (filterDate) {
                filterDate.value = "";
            }
            listadoFiltrado = [...listadoPedidos];
            renderizarPedidos();
        });
    }

    // ----------------------------------------------------
    // 7. CARGA INICIAL
    // ----------------------------------------------------
    await cargarPedidos();
});
