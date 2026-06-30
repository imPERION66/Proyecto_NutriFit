/**
 * LÓGICA DE CONTROL DEL DASHBOARD "MI PERFIL" - NUTRIFIT
 */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. VERIFICACIÓN DE SESIÓN Y REDIRECCIÓN
    // ----------------------------------------------------
    const sesionActiva = localStorage.getItem("nf_session");
    if (!sesionActiva) {
        console.warn("NutriFit: Sesión no detectada. Redirigiendo a la página principal...");
        window.location.href = "../index.html?login=required";
        return;
    }

    let userSession = null;
    try {
        userSession = JSON.parse(sesionActiva);
    } catch (e) {
        console.error("Error al parsear sesión activa:", e);
        window.location.href = "../index.html";
        return;
    }

    // ----------------------------------------------------
    // 2. DECLARACIÓN DE VARIABLES Y ELEMENTOS
    // ----------------------------------------------------
    // Elementos de Hero
    const resumenNombre = document.getElementById("resumen-nombre");
    const resumenCorreo = document.getElementById("resumen-correo");
    const badgeObjetivo = document.getElementById("badge-objetivo");
    const badgeImc = document.getElementById("badge-imc");

    // Elementos de Pestañas
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    // Datos del Perfil
    let perfilDb = {};

    // Elementos GPS
    const inputDireccion = document.getElementById("input-direccion");
    const btnGps = document.getElementById("btn-gps");
    const valLatitud = document.getElementById("val-latitud");
    const valLongitud = document.getElementById("val-longitud");
    const btnGuardarDireccion = document.getElementById("btn-guardar-direccion");

    // Elementos Billetera
    const tarjetasGrid = document.getElementById("tarjetas-grid");
    const tarjetasVacio = document.getElementById("tarjetas-vacio");
    const btnAbrirTarjetaModal = document.getElementById("btn-abrir-tarjeta-modal");
    const btnCerrarTarjetaModal = document.getElementById("btn-cerrar-tarjeta-modal");
    const modalTarjeta = document.getElementById("modal-tarjeta");
    const formTarjeta = document.getElementById("form-tarjeta");
    const errorTarjeta = document.getElementById("error-tarjeta");

    // Elementos de Entrada Tarjeta (Autoresolución de Formato)
    const inputCardNumber = document.getElementById("card-number");
    const inputCardExpiry = document.getElementById("card-expiry");
    const inputCardCvv = document.getElementById("card-cvv");
    const inputCardHolder = document.getElementById("card-holder");

    // Elemento Toast
    const toast = document.getElementById("toast-notificacion");

    // ----------------------------------------------------
    // 3. INICIALIZACIÓN Y CARGA DE DATOS DESDE SUPABASE
    // ----------------------------------------------------
    async function cargarPerfil() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            mostrarToast("Error de conexión", "El servicio de base de datos no está disponible.", "error");
            fallbackRender();
            return;
        }

        try {
            // Intentar obtener el ID del usuario desde auth.uid() real de Supabase como prioridad
            let userId = userSession.id;
            try {
                const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
                if (!authError && user) {
                    userId = user.id;
                }
            } catch (authErr) {
                console.warn("No se pudo obtener el uid directo de Supabase Auth, se usará localStorage:", authErr);
            }

            // Consultar datos personales en Supabase
            const { data, error } = await supabaseClient
                .from("perfiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;
            perfilDb = data || {};

            // Renderizar la interfaz
            renderizarPerfil();
            cargarTarjetas();
            verificarPerfilIncompleto();
            renderizarEstadoDeudaCliente();

        } catch (err) {
            console.error("Error al cargar perfil de Supabase:", err);
            mostrarToast("Error al cargar datos", "No pudimos obtener la información de tu perfil de la base de datos.", "error");
            fallbackRender();
        }
    }

    // Renderizado seguro si falla la llamada remota
    function fallbackRender() {
        const nombre = userSession.nombre || "Usuario NutriFit";
        const correo = userSession.email || "";

        if (resumenNombre) resumenNombre.textContent = nombre;
        if (resumenCorreo) resumenCorreo.textContent = correo;

        const valNombre = document.getElementById("val-nombre");
        if (valNombre) valNombre.textContent = nombre;
        const inputNombre = document.getElementById("input-nombre");
        if (inputNombre) inputNombre.value = nombre;

        const valCorreo = document.getElementById("val-correo");
        if (valCorreo) valCorreo.textContent = correo;

        renderizarEstadoDeudaCliente();
    }

    // Renderizar estado de deuda y botón de pago simulado
    function renderizarEstadoDeudaCliente() {
        const contenedorDeuda = document.getElementById("contenedor-deuda-cliente");
        const elMontoDeuda = document.getElementById("deuda-monto-cliente");
        
        if (!contenedorDeuda) return;
        
        const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
        const estadoInfo = clientesEstado[userSession.id];
        
        if (estadoInfo && estadoInfo.estado === "Deudor" && estadoInfo.deuda > 0) {
            elMontoDeuda.textContent = `S/ ${parseFloat(estadoInfo.deuda).toFixed(2)}`;
            contenedorDeuda.style.display = "flex";
            
            // Adjuntar evento al botón de pagar
            const btnPagar = document.getElementById("btn-pagar-deuda-online");
            if (btnPagar) {
                // Clonar botón para eliminar listeners antiguos
                const nuevoBtn = btnPagar.cloneNode(true);
                btnPagar.parentNode.replaceChild(nuevoBtn, btnPagar);
                
                nuevoBtn.addEventListener("click", () => {
                    simularPagoDeudaCliente(estadoInfo.deuda);
                });
            }
        } else {
            contenedorDeuda.style.display = "none";
        }
    }

    // Simulación interactiva de regularización de saldo pendiente
    function simularPagoDeudaCliente(monto) {
        const confirmacion = confirm(`¿Deseas pagar tu saldo pendiente de S/ ${parseFloat(monto).toFixed(2)} online usando tu tarjeta NutriFit guardada?`);
        
        if (confirmacion) {
            // Actualizar en LocalStorage
            const clientesEstado = JSON.parse(localStorage.getItem("nf_clientes_estado") || "{}");
            clientesEstado[userSession.id] = { estado: "Al Día", deuda: 0.00 };
            localStorage.setItem("nf_clientes_estado", JSON.stringify(clientesEstado));
            
            // Disparar evento global para actualizar barras
            window.dispatchEvent(new Event("nf_clientes_estado_modificado"));
            
            mostrarToast("¡Pago procesado!", "Tu cuenta ha sido regularizada con éxito. Redirigiendo...", "success");
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    function renderizarPerfil() {
        // Mapeo seguro con validaciones para columnas nulas
        const nombre = perfilDb.nombre_completo || userSession.nombre || "Usuario NutriFit";
        const correo = perfilDb.correo_electronico || userSession.email || "";
        const telefono = perfilDb.telefono || "";
        const direccion = perfilDb.direccion || "";
        const latitud = perfilDb.latitud !== null && perfilDb.latitud !== undefined ? perfilDb.latitud : "--";
        const longitud = perfilDb.longitud !== null && perfilDb.longitud !== undefined ? perfilDb.longitud : "--";
        const peso = perfilDb.peso !== null && perfilDb.peso !== undefined ? perfilDb.peso : "";
        const talla = perfilDb.talla !== null && perfilDb.talla !== undefined ? perfilDb.talla : "";
        const objetivo = perfilDb.objetivo || "mantener";

        // Rellenar Hero
        if (resumenNombre) resumenNombre.textContent = nombre;
        if (resumenCorreo) resumenCorreo.textContent = correo;

        // Rellenar Pestaña de Datos
        const valNombre = document.getElementById("val-nombre");
        if (valNombre) valNombre.textContent = nombre;
        const inputNombre = document.getElementById("input-nombre");
        if (inputNombre) inputNombre.value = nombre;

        const valCorreo = document.getElementById("val-correo");
        if (valCorreo) valCorreo.textContent = correo;

        const valTelefono = document.getElementById("val-telefono");
        if (valTelefono) valTelefono.textContent = telefono || "No especificado";
        const inputTelefono = document.getElementById("input-telefono");
        if (inputTelefono) inputTelefono.value = telefono;

        const objLabel = obtenerEtiquetaObjetivo(objetivo);
        const valObjetivo = document.getElementById("val-objetivo");
        if (valObjetivo) valObjetivo.textContent = objLabel;
        const inputObjetivo = document.getElementById("input-objetivo");
        if (inputObjetivo) inputObjetivo.value = objetivo;
        
        if (badgeObjetivo) {
            badgeObjetivo.textContent = `Objetivo: ${objLabel}`;
            badgeObjetivo.className = "badge-profile-goal " + obtenerClaseObjetivo(objetivo);
        }

        const valPeso = document.getElementById("val-peso");
        if (valPeso) valPeso.textContent = peso ? `${peso} kg` : "-- kg";
        const inputPeso = document.getElementById("input-peso");
        if (inputPeso) inputPeso.value = peso;

        const valTalla = document.getElementById("val-talla");
        if (valTalla) valTalla.textContent = talla ? `${talla} cm` : "-- cm";
        const inputTalla = document.getElementById("input-talla");
        if (inputTalla) inputTalla.value = talla;

        // Calcular e inyectar IMC
        calcularImc();

        // Rellenar Pestaña de Dirección
        if (inputDireccion) {
            inputDireccion.value = direccion;
        }
        if (valLatitud) {
            valLatitud.textContent = latitud;
        }
        if (valLongitud) {
            valLongitud.textContent = longitud;
        }
    }

    function calcularImc() {
        if (!badgeImc) return;

        const peso = parseFloat(perfilDb.peso);
        const tallaCm = parseFloat(perfilDb.talla);
        const telefono = perfilDb.telefono;

        const esIncompleto = 
            isNaN(peso) || peso <= 0 ||
            isNaN(tallaCm) || tallaCm <= 0 ||
            !telefono || telefono.trim() === "" || telefono === "No especificado";

        if (esIncompleto) {
            badgeImc.textContent = "IMC: -- (Completa tu perfil)";
        } else {
            const tallaM = tallaCm / 100;
            const imc = peso / (tallaM * tallaM);
            const imcFormateado = imc.toFixed(1);
            let clasificacion = "";

            if (imc < 18.5) clasificacion = "Bajo peso ⚠️";
            else if (imc < 25.0) clasificacion = "Normal 🥦";
            else if (imc < 30.0) clasificacion = "Sobrepeso ⚖️";
            else clasificacion = "Obesidad ⚠️";

            badgeImc.textContent = `IMC: ${imcFormateado} (${clasificacion})`;
            badgeImc.style.display = "inline-block";
        }
    }

    function verificarPerfilIncompleto() {
        const peso = perfilDb.peso;
        const talla = perfilDb.talla;
        const telefono = perfilDb.telefono;

        const esIncompleto = 
            peso === null || peso === undefined || peso === "" || parseFloat(peso) <= 0 ||
            talla === null || talla === undefined || talla === "" || parseFloat(talla) <= 0 ||
            !telefono || telefono.trim() === "" || telefono === "No especificado";

        const modalPendiente = document.getElementById("modal-pendiente");
        if (esIncompleto) {
            if (modalPendiente) {
                // Rellenar campos del modal con lo que ya exista (si hay algo)
                const modalTelInput = document.getElementById("modal-telefono");
                const modalPesoInput = document.getElementById("modal-peso");
                const modalTallaInput = document.getElementById("modal-talla");

                if (modalTelInput) modalTelInput.value = (telefono && telefono !== "No especificado") ? telefono : "";
                if (modalPesoInput) modalPesoInput.value = (peso && parseFloat(peso) > 0) ? peso : "";
                if (modalTallaInput) modalTallaInput.value = (talla && parseFloat(talla) > 0) ? talla : "";

                modalPendiente.classList.add("show");
            }
            if (badgeImc) {
                badgeImc.textContent = "IMC: -- (Completa tu perfil)";
            }
        } else {
            if (modalPendiente) {
                modalPendiente.classList.remove("show");
            }
        }
    }

    // Manejador del Formulario del Modal de Completar Perfil
    const formCompletarModal = document.getElementById("form-completar-perfil-modal");
    const errorCompletarModal = document.getElementById("error-completar-modal");

    if (formCompletarModal) {
        formCompletarModal.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (errorCompletarModal) {
                errorCompletarModal.style.display = "none";
                errorCompletarModal.textContent = "";
            }

            const telVal = document.getElementById("modal-telefono").value.trim();
            const pesoVal = parseFloat(document.getElementById("modal-peso").value);
            const tallaVal = parseFloat(document.getElementById("modal-talla").value);

            // Validaciones cliente
            if (!telVal || !/^[0-9\s\+\-]+$/.test(telVal)) {
                mostrarErrorCompletarModal("Por favor, ingresa un número de teléfono válido (solo números, espacios, +, -).");
                return;
            }

            if (isNaN(pesoVal) || pesoVal <= 0) {
                mostrarErrorCompletarModal("Por favor, ingresa un peso válido positivo.");
                return;
            }

            if (isNaN(tallaVal) || tallaVal <= 0) {
                mostrarErrorCompletarModal("Por favor, ingresa una talla válida positiva.");
                return;
            }

            const btnSubmit = formCompletarModal.querySelector("button[type='submit']");
            btnSubmit.disabled = true;
            const originalText = btnSubmit.textContent;
            btnSubmit.textContent = "Guardando...";

            try {
                if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                    throw new Error("Conexión de base de datos no disponible.");
                }

                const { error } = await supabaseClient
                    .from("perfiles")
                    .update({
                        telefono: telVal,
                        peso: pesoVal,
                        talla: tallaVal
                    })
                    .eq("id", userSession.id);

                if (error) throw error;

                // Actualizar en memoria
                perfilDb.telefono = telVal;
                perfilDb.peso = pesoVal;
                perfilDb.talla = tallaVal;

                // Actualizar localStorage para que sea coherente (perfilCompleto = true)
                userSession.perfilCompleto = true;
                localStorage.setItem("nf_session", JSON.stringify(userSession));

                // Re-renderizar perfil
                renderizarPerfil();

                mostrarToast("Perfil completado", "Tus datos clave se han guardado con éxito.", "success");
                
                // Ocultar modal
                const modalPendiente = document.getElementById("modal-pendiente");
                if (modalPendiente) {
                    modalPendiente.classList.remove("show");
                }

            } catch (err) {
                console.error("Error al completar perfil desde modal:", err);
                mostrarErrorCompletarModal(err.message || "Ocurrió un error al guardar los datos.");
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        });
    }

    function mostrarErrorCompletarModal(msg) {
        if (errorCompletarModal) {
            errorCompletarModal.textContent = msg;
            errorCompletarModal.style.display = "block";
        }
    }

    cargarPerfil();

    // ----------------------------------------------------
    // 4. CONTROL DE PESTAÑAS (TAB SYSTEM)
    // ----------------------------------------------------
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");

            const tabName = btn.dataset.tab;
            const targetPanel = document.getElementById(`panel-${tabName}`);
            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });

    // ----------------------------------------------------
    // 5. EDICIÓN EN LÍNEA (INLINE EDITING)
    // ----------------------------------------------------
    const rowsEditables = document.querySelectorAll(".dato-row:not(.readonly)");

    rowsEditables.forEach(row => {
        const btnEdit = row.querySelector(".btn-edit-inline");
        if (!btnEdit) return;

        const fieldName = row.dataset.field;
        const valText = row.querySelector(".dato-value");
        const valInput = row.querySelector(".dato-input");
        const iconEdit = btnEdit.querySelector(".icon-edit");
        const iconSave = btnEdit.querySelector(".icon-save");

        btnEdit.addEventListener("click", async () => {
            const isEditing = btnEdit.classList.contains("editing");

            if (!isEditing) {
                valText.style.display = "none";
                valInput.style.display = "block";
                valInput.focus();

                btnEdit.classList.add("editing");
                if (iconEdit) iconEdit.style.display = "none";
                if (iconSave) iconSave.style.display = "inline-block";
            } else {
                const nuevoValor = valInput.value.trim();

                // Validaciones cliente
                if (fieldName === "nombre_completo" && nuevoValor.length < 3) {
                    mostrarToast("Nombre inválido", "El nombre debe tener al menos 3 caracteres.", "error");
                    valInput.focus();
                    return;
                }

                if (fieldName === "telefono" && nuevoValor && !/^[0-9\s\+\-]+$/.test(nuevoValor)) {
                    mostrarToast("Teléfono inválido", "Ingresa un número telefónico válido.", "error");
                    valInput.focus();
                    return;
                }

                if ((fieldName === "peso" || fieldName === "talla") && nuevoValor) {
                    const num = parseFloat(nuevoValor);
                    if (isNaN(num) || num <= 0) {
                        mostrarToast("Valor incorrecto", "Ingresa un número positivo válido.", "error");
                        valInput.focus();
                        return;
                    }
                }

                // Guardar en Supabase
                btnEdit.disabled = true;
                try {
                    let updateVal = nuevoValor === "" ? null : nuevoValor;
                    if (fieldName === "peso" || fieldName === "talla") {
                        updateVal = nuevoValor === "" ? null : parseFloat(nuevoValor);
                    }

                    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                        throw new Error("Conexión de base de datos no disponible.");
                    }

                    const { error } = await supabaseClient
                        .from("perfiles")
                        .update({ [fieldName]: updateVal })
                        .eq("id", userSession.id);

                    if (error) throw error;

                    perfilDb[fieldName] = updateVal;
                    
                    if (fieldName === "nombre_completo") {
                        userSession.nombre = nuevoValor;
                        localStorage.setItem("nf_session", JSON.stringify(userSession));
                    }
                    if (fieldName === "objetivo") {
                        userSession.objetivo = nuevoValor;
                        localStorage.setItem("nf_session", JSON.stringify(userSession));
                    }

                    renderizarPerfil();

                    mostrarToast("Cambio guardado", "Tus datos se han actualizado correctamente.", "success");

                    valText.style.display = "block";
                    valInput.style.display = "none";

                    btnEdit.classList.remove("editing");
                    if (iconEdit) iconEdit.style.display = "inline-block";
                    if (iconSave) iconSave.style.display = "none";

                } catch (err) {
                    console.error("Error al actualizar campo:", err);
                    mostrarToast("Error al actualizar", err.message || "No se pudo guardar el cambio.", "error");
                    valInput.focus();
                } finally {
                    btnEdit.disabled = false;
                }
            }
        });

        valInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                btnEdit.click();
            }
        });
    });

    // ----------------------------------------------------
    // 6. GEOLOCALIZACIÓN GPS NATIVA
    // ----------------------------------------------------
    if (btnGps) {
        btnGps.addEventListener("click", () => {
            if (!navigator.geolocation) {
                mostrarToast("GPS no disponible", "Tu navegador no soporta geolocalización.", "error");
                return;
            }

            btnGps.disabled = true;
            btnGps.classList.add("detecting");
            const btnSpan = btnGps.querySelector("span");
            if (btnSpan) btnSpan.textContent = "Detectando...";

            const gpsOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);

                    if (valLatitud) valLatitud.textContent = lat;
                    if (valLongitud) valLongitud.textContent = lng;

                    mostrarToast("GPS Listo", "Coordenadas capturadas con éxito.", "success");

                    if (inputDireccion && !inputDireccion.value.trim()) {
                        inputDireccion.value = "Ubicación GPS Detectada";
                    }

                    restablecerBotonGps();
                },
                (err) => {
                    console.warn("Error de Geolocalización:", err);
                    let errMsg = "No pudimos acceder a tu ubicación actual.";
                    if (err.code === 1) {
                        errMsg = "Permiso denegado. Habilita el acceso a la ubicación en tu navegador.";
                    } else if (err.code === 2) {
                        errMsg = "Ubicación no disponible. Verifica tu GPS.";
                    } else if (err.code === 3) {
                        errMsg = "Tiempo de espera agotado. Vuelve a intentarlo.";
                    }
                    mostrarToast("GPS Error", errMsg, "error");
                    restablecerBotonGps();
                },
                gpsOptions
            );
        });
    }

    function restablecerBotonGps() {
        if (!btnGps) return;
        btnGps.disabled = false;
        btnGps.classList.remove("detecting");
        const btnSpan = btnGps.querySelector("span");
        if (btnSpan) btnSpan.textContent = "Detectar";
    }

    if (btnGuardarDireccion) {
        btnGuardarDireccion.addEventListener("click", async () => {
            const direccion = inputDireccion.value.trim();
            const lat = valLatitud ? valLatitud.textContent : "--";
            const lng = valLongitud ? valLongitud.textContent : "--";

            if (!direccion) {
                mostrarToast("Campo requerido", "Por favor, ingresa una dirección física de despacho.", "error");
                inputDireccion.focus();
                return;
            }

            btnGuardarDireccion.disabled = true;

            try {
                let latVal = lat === "--" ? null : parseFloat(lat);
                let lngVal = lng === "--" ? null : parseFloat(lng);

                if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                    throw new Error("Conexión de base de datos no disponible.");
                }

                const { error } = await supabaseClient
                    .from("perfiles")
                    .update({
                        direccion: direccion,
                        latitud: latVal,
                        longitud: lngVal
                    })
                    .eq("id", userSession.id);

                if (error) throw error;

                perfilDb.direccion = direccion;
                perfilDb.latitud = latVal;
                perfilDb.longitud = lngVal;

                mostrarToast("Dirección guardada", "Tu dirección y geolocalización GPS han sido registradas.", "success");
            } catch (err) {
                console.error("Error al guardar ubicación:", err);
                mostrarToast("Error al guardar", err.message || "No se pudo guardar la dirección.", "error");
            } finally {
                btnGuardarDireccion.disabled = false;
            }
        });
    }

    // ----------------------------------------------------
    // 7. ADMINISTRACIÓN DE TARJETAS (BILLETERA)
    // ----------------------------------------------------
    async function cargarTarjetas() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            const { data, error } = await supabaseClient
                .from("tarjetas_usuario")
                .select("*")
                .eq("usuario_id", userSession.id)
                .order("fecha_creacion", { ascending: false });

            if (error) throw error;

            renderizarTarjetas(data || []);

        } catch (err) {
            console.error("Error al cargar tarjetas de Supabase:", err);
            mostrarToast("Error", "No pudimos obtener tus tarjetas guardadas.", "error");
        }
    }

    function renderizarTarjetas(tarjetas) {
        if (!tarjetasGrid || !tarjetasVacio) return;

        if (tarjetas.length === 0) {
            tarjetasGrid.style.display = "none";
            tarjetasVacio.style.display = "block";
            return;
        }

        tarjetasGrid.style.display = "grid";
        tarjetasVacio.style.display = "none";

        tarjetasGrid.innerHTML = tarjetas.map(card => {
            const last4 = card.numero_enmascarado.slice(-4);
            const numeroMostrado = `•••• •••• •••• ${last4}`;
            const holder = card.nombre_titular.toUpperCase();

            return `
                <div class="credit-card-ui" data-id="${card.id}">
                    <div class="card-top-row">
                        <div class="card-chip"></div>
                        <button class="btn-delete-card" data-id="${card.id}" title="Eliminar Tarjeta">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    <div class="card-middle-row">
                        <div class="card-number-ui">${numeroMostrado}</div>
                    </div>
                    <div class="card-bottom-row">
                        <div class="card-holder-ui">
                            <span>Titular</span>
                            <span>${holder}</span>
                        </div>
                        <div class="card-expiry-ui">
                            <span>Vence</span>
                            <span>${card.fecha_vencimiento}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Agregar listeners de eliminación
        tarjetasGrid.querySelectorAll(".btn-delete-card").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const cardId = btn.dataset.id;
                btn.disabled = true;
                
                try {
                    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                        throw new Error("Conexión no disponible.");
                    }

                    const { error } = await supabaseClient
                        .from("tarjetas_usuario")
                        .delete()
                        .eq("id", cardId);

                    if (error) throw error;

                    mostrarToast("Tarjeta eliminada", "El método de pago fue removido con éxito.", "success");
                    cargarTarjetas();
                } catch (err) {
                    console.error("Error al borrar tarjeta:", err);
                    mostrarToast("Error", "No pudimos eliminar esta tarjeta.", "error");
                    btn.disabled = false;
                }
            });
        });
    }

    // Modal Control
    if (btnAbrirTarjetaModal) {
        btnAbrirTarjetaModal.addEventListener("click", () => {
            if (errorTarjeta) {
                errorTarjeta.textContent = "";
                errorTarjeta.classList.remove("show");
            }
            formTarjeta.reset();
            modalTarjeta.classList.add("show");
        });
    }

    if (btnCerrarTarjetaModal) {
        btnCerrarTarjetaModal.addEventListener("click", () => {
            modalTarjeta.classList.remove("show");
        });
    }

    if (modalTarjeta) {
        modalTarjeta.addEventListener("click", (e) => {
            if (e.target === modalTarjeta) {
                modalTarjeta.classList.remove("show");
            }
        });
    }

    // Autoformateadores para Inputs de Tarjeta
    if (inputCardNumber) {
        inputCardNumber.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "");
            let valFormateado = "";
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    valFormateado += " ";
                }
                valFormateado += val[i];
            }
            e.target.value = valFormateado;
        });
    }

    if (inputCardExpiry) {
        inputCardExpiry.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "");
            if (val.length >= 2) {
                e.target.value = val.slice(0, 2) + "/" + val.slice(2, 4);
            } else {
                e.target.value = val;
            }
        });
    }

    if (inputCardCvv) {
        inputCardCvv.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
        });
    }

    // Submit guardar tarjeta
    if (formTarjeta) {
        formTarjeta.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (errorTarjeta) {
                errorTarjeta.textContent = "";
                errorTarjeta.classList.remove("show");
            }

            const rawCardNumber = inputCardNumber.value.replace(/\s/g, "");
            const expiry = inputCardExpiry.value.trim();
            const cvv = inputCardCvv.value.trim();
            const holder = inputCardHolder.value.trim();

            if (rawCardNumber.length < 15 || rawCardNumber.length > 16) {
                mostrarErrorTarjeta("El número de tarjeta debe tener 15 o 16 dígitos.");
                inputCardNumber.focus();
                return;
            }

            const parts = expiry.split("/");
            if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
                mostrarErrorTarjeta("El vencimiento debe tener el formato MM/AA.");
                inputCardExpiry.focus();
                return;
            }
            const month = parseInt(parts[0]);
            if (isNaN(month) || month < 1 || month > 12) {
                mostrarErrorTarjeta("Mes de vencimiento inválido (01-12).");
                inputCardExpiry.focus();
                return;
            }

            if (cvv.length < 3 || cvv.length > 4) {
                mostrarErrorTarjeta("El código CVV debe tener 3 o 4 dígitos.");
                inputCardCvv.focus();
                return;
            }

            if (holder.length < 3) {
                mostrarErrorTarjeta("El nombre del titular debe tener al menos 3 caracteres.");
                inputCardHolder.focus();
                return;
            }

            const last4 = rawCardNumber.slice(-4);
            const numeroEnmascarado = `XXXX-XXXX-XXXX-${last4}`;

            const btnSubmit = formTarjeta.querySelector("button[type='submit']");
            btnSubmit.disabled = true;

            try {
                if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                    throw new Error("Conexión de base de datos no disponible.");
                }

                const { error } = await supabaseClient
                    .from("tarjetas_usuario")
                    .insert([{
                        usuario_id: userSession.id,
                        numero_enmascarado: numeroEnmascarado,
                        nombre_titular: holder,
                        fecha_vencimiento: expiry
                    }]);

                if (error) throw error;

                mostrarToast("Tarjeta agregada", "Tu tarjeta fue guardada de forma enmascarada y segura.", "success");
                modalTarjeta.classList.remove("show");
                formTarjeta.reset();
                cargarTarjetas();

            } catch (err) {
                console.error("Error al guardar tarjeta en Supabase:", err);
                mostrarErrorTarjeta(err.message || "No se pudo registrar la tarjeta.");
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }

    function mostrarErrorTarjeta(msg) {
        if (errorTarjeta) {
            errorTarjeta.textContent = msg;
            errorTarjeta.classList.add("show");
        }
    }

    // ----------------------------------------------------
    // 8. INTERCEPTAR BOTÓN DE CERRAR SESIÓN (RUTAS RELATIVAS)
    // ----------------------------------------------------
    document.addEventListener("click", async (e) => {
        const btnCerrarSesion = e.target.closest("#btn-cerrar-sesion");
        if (btnCerrarSesion) {
            e.preventDefault();
            e.stopPropagation();

            console.log("NutriFit Perfil: Interceptando botón de Cerrar Sesión...");

            // Limpiar datos locales
            localStorage.removeItem("nf_session");

            // Cerrar sesión en el cliente Supabase
            try {
                if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                    await supabaseClient.auth.signOut();
                    console.log("NutriFit Perfil: Supabase signOut exitoso.");
                }
            } catch (err) {
                console.warn("NutriFit Perfil: Error al desautenticar de Supabase:", err);
            }

            // Redirección limpia a la raíz del proyecto usando ruta relativa
            window.location.href = "../index.html";
        }
    });

    // ----------------------------------------------------
    // 9. FUNCIONES AUXILIARES
    // ----------------------------------------------------
    function obtenerEtiquetaObjetivo(obj) {
        if (obj === "bajar") return "Bajar de Peso 📉";
        if (obj === "mantener") return "Mantenerse en Forma ⚖️";
        if (obj === "ganar") return "Ganar Masa Muscular 💪";
        return "No especificado";
    }

    function obtenerClaseObjetivo(obj) {
        if (obj === "bajar") return "goal-bajar";
        if (obj === "mantener") return "goal-mantener";
        return "goal-ganar";
    }

    function mostrarToast(titulo, mensaje, tipo = "success") {
        if (!toast) return;

        const titleEl = document.getElementById("toast-titulo");
        const msgEl = document.getElementById("toast-mensaje");
        const iconEl = document.getElementById("toast-icon-element");

        if (titleEl) titleEl.textContent = titulo;
        if (msgEl) msgEl.textContent = mensaje;
        
        if (iconEl) {
            if (tipo === "success") {
                iconEl.className = "fa-solid fa-circle-check";
                toast.querySelector(".toast-card").style.borderLeftColor = "var(--color-primary)";
            } else {
                iconEl.className = "fa-solid fa-triangle-exclamation";
                toast.querySelector(".toast-card").style.borderLeftColor = "var(--color-accent-red)";
            }
        }

        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);
    }
});
