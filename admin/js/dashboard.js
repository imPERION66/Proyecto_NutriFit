// =========================================================================
// LÓGICA DE PANEL DE CONTROL (DASHBOARD ADMINISTRADOR) - NUTRIFIT
// =========================================================================

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verificación rápida de sesión local
  const session = JSON.parse(localStorage.getItem("nf_session") || "null");
  if (!session || session.id_rol !== 1) {
    alert("Acceso denegado. No tienes permisos de administrador.");
    window.location.replace("../index.html");
    return;
  }

  // Poblar información de usuario inmediatamente
  populateUserInfo(session);

  // Inicializar controles de barra lateral y menú móvil
  initSidebarControls();

  // Inicializar botón de cierre de sesión
  initLogoutButton();

  // 2. Validación de seguridad con la sesión de Supabase y verificación de rol real en DB
  if (window.supabaseClient) {
    try {
      const { data: { session: sbSession }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !sbSession) {
        console.warn("La sesión de Supabase expiró o no coincide. Cerrando sesión local...");
        logoutAdmin();
        return;
      }

      // Consultar la base de datos para verificar el rol del usuario actual
      const { data: perfil, error: perfilError } = await supabaseClient
        .from("perfiles")
        .select("id_rol")
        .eq("id", sbSession.user.id)
        .single();

      if (perfilError || !perfil || perfil.id_rol !== 1) {
        console.warn("Acceso denegado. Rol insuficiente en la base de datos.");
        alert("Acceso denegado. No tienes permisos de administrador.");
        logoutAdmin();
        return;
      }
    } catch (err) {
      console.warn("Error en la validación remota de Supabase. Desautenticando por seguridad.", err);
      logoutAdmin();
      return;
    }
  }

  // 3. Cargar métricas analíticas y lista de pedidos
  await cargarMetricasYPedidos();
});

/**
 * Muestra el nombre y avatar del usuario administrador en la interfaz.
 */
function populateUserInfo(session) {
  const nameEl = document.getElementById("user-name");
  const emailEl = document.getElementById("user-email");
  const avatarEl = document.getElementById("user-avatar");
  const firstNameEl = document.getElementById("admin-first-name");

  if (nameEl) nameEl.textContent = session.nombre || "Administrador";
  if (emailEl) emailEl.textContent = session.email || "admin@nutrifit.com";
  if (avatarEl) avatarEl.textContent = (session.nombre || "A").charAt(0).toUpperCase();
  
  if (firstNameEl) {
    const firstName = (session.nombre || "Administrador").split(" ")[0];
    firstNameEl.textContent = firstName;
  }
}

/**
 * Inicializa los eventos del Sidebar móvil.
 */
function initSidebarControls() {
  const btnMenu = document.getElementById("btn-menu");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  function openSidebar() {
    if (sidebar) sidebar.classList.add("show");
    if (overlay) overlay.classList.add("show");
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("show");
    if (overlay) overlay.classList.remove("show");
  }

  if (btnMenu) {
    btnMenu.addEventListener("click", openSidebar);
  }
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Exponer a nivel global para compatibilidad con onclicks antiguos si existieran
  window.nfToggleSidebar = () => {
    if (sidebar && sidebar.classList.contains("show")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };
  window.nfCloseSidebar = closeSidebar;
}

/**
 * Asocia el evento de click al botón de cerrar sesión.
 */
function initLogoutButton() {
  const logoutBtn = document.getElementById("btn-logout-sidebar");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutAdmin();
    });
  }
}

/**
 * Destruye la sesión del administrador y lo redirige a la página principal.
 */
async function logoutAdmin() {
  localStorage.removeItem("nf_session");
  if (window.supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (err) {
      console.error("Error al cerrar sesión en Supabase:", err);
    }
  }
  window.location.replace("../index.html");
}

/**
 * Recupera datos de pedidos e inventario de Supabase y calcula las métricas operativas.
 */
async function cargarMetricasYPedidos() {
  let platosCount = 0;
  let categoriasActivasCount = 0;
  let orders = [];

  // A. Obtener datos de platos/menú de la base de datos
  try {
    if (window.supabaseClient) {
      const { data: platos, error: platosError } = await supabaseClient
        .from("platos")
        .select("id, categoria");
      
      if (platosError) throw platosError;

      platosCount = platos.length;
      const categoriasSet = new Set(platos.map(p => p.categoria));
      categoriasActivasCount = categoriasSet.size;
    }
  } catch (err) {
    console.warn("No se pudieron cargar platos desde Supabase. Usando fallback local.", err);
    if (typeof menuPlatos !== "undefined") {
      platosCount = menuPlatos.length;
      const categories = new Set(menuPlatos.map(p => p.category));
      categoriasActivasCount = categories.size;
    } else {
      platosCount = 40;
      categoriasActivasCount = 4;
    }
  }

  // B. Obtener datos de pedidos desde la base de datos
  try {
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
          perfiles(nombre_completo, correo_electronico)
        `)
        .order("fecha_pedido", { ascending: false });

      if (ordersError) throw ordersError;

      orders = dbOrders.map(o => {
        let dateStr = "Sin fecha";
        if (o.fecha_pedido) {
          const date = new Date(o.fecha_pedido);
          dateStr = date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        }

        const totalVal = parseFloat(o.total || 0);

        return {
          id: o.id,
          cliente: o.perfiles?.nombre_completo || "Cliente",
          email: o.perfiles?.correo_electronico || "",
          fecha: dateStr,
          rawFecha: o.fecha_pedido,
          estado: o.estado,
          direccion: o.direccion_entrega || "Sin dirección",
          telefono: o.telefono || "Sin teléfono",
          total: totalVal,
          totalFmt: `S/ ${totalVal.toFixed(2)}`
        };
      });
    } else {
      throw new Error("Supabase Client no inicializado");
    }
  } catch (err) {
    console.warn("No se pudieron cargar pedidos desde Supabase. Usando fallback de localStorage.", err);
    const localOrders = JSON.parse(localStorage.getItem("nf_orders") || "[]");
    orders = localOrders.map(o => ({
      id: o.id || Math.random().toString(36).substring(2, 9).toUpperCase(),
      cliente: o.cliente || "Cliente",
      fecha: o.fecha || new Date().toLocaleDateString("es-ES"),
      estado: o.estado || "pendiente",
      direccion: o.direccion || "Sin dirección",
      telefono: o.telefono || "Sin teléfono",
      total: parseFloat(String(o.total || "0").replace(/[^\d.]/g, "")),
      totalFmt: o.totalFmt || o.total || "S/ 0.00"
    }));
  }

  // C. Calcular métricas consolidadas
  // Sumar ingresos de todos los pedidos no cancelados
  const ingresosTotales = orders
    .filter(o => o.estado !== "cancelado")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Cantidad de pedidos activos (pendiente, preparando, en camino)
  const pedidosPendientes = orders.filter(o => 
    ["pendiente", "preparando", "en camino"].includes(String(o.estado || "").toLowerCase())
  ).length;

  // D. Actualizar elementos en el HTML
  const elIngresos = document.getElementById("admin-ingresos");
  const elPedidosCount = document.getElementById("admin-pedidos-count");
  const elTotalPlatos = document.getElementById("admin-total-platos");
  const elVentasAcumuladas = document.getElementById("admin-ventas-acumuladas");
  const elPedidosPendientes = document.getElementById("admin-pedidos-pendientes");
  const elInventarioEstado = document.getElementById("admin-inventario-estado");

  if (elIngresos) elIngresos.textContent = `S/ ${ingresosTotales.toFixed(2)}`;
  if (elPedidosCount) elPedidosCount.textContent = orders.length;
  if (elTotalPlatos) elTotalPlatos.textContent = platosCount;
  if (elVentasAcumuladas) elVentasAcumuladas.textContent = `S/ ${ingresosTotales.toFixed(2)}`;
  if (elPedidosPendientes) elPedidosPendientes.textContent = String(pedidosPendientes);
  if (elInventarioEstado) elInventarioEstado.textContent = `${categoriasActivasCount} categorías activas`;

  // E. Renderizar listado de pedidos recientes en la UI
  renderRecentOrders(orders);
}

/**
 * Renderiza los últimos pedidos en el contenedor.
 */
function renderRecentOrders(orders) {
  const listaContenedor = document.getElementById("admin-lista-pedidos");
  if (!listaContenedor) return;

  if (orders.length === 0) {
    listaContenedor.innerHTML = '<p class="empty-msg">Aún no hay pedidos registrados en la plataforma.</p>';
    return;
  }

  // Mostrar solo los 6 pedidos más recientes en el panel de control
  const recentOrders = orders.slice(0, 6);

  listaContenedor.innerHTML = `
    <div class="admin-order-grid">
      ${recentOrders.map(ped => {
        const tone = getAdminStatusTone(ped.estado);
        const translated = translateStatus(ped.estado);

        // Renderizar botones según estado
        let actionButtons = "";
        const est = String(ped.estado || "").toLowerCase();
        
        if (est === "pendiente") {
          actionButtons = `
            <button class="admin-order-btn" type="button" onclick="actualizarEstadoPedido('${ped.id}', 'preparando')">Preparación</button>
            <button class="admin-order-btn secondary" type="button" onclick="actualizarEstadoPedido('${ped.id}', 'en camino')">En camino</button>
            <button class="admin-order-btn ghost" type="button" onclick="actualizarEstadoPedido('${ped.id}', 'entregado')">Entregado</button>
          `;
        } else if (est === "preparando" || est === "preparación") {
          actionButtons = `
            <button class="admin-order-btn secondary" type="button" onclick="actualizarEstadoPedido('${ped.id}', 'en camino')">En camino</button>
            <button class="admin-order-btn ghost" type="button" onclick="actualizarEstadoPedido('${ped.id}', 'entregado')">Entregado</button>
          `;
        } else if (est === "en camino") {
          actionButtons = `
            <button class="admin-order-btn ghost" type="button" onclick="actualizarEstadoPedido('${ped.id}', 'entregado')">Entregado</button>
            <button class="admin-order-btn" type="button" style="background:#cc5c5c; box-shadow: 0 2px 4px rgba(204,92,92,0.15);" onclick="actualizarEstadoPedido('${ped.id}', 'cancelado')">Cancelar</button>
          `;
        } else {
          // entregado o cancelado
          actionButtons = `<p class="admin-order-card__meta" style="font-style:italic; font-size:12px; margin-top:4px;">Completado sin acciones pendientes</p>`;
        }

        const idLabel = ped.id.includes("-") ? `Ped: #${ped.id.substring(0, 8)}...` : `Ped: #${ped.id}`;

        return `
          <article class="admin-order-card">
            <div class="admin-order-card__header">
              <div>
                <strong>${idLabel}</strong>
                <p class="admin-order-card__meta">${ped.cliente} · ${ped.fecha}</p>
              </div>
              <span class="admin-order-chip ${tone}">${translated}</span>
            </div>
            <p class="admin-order-card__meta">
              <i class="fa-solid fa-location-dot" style="margin-right:5px; font-size:11px;"></i>Dirección: ${ped.direccion}<br>
              <i class="fa-solid fa-phone" style="margin-right:5px; font-size:11px;"></i>Teléfono: ${ped.telefono}
            </p>
            <div class="admin-order-card__meta" style="font-weight: 700; color: var(--color-dark); border-top:1px dashed var(--color-border); padding-top:10px; display:flex; justify-content:space-between;">
              <span>Monto Total:</span>
              <span>${ped.totalFmt}</span>
            </div>
            <div class="admin-order-actions">
              ${actionButtons}
            </div>
          </article>`;
      }).join("")}
    </div>`;
}

/**
 * Traduce el estado guardado a un nombre más legible y con formato.
 */
function translateStatus(status) {
  const s = String(status || "").toLowerCase().trim();
  if (s === "pendiente") return "Pendiente";
  if (s === "preparando" || s === "preparación" || s === "preparacion") return "En preparación";
  if (s === "en camino" || s === "en_camino") return "En camino";
  if (s === "entregado" || s === "recibido") return "Entregado";
  if (s === "cancelado") return "Cancelado";
  return status;
}

/**
 * Devuelve el color de badge de estado correcto.
 */
function getAdminStatusTone(status) {
  const s = String(status || "").toLowerCase().trim();
  if (s === "entregado" || s === "recibido") return "entregado";
  if (s === "en camino" || s === "en_camino") return "en-camino";
  if (s === "preparando" || s === "preparación" || s === "preparacion") return "preparando";
  if (s === "cancelado") return "cancelado";
  return "pendiente";
}

/**
 * Cambia el estado de un pedido en la base de datos de Supabase con fallback a localStorage.
 */
async function actualizarEstadoPedido(orderId, nextStatus) {
  console.log(`Intentando actualizar pedido ${orderId} al estado: ${nextStatus}`);
  
  try {
    if (window.supabaseClient) {
      const { error } = await supabaseClient
        .from("pedidos")
        .update({ estado: nextStatus })
        .eq("id", orderId);

      if (error) throw error;
      console.log("Pedido actualizado en Supabase exitosamente.");
    } else {
      throw new Error("Supabase client no cargado.");
    }
  } catch (err) {
    console.warn("No se pudo actualizar en Supabase. Actualizando localmente en localStorage.", err.message);
    
    // Fallback a localStorage
    const localOrders = JSON.parse(localStorage.getItem("nf_orders") || "[]");
    const idx = localOrders.findIndex(o => o.id === orderId);
    
    if (idx >= 0) {
      localOrders[idx].estado = nextStatus;
      localStorage.setItem("nf_orders", JSON.stringify(localOrders));
    }
  }

  // Volver a calcular métricas y redibujar lista
  await cargarMetricasYPedidos();
}

// Exponer globalmente la función para llamadas directas de los botones dinámicos
window.actualizarEstadoPedido = actualizarEstadoPedido;
