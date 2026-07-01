// =========================================================================
// SISTEMA DE NOTIFICACIONES EN TIEMPO REAL PARA EL ADMINISTRADOR - NUTRIFIT
// =========================================================================

(function() {
    let balloonEl = null;
    let iconBoxEl = null;
    let iconEl = null;
    let titleEl = null;
    let descEl = null;
    let closeBtnEl = null;
    let autoCloseTimer = null;

    // 1. Cargar dinámicamente la hoja de estilos CSS
    function cargarCSS() {
        if (!document.getElementById('admin-notif-css')) {
            const link = document.createElement('link');
            link.id = 'admin-notif-css';
            link.rel = 'stylesheet';
            link.href = 'css/admin-notifications.css';
            document.head.appendChild(link);
        }
    }

    // 2. Cargar e inyectar la estructura HTML de la notificación
    async function cargarHTML() {
        try {
            // Hacemos un fetch relativo para obtener la plantilla HTML
            const response = await fetch('admin-notifications.html');
            if (!response.ok) throw new Error("No se pudo cargar la plantilla de notificación.");
            
            const htmlText = await response.text();
            
            // Creamos un contenedor temporal e inyectamos el HTML al final del body
            const wrapper = document.createElement('div');
            wrapper.innerHTML = htmlText;
            const fragment = wrapper.querySelector('#admin-notif-balloon');
            
            if (fragment) {
                document.body.appendChild(fragment);
                
                // Mapear elementos del DOM
                balloonEl = document.getElementById('admin-notif-balloon');
                iconBoxEl = document.getElementById('admin-notif-icon-box');
                iconEl = document.getElementById('admin-notif-icon');
                titleEl = document.getElementById('admin-notif-title');
                descEl = document.getElementById('admin-notif-desc');
                closeBtnEl = document.getElementById('admin-notif-close');
                
                // Vincular evento del botón cerrar
                if (closeBtnEl) {
                    closeBtnEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        ocultarAlerta();
                    });
                }
            }
        } catch (err) {
            console.warn("NutriFit Admin Notifications: Falló la inyección dinámica, usando fallback in-memory.", err.message);
            // Fallback in-memory en caso de que falle el fetch
            inyectarFallbackHTML();
        }
    }

    // Fallback in-memory por seguridad
    function inyectarFallbackHTML() {
        const fallbackHTML = `
            <div class="admin-notif-balloon" id="admin-notif-balloon" style="display: none;">
                <div class="admin-notif-icon-box" id="admin-notif-icon-box">
                    <i id="admin-notif-icon" class="fa-solid fa-bell"></i>
                </div>
                <div class="admin-notif-content">
                    <h4 class="admin-notif-title" id="admin-notif-title">Título</h4>
                    <p class="admin-notif-desc" id="admin-notif-desc">Detalle...</p>
                </div>
                <button class="admin-notif-close" id="admin-notif-close" aria-label="Cerrar">&times;</button>
            </div>
        `;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = fallbackHTML;
        document.body.appendChild(wrapper.firstElementChild);
        
        balloonEl = document.getElementById('admin-notif-balloon');
        iconBoxEl = document.getElementById('admin-notif-icon-box');
        iconEl = document.getElementById('admin-notif-icon');
        titleEl = document.getElementById('admin-notif-title');
        descEl = document.getElementById('admin-notif-desc');
        closeBtnEl = document.getElementById('admin-notif-close');
        
        if (closeBtnEl) {
            closeBtnEl.addEventListener('click', (e) => {
                e.stopPropagation();
                ocultarAlerta();
            });
        }
    }

    // 3. Mostrar y animar la alerta
    function mostrarAlerta(titulo, desc, targetUrl, tipo) {
        if (!balloonEl) return;

        // Resetear timer de auto-ocultado anterior si existía
        if (autoCloseTimer) clearTimeout(autoCloseTimer);

        // Actualizar contenido
        titleEl.textContent = titulo;
        descEl.textContent = desc;

        // Limpiar clases de tipo previas y asignar correspondientes
        iconBoxEl.className = 'admin-notif-icon-box';
        if (tipo === 'claim') {
            iconBoxEl.classList.add('claim');
            iconEl.className = 'fa-solid fa-envelope-open-text';
        } else {
            iconBoxEl.classList.add('order');
            iconEl.className = 'fa-solid fa-truck-fast';
        }

        // Vincular redirección al hacer clic en el globo
        // Limpiamos los listeners de click anteriores clonando el nodo o reasignando onclick
        balloonEl.onclick = (e) => {
            if (e.target.id === 'admin-notif-close') return;
            window.location.href = targetUrl;
        };

        // Mostrar elemento e iniciar transición
        balloonEl.style.display = 'flex';
        setTimeout(() => {
            balloonEl.classList.add('show');
        }, 50);

        // Programar cierre automático en 8 segundos
        autoCloseTimer = setTimeout(ocultarAlerta, 8000);
    }

    // 4. Ocultar la alerta con transición suave
    function ocultarAlerta() {
        if (!balloonEl) return;
        balloonEl.classList.remove('show');
        setTimeout(() => {
            balloonEl.style.display = 'none';
        }, 400);
    }

    // 5. Conectar listeners de Supabase Realtime
    function inicializarRealtimesAdmin() {
        if (window.supabaseClient) {
            // A. Escuchar nuevas sugerencias/reclamos (INSERT)
            window.supabaseClient
                .channel('admin-realtime-reclamos')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'reclamos'
                    },
                    (payload) => {
                        console.log('Admin Realtime: Nuevo reclamo recibido:', payload.new);
                        const claim = payload.new;
                        mostrarAlerta(
                            '¡Nuevo Reclamo/Sugerencia!',
                            `El cliente ${claim.nombre_completo} ha enviado un mensaje. Haz clic para leerlo.`,
                            'reclamos.html',
                            'claim'
                        );
                    }
                )
                .subscribe();

            // B. Escuchar nuevos pedidos (INSERT)
            window.supabaseClient
                .channel('admin-realtime-pedidos')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'pedidos'
                    },
                    (payload) => {
                        console.log('Admin Realtime: Nuevo pedido recibido:', payload.new);
                        const order = payload.new;
                        mostrarAlerta(
                            '¡Nuevo Pedido Recibido!',
                            `Orden registrada por S/ ${parseFloat(order.total).toFixed(2)}. Haz clic para gestionarlo.`,
                            'pedidos.html',
                            'order'
                        );
                    }
                )
                .subscribe();

            console.log("NutriFit Admin: Suscrito exitosamente a canales Realtime de reclamos y pedidos.");
        }
    }

    // Inicializar todo al cargar el documento
    async function init() {
        cargarCSS();
        await cargarHTML();
        setTimeout(inicializarRealtimesAdmin, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
