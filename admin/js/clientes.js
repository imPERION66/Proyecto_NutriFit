// =========================================================================
// LÓGICA DE GESTIÓN DE CLIENTES (ADMINISTRADOR) - NUTRIFIT
// =========================================================================

// Variables de estado
let clientesBase = [];       // Perfiles reales cargados de la base de datos o fallback
let clientesEstado = {};     // Estado de cuenta (deudas, deudor/al día) en LocalStorage
let pedidosBase = [];        // Pedidos cargados de Supabase para calcular métricas
let filteredClientes = [];   // Lista filtrada a renderizar en la UI

// Filtros de visualización
let searchFilter = "";
let tabFilter = "todos"; // todos, al_dia, deudores

// Semilla de clientes (Fallback local por si Supabase no está conectado/disponible)
const clientesFallback = [
  { id: "cliente-mock-1", nombre_completo: "Yhom Cruz Vasquez", correo_electronico: "cruzvasquezyhom@gmail.com" },
  { id: "cliente-mock-2", nombre_completo: "Juan Pérez", correo_electronico: "juan.perez@example.com" },
  { id: "cliente-mock-3", nombre_completo: "María Rodríguez", correo_electronico: "maria.rod@example.com" },
  { id: "cliente-mock-4", nombre_completo: "Carlos Mendoza", correo_electronico: "carlos.men@example.com" },
  { id: "cliente-mock-5", nombre_completo: "Ana Gómez", correo_electronico: "ana.gomez@example.com" }
];

// Fallback de pedidos (para simular recuento de compras)
const pedidosFallback = [
  { usuario_id: "cliente-mock-1", total: 120.00 },
  { usuario_id: "cliente-mock-1", total: 165.50 },
  { usuario_id: "cliente-mock-2", total: 80.00 },
  { usuario_id: "cliente-mock-2", total: 74.20 },
  { usuario_id: "cliente-mock-3", total: 45.00 },
  { usuario_id: "cliente-mock-5", total: 92.80 }
];

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

  // 2. Cargar estado de clientes en LocalStorage
  cargarClientesEstadoDesdeStorage();

  // 3. Obtener clientes y pedidos desde Supabase o fallback local
  await cargarDatosClientes();

  // 4. Inicializar controles y listeners de la vista
  initClientesEventListeners();

  // 5. Renderizar cuadrícula e indicadores
  actualizarVistaClientes();
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
 * Configura los eventos del sidebar.
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
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.removeItem("nf_session");
        alert("Sesión cerrada correctamente.");
        if (window.supabaseClient) {
          try {
            await window.supabaseClient.auth.signOut();
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
 * Carga el estado de cuentas (deuda/estado) desde LocalStorage.
 */
function cargarClientesEstadoDesdeStorage() {
  clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
  
  // Garantizar valores por defecto si no existen
  const seedIds = ["cliente-mock-1", "cliente-mock-2", "cliente-mock-3", "cliente-mock-4", "cliente-mock-5"];
  let modificado = false;

  seedIds.forEach((id, index) => {
    if (!clientesEstado[id]) {
      // Sembrar a María y Ana como Deudoras por defecto en las primeras pruebas
      if (id === "cliente-mock-3") {
        clientesEstado[id] = { estado: "Deudor", deuda: 45.00 };
      } else if (id === "cliente-mock-5") {
        clientesEstado[id] = { estado: "Deudor", deuda: 25.00 };
      } else {
        clientesEstado[id] = { estado: "Al Día", deuda: 0.00 };
      }
      modificado = true;
    }
  });

  if (modificado) {
    guardarClientesEstadoEnStorage();
  }
}

/**
 * Guarda el estado en LocalStorage y dispara evento global.
 */
function guardarClientesEstadoEnStorage() {
  localStorage.setItem("nf_clientes_estado", JSON.stringify(clientesEstado));
  window.dispatchEvent(new Event("nf_clientes_estado_modificado"));
}

/**
 * Consulta los perfiles y pedidos de Supabase.
 */
async function cargarDatosClientes() {
  try {
    if (window.supabaseClient) {
      // Cargar perfiles reales
      const { data: perfiles, error: perfErr } = await supabaseClient
        .from("perfiles")
        .select("*");
      
      if (perfErr) throw perfErr;

      clientesBase = perfiles.map(p => ({
        id: p.id,
        nombre_completo: p.nombre_completo || "Usuario Sin Nombre",
        correo_electronico: p.correo_electronico || "sin-correo@nutrifit.com"
      }));

      // Cargar pedidos para sacar estadísticas reales
      const { data: pedidos, error: pedErr } = await supabaseClient
        .from("pedidos")
        .select("usuario_id, total");
      
      if (!pedErr && pedidos) {
        pedidosBase = pedidos;
      }

      console.log("NutriFit Admin: Clientes cargados exitosamente desde Supabase.");
    } else {
      throw new Error("Cliente de Supabase no disponible.");
    }
  } catch (err) {
    console.warn("NutriFit Admin: Cargando clientes desde fallback local.", err.message);
    clientesBase = [...clientesFallback];
    pedidosBase = [...pedidosFallback];
  }
}

/**
 * Inicializa los eventos del buscador, tabs y modales.
 */
function initClientesEventListeners() {
  // Buscador
  const searchInput = document.getElementById("clientes-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchFilter = e.target.value.trim().toLowerCase();
      actualizarVistaClientes();
    });
  }

  // Pestañas de Estado
  const tabButtons = document.querySelectorAll(".btn-tab-estado");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tabFilter = btn.dataset.estado;
      actualizarVistaClientes();
    });
  });

  // Modal Registrar Pago - Cerrar
  document.getElementById("btn-close-pago-modal").addEventListener("click", cerrarModalPago);
  document.getElementById("btn-cancel-pago").addEventListener("click", cerrarModalPago);

  // Formulario Pago
  document.getElementById("form-registrar-pago").addEventListener("submit", guardarFormularioPago);
}

/**
 * Renderiza la datatable de clientes e indicadores analíticos.
 */
function actualizarVistaClientes() {
  const tbody = document.getElementById("clientes-table-body");
  const elTotal = document.getElementById("metric-total-clientes");
  const elAlDia = document.getElementById("metric-al-dia");
  const elDeudores = document.getElementById("metric-deudores");
  const elDeudaTotal = document.getElementById("metric-deuda-total");

  if (!tbody) return;

  // 1. Unificar información calculando pedidos/gastos/estados
  const listadoCompleto = clientesBase.map(cliente => {
    // Calcular pedidos y total gastado de este cliente
    const susPedidos = pedidosBase.filter(p => p.usuario_id === cliente.id);
    const totalPedidos = susPedidos.length;
    const totalSpent = susPedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    // Obtener estado crediticio (LocalStorage)
    const estadoInfo = clientesEstado[cliente.id] || { estado: "Al Día", deuda: 0.00 };

    return {
      ...cliente,
      totalPedidos,
      totalSpent,
      estado: estadoInfo.estado,
      deuda: parseFloat(estadoInfo.deuda || 0)
    };
  });

  // 2. Calcular indicadores métricos
  let cantAlDia = 0;
  let cantDeudores = 0;
  let sumaDeudas = 0;

  listadoCompleto.forEach(c => {
    if (c.estado === "Deudor") {
      cantDeudores++;
      sumaDeudas += c.deuda;
    } else {
      cantAlDia++;
    }
  });

  if (elTotal) elTotal.textContent = listadoCompleto.length;
  if (elAlDia) elAlDia.textContent = cantAlDia;
  if (elDeudores) elDeudores.textContent = cantDeudores;
  if (elDeudaTotal) elDeudaTotal.textContent = `S/ ${sumaDeudas.toFixed(2)}`;

  // 3. Filtrar
  filteredClientes = listadoCompleto.filter(c => {
    const matchesSearch = c.nombre_completo.toLowerCase().includes(searchFilter) || 
                          c.correo_electronico.toLowerCase().includes(searchFilter);

    let matchesTab = true;
    if (tabFilter === "al_dia") {
      matchesTab = (c.estado === "Al Día");
    } else if (tabFilter === "deudores") {
      matchesTab = (c.estado === "Deudor");
    }

    return matchesSearch && matchesTab;
  });

  // 4. Renderizar Filas de la Tabla
  if (filteredClientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px; color: var(--color-text-light);">
          No se encontraron clientes con los filtros actuales.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredClientes.map(c => {
    const avatarChar = (c.nombre_completo || "U").charAt(0).toUpperCase();
    const claseEstado = (c.estado === "Deudor") ? "deudor" : "al-dia";
    const labelEstado = (c.estado === "Deudor") ? "Deudor" : "Al Día";
    const checkedProp = (c.estado === "Deudor") ? "checked" : "";
    const labelToggleText = (c.estado === "Deudor") ? "Marcar Al Día" : "Marcar Deudor";

    // Mostrar botón de cobro rápido de deuda si tiene deuda
    const btnPagoRapido = (c.estado === "Deudor" && c.deuda > 0)
      ? `<button class="btn-registrar-pago-quick" onclick="abrirModalPago('${c.id}')">
           <i class="fa-solid fa-file-signature"></i> Registrar Pago
         </button>`
      : "";

    return `
      <tr>
        <td>
          <div class="td-cliente-info">
            <div class="client-avatar-mini">${avatarChar}</div>
            <div class="client-meta">
              <h4>${c.nombre_completo}</h4>
              <span>${c.correo_electronico}</span>
            </div>
          </div>
        </td>
        <td style="font-weight: 600; color: var(--color-dark);">${c.totalPedidos} ped.</td>
        <td style="font-weight: 700; color: var(--color-primary-text);">S/ ${c.totalSpent.toFixed(2)}</td>
        <td style="font-weight: 700; color: ${c.deuda > 0 ? '#e53935' : 'var(--color-text-light)'};">
          S/ ${c.deuda.toFixed(2)}
        </td>
        <td>
          <span class="badge-estado-cuenta ${claseEstado}">${labelEstado}</span>
        </td>
        <td>
          <div class="acciones-td-wrapper">
            <!-- Toggle Switch Deudor/Al Día -->
            <label class="switch-container">
              <input type="checkbox" class="switch-input" ${checkedProp} onchange="toggleEstadoCliente('${c.id}', this.checked)">
              <div class="switch-track">
                <div class="switch-thumb"></div>
              </div>
              <span class="switch-label-text">${labelToggleText}</span>
            </label>
            ${btnPagoRapido}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * Cambia el estado de un cliente deudor/al día mediante el switch.
 */
function toggleEstadoCliente(clienteId, checked) {
  const estadoInfo = clientesEstado[clienteId] || { estado: "Al Día", deuda: 0.00 };
  
  if (checked) {
    // Si se activa el deudor, asignar una deuda inicial sugerida de S/ 120.00
    clientesEstado[clienteId] = { estado: "Deudor", deuda: estadoInfo.deuda > 0 ? estadoInfo.deuda : 120.00 };
    mostrarToast("Cliente marcado como Deudor.", "error");
  } else {
    // Si se apaga, regularizar a Al Día con deuda 0
    clientesEstado[clienteId] = { estado: "Al Día", deuda: 0.00 };
    mostrarToast("Cuenta del cliente regularizada.");
  }

  guardarClientesEstadoEnStorage();
  actualizarVistaClientes();
}

/**
 * Abre el modal para registrar un pago manual.
 */
function abrirModalPago(clienteId) {
  const modal = document.getElementById("modal-registrar-pago");
  const form = document.getElementById("form-registrar-pago");
  
  form.reset();
  
  const cliente = clientesBase.find(c => c.id === clienteId);
  const estadoInfo = clientesEstado[clienteId] || { estado: "Al Día", deuda: 0.00 };

  if (cliente) {
    document.getElementById("pago-cliente-id").value = clienteId;
    document.getElementById("pago-cliente-nombre").value = cliente.nombre_completo;
    document.getElementById("pago-deuda-actual").value = `S/ ${parseFloat(estadoInfo.deuda).toFixed(2)}`;
    document.getElementById("pago-monto").value = estadoInfo.deuda;
    document.getElementById("pago-monto").max = estadoInfo.deuda; // No abonar más de la deuda real
    
    modal.classList.add("show");
  }
}

function cerrarModalPago() {
  document.getElementById("modal-registrar-pago").classList.remove("show");
}

/**
 * Guarda el pago realizado y actualiza el saldo del cliente.
 */
function guardarFormularioPago(e) {
  e.preventDefault();

  const id = document.getElementById("pago-cliente-id").value;
  const montoAbonado = parseFloat(document.getElementById("pago-monto").value) || 0;

  const estadoInfo = clientesEstado[id] || { estado: "Al Día", deuda: 0.00 };
  const nuevaDeuda = Math.max(0, estadoInfo.deuda - montoAbonado);
  const nuevoEstado = (nuevaDeuda === 0) ? "Al Día" : "Deudor";

  clientesEstado[id] = { estado: nuevoEstado, deuda: nuevaDeuda };
  guardarClientesEstadoEnStorage();

  mostrarToast(`Pago registrado con éxito. Deuda restante: S/ ${nuevaDeuda.toFixed(2)}`);
  
  actualizarVistaClientes();
  cerrarModalPago();
}

/**
 * Muestra un toast dinámico.
 */
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

// Exponer funciones necesarias para eventos inline en el HTML generado
window.toggleEstadoCliente = toggleEstadoCliente;
window.abrirModalPago = abrirModalPago;
window.actualizarVistaClientes = actualizarVistaClientes;

// Cargar notificaciones en tiempo real del administrador de forma dinámica
(function() {
  if (!document.getElementById('admin-notif-script')) {
    const script = document.createElement('script');
    script.id = 'admin-notif-script';
    script.src = 'js/admin-notifications.js';
    document.body.appendChild(script);
  }
})();
