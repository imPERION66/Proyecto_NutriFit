/**
 * LÓGICA DE CONTROL DE LA PÁGINA DE CONTACTO - NUTRIFIT
 */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. DECLARACIÓN DE VARIABLES Y ELEMENTOS
    // ----------------------------------------------------
    const formContacto = document.getElementById("form-contacto");
    const inputNombre = document.getElementById("nombre-completo");
    const inputCorreo = document.getElementById("correo-electronico");
    const inputTelefono = document.getElementById("telefono");
    const selectMotivo = document.getElementById("motivo-consulta");
    const txtMensaje = document.getElementById("mensaje-contacto");
    
    const btnEnviar = document.getElementById("btn-enviar");
    const btnTexto = btnEnviar ? btnEnviar.querySelector(".btn-texto") : null;
    const btnIcon = btnEnviar ? btnEnviar.querySelector("i") : null;
    const btnSpinner = btnEnviar ? btnEnviar.querySelector(".spinner") : null;
    const errorForm = document.getElementById("mensaje-error-form");
    
    const toast = document.getElementById("toast-notificacion");

    let usuarioId = null;

    // ----------------------------------------------------
    // 2. AUTOCOMPLETADO DE CAMPOS POR SESIÓN ACTIVA
    // ----------------------------------------------------
    function autocompletarSesion() {
        const sesionActiva = localStorage.getItem("nf_session");
        if (sesionActiva) {
            try {
                const usuario = JSON.parse(sesionActiva);
                usuarioId = usuario.id || null;
                
                if (usuario.nombre && inputNombre) {
                    inputNombre.value = usuario.nombre;
                }
                if (usuario.email && inputCorreo) {
                    inputCorreo.value = usuario.email;
                }
                console.log("NutriFit Contacto: Campos autocompletados desde la sesión activa.");
            } catch (e) {
                console.error("Error al procesar la sesión en contacto:", e);
            }
        }
    }

    autocompletarSesion();

    // ----------------------------------------------------
    // 3. LOGICA DEL ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
    // ----------------------------------------------------
    const faqPreguntas = document.querySelectorAll(".faq-pregunta");

    faqPreguntas.forEach(pregunta => {
        pregunta.addEventListener("click", () => {
            const itemActual = pregunta.parentElement;
            const estaActivo = itemActual.classList.contains("active");

            // Cerrar todos los demás acordeones activos (Acordeón Exclusivo)
            document.querySelectorAll(".faq-item").forEach(item => {
                item.classList.remove("active");
                const btn = item.querySelector(".faq-pregunta");
                if (btn) btn.setAttribute("aria-expanded", "false");
            });

            // Si el actual no estaba activo, lo abrimos
            if (!estaActivo) {
                itemActual.classList.add("active");
                pregunta.setAttribute("aria-expanded", "true");
            }
        });
    });

    // ----------------------------------------------------
    // 4. VALIDACIONES DE FORMULARIO
    // ----------------------------------------------------
    function mostrarError(mensaje) {
        if (errorForm) {
            errorForm.textContent = mensaje;
            errorForm.classList.add("show");
        }
    }

    function ocultarError() {
        if (errorForm) {
            errorForm.textContent = "";
            errorForm.classList.remove("show");
        }
    }

    function validarCorreo(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validarTelefono(tel) {
        if (!tel) return true; // Es opcional
        // Validar que solo contenga números, espacios y caracteres como + o -
        const regex = /^[0-9\s\+\-]+$/;
        return regex.test(tel);
    }

    // ----------------------------------------------------
    // 5. ENVÍO DE CONSULTA A SUPABASE
    // ----------------------------------------------------
    if (formContacto) {
        formContacto.addEventListener("submit", async (e) => {
            e.preventDefault();
            ocultarError();

            // Captura de datos
            const nombre = inputNombre.value.trim();
            const correo = inputCorreo.value.trim();
            const telefono = inputTelefono.value.trim();
            const motivo = selectMotivo.value;
            const mensaje = txtMensaje.value.trim();

            // Validaciones de negocio en cliente
            if (nombre.length < 3) {
                mostrarError("El nombre completo debe tener al menos 3 caracteres.");
                inputNombre.focus();
                return;
            }

            if (!validarCorreo(correo)) {
                mostrarError("Por favor, ingresa un correo electrónico válido.");
                inputCorreo.focus();
                return;
            }

            if (telefono && !validarTelefono(telefono)) {
                mostrarError("Por favor, ingresa un número de teléfono válido.");
                inputTelefono.focus();
                return;
            }

            if (!motivo) {
                mostrarError("Por favor, selecciona un motivo de consulta.");
                selectMotivo.focus();
                return;
            }

            if (mensaje.length < 10) {
                mostrarError("El mensaje debe contener al menos 10 caracteres.");
                txtMensaje.focus();
                return;
            }

            // Cambiar botón a estado de cargando
            setLoadingState(true);

            try {
                // Verificar que el cliente de Supabase esté listo
                if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                    throw new Error("El servicio de base de datos no está disponible temporalmente.");
                }

                // Inserción directa en la tabla 'contactos'
                const { error } = await supabaseClient
                    .from("contactos")
                    .insert([
                        {
                            usuario_id: usuarioId, // Guardar id si está logueado, null si no
                            nombre_completo: nombre,
                            correo_electronico: correo,
                            telefono: telefono || null,
                            motivo: motivo,
                            mensaje: mensaje
                        }
                    ]);

                if (error) throw error;

                // Envío exitoso
                mostrarToast();
                limpiarFormulario();

            } catch (err) {
                console.error("Error al enviar el mensaje de contacto:", err);
                mostrarError(err.message || "Ocurrió un error al enviar el mensaje. Por favor, inténtalo más tarde.");
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Cambiar estado de cargando del botón
    function setLoadingState(isLoading) {
        if (!btnEnviar) return;
        
        if (isLoading) {
            btnEnviar.disabled = true;
            if (btnTexto) btnTexto.style.opacity = "0.6";
            if (btnIcon) btnIcon.style.display = "none";
            if (btnSpinner) btnSpinner.style.display = "inline-block";
        } else {
            btnEnviar.disabled = false;
            if (btnTexto) btnTexto.style.opacity = "1";
            if (btnIcon) btnIcon.style.display = "inline-block";
            if (btnSpinner) btnSpinner.style.display = "none";
        }
    }

    // Limpieza de formulario respetando sesión
    function limpiarFormulario() {
        if (formContacto) {
            formContacto.reset();
        }
        // Volver a autocompletar si el usuario sigue en sesión
        autocompletarSesion();
    }

    // Mostrar alerta visual elegante (Toast)
    function mostrarToast() {
        if (!toast) return;
        
        toast.classList.add("show");
        
        // Auto ocultar después de 4 segundos
        setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);
    }
});
