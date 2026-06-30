// Lógica del Carrito Detallado de NutriFit con Stepper de 3 Pasos
document.addEventListener("DOMContentLoaded", async () => {
    const listaProductos = document.getElementById("carrito-productos-lista");
    const gridCarritoLleno = document.getElementById("carrito-lleno-grid");
    const panelCarritoVacio = document.getElementById("carrito-vacio");
    
    // Resumen Paso 1
    const elSubtotal = document.getElementById("resumen-subtotal");
    const elEnvio = document.getElementById("resumen-envio");
    const elDescuentoFila = document.getElementById("resumen-descuento-fila");
    const elDescuentoVal = document.getElementById("resumen-descuento");
    const elTotal = document.getElementById("resumen-total");
    
    // Cupones
    const inputCupon = document.getElementById("cupon-input");
    const btnCupon = document.getElementById("btn-aplicar-cupon");
    const msgCupon = document.getElementById("cupon-mensaje");
    
    // Botones de Navegación del Stepper
    const btnProcesarPago = document.getElementById("btn-procesar-pago"); // De Paso 1 a Paso 2
    const btnRegresarPaso1 = document.getElementById("btn-regresar-paso-1"); // De Paso 2 a Paso 1
    const btnConfirmarPago = document.getElementById("btn-confirmar-pago"); // Confirmar compra en Paso 2
    
    // Indicadores visuales del Stepper
    const step1Indicator = document.getElementById("step-1-indicator");
    const step2Indicator = document.getElementById("step-2-indicator");
    const step3Indicator = document.getElementById("step-3-indicator");
    const line1 = document.getElementById("line-1");
    const line2 = document.getElementById("line-2");
    
    let pasoActual = 1;
    let perfilDireccionPrincipal = ""; // Guardar la dirección del perfil para alternar
    let descuentoPorcentaje = 0; // Descuento en porcentaje (0.1 = 10%)
    const COSTO_ENVIO = 5.00;
    
    // Cupones válidos
    const cuponesValidos = {
        "NUTRI10": 0.10,
        "FIT20": 0.20,
        "BIENVENIDOFIT": 0.15,
        "LOYALFIT25": 0.25
    };

    /* =========================================================================
       1. SISTEMA DE PASOS (STEPPER)
       ========================================================================= */

    function irAlPaso(numPaso) {
        // Validación de Cesta Vacía para avanzar
        if (numPaso === 2) {
            const carrito = window.obtenerCarrito();
            if (carrito.length === 0) {
                alert("Tu cesta está vacía. Agrega platos antes de procesar el pago.");
                return;
            }
            
            // VALIDACIÓN: No avanzar si hay items sin stock
            const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
            const tieneAgotados = carrito.some(item => {
                const infoStock = inventario[item.id] || { stock: 10, estado: "Disponible" };
                return infoStock.estado === "Agotado" || infoStock.stock <= 0;
            });
            if (tieneAgotados) {
                alert("Tienes platos agotados en tu cesta. Por favor, elimínalos para continuar.");
                return;
            }
            
            // Validación de Sesión antes de ir a Pasarela
            const sesion = localStorage.getItem("nf_session");
            if (!sesion) {
                const modalLogin = document.getElementById("modal-login");
                if (modalLogin) {
                    modalLogin.classList.add("show");
                }
                return;
            }
        }

        pasoActual = numPaso;

        // Ocultar todos los contenedores de pasos
        document.getElementById("step-1-container").style.display = "none";
        document.getElementById("step-2-container").style.display = "none";
        document.getElementById("step-3-container").style.display = "none";
        
        // Mostrar contenedor del paso actual
        document.getElementById(`step-${numPaso}-container`).style.display = "block";

        // Resetear clases de los indicadores
        step1Indicator.classList.remove("active", "completed");
        step2Indicator.classList.remove("active", "completed");
        step3Indicator.classList.remove("active", "completed");
        line1.classList.remove("filled");
        line2.classList.remove("filled");

        const circle1 = step1Indicator.querySelector(".step-circle");
        const circle2 = step2Indicator.querySelector(".step-circle");
        const circle3 = step3Indicator.querySelector(".step-circle");

        if (numPaso === 1) {
            step1Indicator.classList.add("active");
            circle1.innerHTML = '<i class="fa-solid fa-circle"></i>';
            circle2.textContent = "2";
            circle3.textContent = "3";
        } else if (numPaso === 2) {
            step1Indicator.classList.add("completed");
            step2Indicator.classList.add("active");
            circle1.innerHTML = '<i class="fa-solid fa-check"></i>';
            circle2.textContent = "2";
            circle3.textContent = "3";
            line1.classList.add("filled");

            // Rellenar datos de la tarjeta y dirección del usuario
            autocompletarTarjetaYDireccion();
            
            // Sincronizar importes en Paso 2
            actualizarResumen();
        } else if (numPaso === 3) {
            step1Indicator.classList.add("completed");
            step2Indicator.classList.add("completed");
            step3Indicator.classList.add("completed");
            circle1.innerHTML = '<i class="fa-solid fa-check"></i>';
            circle2.innerHTML = '<i class="fa-solid fa-check"></i>';
            circle3.innerHTML = '<i class="fa-solid fa-check"></i>';
            line1.classList.add("filled");
            line2.classList.add("filled");
        }
    }

    // Navegación mediante los círculos (sólo interactiva entre Paso 1 y Paso 2)
    step1Indicator.addEventListener("click", () => {
        if (pasoActual !== 3) {
            irAlPaso(1);
        }
    });

    step2Indicator.addEventListener("click", () => {
        if (pasoActual !== 3) {
            irAlPaso(2);
        }
    });

    // Botones de secuencia
    if (btnProcesarPago) {
        btnProcesarPago.addEventListener("click", () => irAlPaso(2));
    }
    if (btnRegresarPaso1) {
        btnRegresarPaso1.addEventListener("click", () => irAlPaso(1));
    }

    /* =========================================================================
       2. CARGA Y DETALLES DEL CARRITO
       ========================================================================= */

    function renderizarCarrito() {
        const carrito = window.obtenerCarrito();
        
        if (carrito.length === 0) {
            gridCarritoLleno.style.display = "none";
            panelCarritoVacio.style.display = "block";
            // Si el carrito queda vacío y estábamos en paso 2, regresar a paso 1
            if (pasoActual === 2) {
                irAlPaso(1);
            }
            return;
        }
        
        gridCarritoLleno.style.display = "grid";
        panelCarritoVacio.style.display = "none";
        
        const inventario = JSON.parse(localStorage.getItem("nf_inventario") || "{}");
        let tieneAgotados = false;

        listaProductos.innerHTML = carrito.map(item => {
            const infoStock = inventario[item.id] || { stock: 10, estado: "Disponible" };
            const isAgotado = infoStock.estado === "Agotado" || infoStock.stock <= 0;
            const itemTotal = item.precio * item.cantidad;
            
            let claseAgotado = "";
            let deshabilitarBtns = "";
            let leyendaAgotado = "";
            
            if (isAgotado) {
                tieneAgotados = true;
                claseAgotado = "agotado";
                deshabilitarBtns = 'disabled style="pointer-events: none; opacity: 0.5;"';
                leyendaAgotado = '<span class="sin-stock-leyenda" style="color: #e53935; font-size: 11px; font-weight: 700; display: block; margin-top: 4px; text-transform: uppercase;">Sin Stock disponible</span>';
            }

            return `
                <article class="cart-item ${claseAgotado}" data-id="${item.id}">
                    <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='../assets/img/presentacion.jpg'">
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${item.nombre}</h3>
                        <span class="cart-item-price">S/ ${item.precio.toFixed(2)}</span>
                        ${leyendaAgotado}
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-selector">
                            <button class="btn-qty btn-restar" data-id="${item.id}" ${deshabilitarBtns}>-</button>
                            <span class="qty-val">${item.cantidad}</span>
                            <button class="btn-qty btn-sumar" data-id="${item.id}" ${deshabilitarBtns}>+</button>
                        </div>
                        <span class="cart-item-total">S/ ${itemTotal.toFixed(2)}</span>
                        <button class="btn-remove-item" data-id="${item.id}" aria-label="Eliminar plato">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </article>
            `;
        }).join("");

        // Controlar el estado del botón Procesar Pago
        if (btnProcesarPago) {
            if (tieneAgotados) {
                btnProcesarPago.disabled = true;
                btnProcesarPago.classList.add("disabled");
                btnProcesarPago.style.opacity = "0.5";
                btnProcesarPago.style.cursor = "not-allowed";
                btnProcesarPago.title = "Por favor, elimina los platos agotados para proceder al pago.";
            } else {
                btnProcesarPago.disabled = false;
                btnProcesarPago.classList.remove("disabled");
                btnProcesarPago.style.opacity = "1";
                btnProcesarPago.style.cursor = "pointer";
                btnProcesarPago.title = "";
            }
        }
        
        actualizarResumen();
        adjuntarEventosItems();
    }
    
    function actualizarResumen() {
        const carrito = window.obtenerCarrito();
        let subtotal = 0;
        let totalItems = 0;
        carrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
            totalItems += item.cantidad;
        });
        
        const descuento = subtotal * descuentoPorcentaje;
        const total = subtotal + COSTO_ENVIO - descuento;
        
        // Actualizar UI del Paso 1
        if (elSubtotal) elSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
        if (elEnvio) elEnvio.textContent = `S/ ${COSTO_ENVIO.toFixed(2)}`;
        
        if (descuento > 0) {
            if (elDescuentoFila) elDescuentoFila.style.display = "flex";
            if (elDescuentoVal) elDescuentoVal.textContent = `-S/ ${descuento.toFixed(2)}`;
        } else {
            if (elDescuentoFila) elDescuentoFila.style.display = "none";
        }
        if (elTotal) elTotal.textContent = `S/ ${Math.max(0, total).toFixed(2)}`;

        // Actualizar UI del Paso 2 (Resumen en Pasarela de Pago)
        const elPagoSubtotal = document.getElementById("pago-subtotal");
        const elPagoEnvio = document.getElementById("pago-envio");
        const elPagoDescuentoFila = document.getElementById("pago-descuento-fila");
        const elPagoDescuentoVal = document.getElementById("pago-descuento");
        const elPagoTotal = document.getElementById("pago-total");
        const elPagoSubtotalLabel = document.getElementById("pago-subtotal-label");

        if (elPagoSubtotalLabel) {
            elPagoSubtotalLabel.textContent = `Subtotal (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`;
        }
        if (elPagoSubtotal) elPagoSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
        if (elPagoEnvio) elPagoEnvio.textContent = `S/ ${COSTO_ENVIO.toFixed(2)}`;

        if (descuento > 0) {
            if (elPagoDescuentoFila) elPagoDescuentoFila.style.display = "flex";
            if (elPagoDescuentoVal) elPagoDescuentoVal.textContent = `-S/ ${descuento.toFixed(2)}`;
        } else {
            if (elPagoDescuentoFila) elPagoDescuentoFila.style.display = "none";
        }
        if (elPagoTotal) elPagoTotal.textContent = `S/ ${Math.max(0, total).toFixed(2)}`;
    }
    
    function adjuntarEventosItems() {
        listaProductos.querySelectorAll(".btn-sumar").forEach(btn => {
            btn.addEventListener("click", () => {
                modificarCantidad(btn.dataset.id, 1);
            });
        });
        
        listaProductos.querySelectorAll(".btn-restar").forEach(btn => {
            btn.addEventListener("click", () => {
                modificarCantidad(btn.dataset.id, -1);
            });
        });
        
        listaProductos.querySelectorAll(".btn-remove-item").forEach(btn => {
            btn.addEventListener("click", () => {
                eliminarItem(btn.dataset.id);
            });
        });
    }
    
    function modificarCantidad(id, cambio) {
        let carrito = window.obtenerCarrito();
        const index = carrito.findIndex(item => item.id === id);
        
        if (index > -1) {
            carrito[index].cantidad += cambio;
            if (carrito[index].cantidad < 1) {
                carrito[index].cantidad = 1;
            }
            window.guardarCarrito(carrito);
            renderizarCarrito();
        }
    }
    
    function eliminarItem(id) {
        let carrito = window.obtenerCarrito();
        carrito = carrito.filter(item => item.id !== id);
        window.guardarCarrito(carrito);
        renderizarCarrito();
    }
    
    /* =========================================================================
       3. SISTEMA DE CUPONES E INTELIGENCIA
       ========================================================================= */

    // Aplicar Cupones
    if (btnCupon) {
        btnCupon.addEventListener("click", () => {
            const codigo = inputCupon.value.trim().toUpperCase();
            if (codigo === "") {
                msgCupon.className = "cupon-msg error";
                msgCupon.textContent = "Por favor ingresa un código de cupón.";
                return;
            }
            
            if (cuponesValidos.hasOwnProperty(codigo)) {
                descuentoPorcentaje = cuponesValidos[codigo];
                msgCupon.className = "cupon-msg exito";
                msgCupon.textContent = `¡Cupón ${codigo} aplicado! Descuento del ${(descuentoPorcentaje * 100)}% obtenido.`;
                actualizarResumen();
            } else {
                msgCupon.className = "cupon-msg error";
                msgCupon.textContent = "Código de cupón inválido o expirado.";
            }
        });
    }

    // Motor de recomendaciones de cupones inteligente basado en pedidos
    async function verificarCuponRecomendado() {
        const sesion = localStorage.getItem("nf_session");
        if (!sesion) {
            msgCupon.className = "cupon-msg info";
            msgCupon.innerHTML = `👋 ¡Bienvenido! Inicia sesión para verificar tus cupones de fidelidad.`;
            return;
        }

        const usuario = JSON.parse(sesion);
        
        try {
            if (window.supabaseClient) {
                // Consultar los pedidos históricos del usuario
                const { data: pedidos, error } = await window.supabaseClient
                    .from("pedidos")
                    .select("id, fecha_pedido")
                    .eq("usuario_id", usuario.id);
                    
                if (error) throw error;
                
                const totalPedidos = pedidos ? pedidos.length : 0;
                
                if (totalPedidos === 0) {
                    // Cuenta nueva sin compras
                    msgCupon.className = "cupon-msg info";
                    msgCupon.innerHTML = `🎁 ¡Tu cuenta es nueva! Obtén 10% de descuento registrando tu primer pedido con el código <strong>NUTRI10</strong>.`;
                } else {
                    // Cuenta antigua. Verificar si registra múltiples pedidos en la semana (últimos 7 días)
                    const haceUnaSemana = new Date();
                    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
                    
                    const pedidosSemana = pedidos.filter(p => new Date(p.fecha_pedido) >= haceUnaSemana);
                    
                    if (pedidosSemana.length >= 2) {
                        msgCupon.className = "cupon-msg info";
                        msgCupon.innerHTML = `⭐ ¡Fidelidad Premium! Premiamos tus compras semanales con el cupón del 25% OFF especial: <strong>LOYALFIT25</strong>.`;
                    } else {
                        msgCupon.className = "cupon-msg info";
                        msgCupon.innerHTML = `Tienes cupones activos. Prueba usando <strong>FIT20</strong> para 20% de descuento.`;
                    }
                }
            }
        } catch (err) {
            console.warn("NutriFit Coupon Engine: No se pudo conectar a Supabase para analizar perfil, cargando cupón por defecto.", err.message);
            // Simular recomendación de bienvenida si falla
            msgCupon.className = "cupon-msg info";
            msgCupon.innerHTML = `🎁 ¡Obtén 10% de descuento en tu primer pedido ingresando el cupón <strong>NUTRI10</strong>!`;
        }
    }

    /* =========================================================================
       4. AUTOCOMPLETADO Y DATOS DE PAGO (PASO 2)
       ========================================================================= */

    async function autocompletarTarjetaYDireccion() {
        const sesion = localStorage.getItem("nf_session");
        if (!sesion) return;
        const usuario = JSON.parse(sesion);
        
        // 1. Tarjeta pre-registrada
        let cardData = localStorage.getItem(`nf_card_${usuario.id}`);
        if (!cardData) {
            const mockCard = {
                number: "4557812034895678",
                holder: usuario.nombre || "Yhomar Cruz Vasquez",
                expiryMonth: "10",
                expiryYear: "2028",
                cvc: "419",
                saved: true
            };
            localStorage.setItem(`nf_card_${usuario.id}`, JSON.stringify(mockCard));
            cardData = JSON.stringify(mockCard);
        }
        
        const card = JSON.parse(cardData);
        
        const elCardNum = document.getElementById("card-number");
        const elCardHolder = document.getElementById("card-holder");
        const elExpiryMonth = document.getElementById("card-expiry-month");
        const elExpiryYear = document.getElementById("card-expiry-year");
        const elCardCvc = document.getElementById("card-cvc");
        const elSaveDetails = document.getElementById("save-card-details");
        
        if (elCardNum) {
            const rawNumber = card.number;
            elCardNum.value = `**** **** **** ${rawNumber.slice(-4)}`;
            elCardNum.dataset.realNumber = rawNumber;
        }
        if (elCardHolder) elCardHolder.value = card.holder || "";
        if (elExpiryMonth) elExpiryMonth.value = card.expiryMonth || "";
        if (elExpiryYear) elExpiryYear.value = card.expiryYear || "";
        if (elCardCvc) elCardCvc.value = card.cvc || "";
        if (elSaveDetails) elSaveDetails.checked = card.saved;

        // 2. Dirección de envío (Cargar del perfil de Supabase)
        const elAddress = document.getElementById("delivery-address");
        const elPhone = document.getElementById("delivery-phone");
        const btnChangeAddress = document.getElementById("btn-change-address");
        const saveProfileAddressRow = document.getElementById("save-profile-address-row");
        const checkboxSaveAddress = document.getElementById("save-address-to-profile");
        
        if (window.supabaseClient) {
            try {
                const { data: perfil, error: perfilErr } = await window.supabaseClient
                    .from("perfiles")
                    .select("direccion, telefono")
                    .eq("id", usuario.id)
                    .single();
                    
                if (!perfilErr && perfil) {
                    perfilDireccionPrincipal = perfil.direccion || "";
                    if (elPhone && perfil.telefono) {
                        elPhone.value = perfil.telefono;
                    }
                }
            } catch (err) {
                console.warn("No se pudo cargar la dirección del perfil de Supabase:", err);
            }
        }
        
        // Respaldo en localStorage
        if (!perfilDireccionPrincipal) {
            const deliveryData = localStorage.getItem(`nf_delivery_${usuario.id}`);
            if (deliveryData) {
                const delivery = JSON.parse(deliveryData);
                perfilDireccionPrincipal = delivery.address || "";
                if (elPhone && !elPhone.value) {
                    elPhone.value = delivery.phone || "";
                }
            }
        }
        
        if (elAddress) {
            if (perfilDireccionPrincipal) {
                elAddress.value = perfilDireccionPrincipal;
                elAddress.readOnly = true;
                elAddress.classList.add("readonly-input");
                
                if (btnChangeAddress) {
                    btnChangeAddress.style.display = "inline-flex";
                    btnChangeAddress.textContent = "+ Usar otra dirección";
                }
                if (saveProfileAddressRow) {
                    saveProfileAddressRow.style.display = "none";
                }
            } else {
                elAddress.value = "";
                elAddress.readOnly = false;
                elAddress.classList.remove("readonly-input");
                
                if (btnChangeAddress) {
                    btnChangeAddress.style.display = "none";
                }
                if (saveProfileAddressRow) {
                    saveProfileAddressRow.style.display = "flex";
                }
                if (checkboxSaveAddress) {
                    checkboxSaveAddress.checked = true;
                }
            }
        }
        
        if (elPhone && !elPhone.value) {
            elPhone.value = "987654321";
        }
    }

    // Ocultar/Mostrar campos de tarjeta según método seleccionado
    const radiosPayment = document.querySelectorAll('input[name="payment-method"]');
    const cardFieldsContainer = document.getElementById("card-fields-container");

    radiosPayment.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "efectivo") {
                cardFieldsContainer.style.display = "none";
                document.getElementById("card-number").required = false;
                document.getElementById("card-holder").required = false;
                document.getElementById("card-expiry-month").required = false;
                document.getElementById("card-expiry-year").required = false;
                document.getElementById("card-cvc").required = false;
            } else {
                cardFieldsContainer.style.display = "block";
                document.getElementById("card-number").required = true;
                document.getElementById("card-holder").required = true;
                document.getElementById("card-expiry-month").required = true;
                document.getElementById("card-expiry-year").required = true;
                document.getElementById("card-cvc").required = true;
            }
        });
    });

    // Alternador de dirección manual/perfil (Estilo PedidosYa)
    const btnChangeAddress = document.getElementById("btn-change-address");
    const saveProfileAddressRow = document.getElementById("save-profile-address-row");
    const checkboxSaveAddress = document.getElementById("save-address-to-profile");
    const elAddressInput = document.getElementById("delivery-address");

    if (btnChangeAddress) {
        btnChangeAddress.addEventListener("click", () => {
            if (elAddressInput.readOnly) {
                elAddressInput.readOnly = false;
                elAddressInput.classList.remove("readonly-input");
                elAddressInput.value = "";
                elAddressInput.focus();
                
                btnChangeAddress.textContent = "Usar dirección del perfil";
                if (saveProfileAddressRow) {
                    saveProfileAddressRow.style.display = "flex";
                }
                if (checkboxSaveAddress) {
                    checkboxSaveAddress.checked = false;
                }
            } else {
                elAddressInput.readOnly = true;
                elAddressInput.classList.add("readonly-input");
                elAddressInput.value = perfilDireccionPrincipal;
                
                btnChangeAddress.textContent = "+ Usar otra dirección";
                if (saveProfileAddressRow) {
                    saveProfileAddressRow.style.display = "none";
                }
            }
        });
    }

    // Formateador dinámico de número de tarjeta
    const elCardNum = document.getElementById("card-number");
    if (elCardNum) {
        elCardNum.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // sólo dígitos
            
            // Si el usuario modifica el número enmascarado, borramos el dataset real
            if (!e.target.value.startsWith("****")) {
                delete elCardNum.dataset.realNumber;
            }
            
            let formatted = "";
            for (let i = 0; i < value.length && i < 16; i++) {
                if (i > 0 && i % 4 === 0) formatted += " ";
                formatted += value[i];
            }
            e.target.value = formatted;
        });
    }

    /* =========================================================================
       5. CONFIRMACIÓN Y PERSISTENCIA (SUPABASE E INSERT DE PEDIDO)
       ========================================================================= */

    if (btnConfirmarPago) {
        btnConfirmarPago.addEventListener("click", async () => {
            const sesion = localStorage.getItem("nf_session");
            if (!sesion) {
                alert("Debes iniciar sesión para confirmar tu compra.");
                location.reload();
                return;
            }
            
            const usuario = JSON.parse(sesion);
            const carrito = window.obtenerCarrito();
            if (carrito.length === 0) {
                alert("Tu cesta está vacía.");
                irAlPaso(1);
                return;
            }

            // 1. Obtener valores y validar dirección/teléfono
            const elAddress = document.getElementById("delivery-address");
            const elPhone = document.getElementById("delivery-phone");
            const addressVal = elAddress ? elAddress.value.trim() : "";
            const phoneVal = elPhone ? elPhone.value.trim() : "";

            if (addressVal === "" || phoneVal === "") {
                alert("Por favor ingresa tu dirección completa y teléfono de contacto para el envío.");
                return;
            }

            // 2. Validar tarjeta si no es pago contra entrega
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
            let nroTarjetaFinal = "-";
            
            if (selectedMethod !== "efectivo") {
                const cardNumInput = document.getElementById("card-number").value.trim();
                const cardHolder = document.getElementById("card-holder").value.trim();
                const expMonth = document.getElementById("card-expiry-month").value;
                const expYear = document.getElementById("card-expiry-year").value;
                const cvc = document.getElementById("card-cvc").value.trim();

                if (cardNumInput === "" || cardHolder === "" || !expMonth || !expYear || cvc === "") {
                    alert("Por favor completa todos los campos requeridos de tu tarjeta.");
                    return;
                }

                // Obtener número final a mostrar
                nroTarjetaFinal = cardNumInput;

                // 3. Guardar detalles de tarjeta si selecciona el checkbox
                const saveCheckbox = document.getElementById("save-card-details");
                if (saveCheckbox && saveCheckbox.checked) {
                    const realNum = elCardNum.dataset.realNumber || cardNumInput.replace(/\s+/g, "");
                    const cardToSave = {
                        number: realNum,
                        holder: cardHolder,
                        expiryMonth: expMonth,
                        expiryYear: expYear,
                        cvc: cvc,
                        saved: true
                    };
                    localStorage.setItem(`nf_card_${usuario.id}`, JSON.stringify(cardToSave));
                }
            }

            // Guardar dirección en local para futuros autocompletados
            const deliveryToSave = { address: addressVal, phone: phoneVal };
            localStorage.setItem(`nf_delivery_${usuario.id}`, JSON.stringify(deliveryToSave));

            // Si el checkbox está marcado, actualizar la dirección principal en el perfil de Supabase
            const checkboxSaveAddress = document.getElementById("save-address-to-profile");
            if (checkboxSaveAddress && checkboxSaveAddress.checked && window.supabaseClient) {
                try {
                    await window.supabaseClient
                        .from("perfiles")
                        .update({ direccion: addressVal, telefono: phoneVal })
                        .eq("id", usuario.id);
                    perfilDireccionPrincipal = addressVal;
                    console.log("NutriFit Profile: Dirección principal actualizada en base de datos.");
                } catch (updateErr) {
                    console.error("Error al actualizar la dirección en el perfil:", updateErr);
                }
            }

            // Deshabilitar botón para evitar multi-clicks
            btnConfirmarPago.disabled = true;
            btnConfirmarPago.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

            // 4. Calcular importes finales
            let subtotal = 0;
            carrito.forEach(item => {
                subtotal += item.precio * item.cantidad;
            });
            const descuento = subtotal * descuentoPorcentaje;
            const total = subtotal + COSTO_ENVIO - descuento;

            // 5. Intentar insertar en base de datos Supabase
            let pedidoId = `NF-${Date.now().toString().slice(-6)}`; // Fallback ID local
            let compraExitosa = false;

            if (window.supabaseClient) {
                try {
                    // Insertar en tabla: pedidos
                    const { data: pedidoData, error: pedidoError } = await window.supabaseClient
                        .from("pedidos")
                        .insert([{
                            usuario_id: usuario.id,
                            total: parseFloat(total.toFixed(2)),
                            direccion_entrega: addressVal,
                            telefono: phoneVal,
                            metodo_pago: selectedMethod,
                            estado: 'En Preparación'
                        }])
                        .select("id")
                        .single();

                    if (pedidoError) throw pedidoError;

                    if (pedidoData) {
                        pedidoId = pedidoData.id;
                        
                        // Insertar en tabla: detalle_pedidos
                        const detalles = carrito.map(item => ({
                            pedido_id: pedidoId,
                            plato_id: item.id,
                            cantidad: item.cantidad,
                            precio_unitario: parseFloat(item.precio.toFixed(2))
                        }));

                        const { error: detalleError } = await window.supabaseClient
                            .from("detalle_pedidos")
                            .insert(detalles);

                        if (detalleError) throw detalleError;
                        
                        compraExitosa = true;
                    }
                } catch (dbErr) {
                    console.error("NutriFit Database Error: No se pudo guardar el pedido en base de datos, procediendo en local.", dbErr);
                    compraExitosa = true; // Continuamos en local
                }
            } else {
                compraExitosa = true; // Fallback modo local
            }

            if (compraExitosa) {
                // 6. Mostrar toast de éxito por 2 segundos y redirigir
                const toast = document.getElementById("toast-pago-exito");
                if (toast) {
                    toast.style.display = "block";
                }
                
                setTimeout(() => {
                    if (toast) {
                        toast.style.display = "none";
                    }
                    
                    // Renderizar Paso 3
                    renderizarPaso3(pedidoId, total, addressVal, selectedMethod, nroTarjetaFinal, carrito);
                    
                    // Limpiar carrito en localStorage
                    window.guardarCarrito([]);
                    
                    // Avanzar al Paso 3
                    irAlPaso(3);
                }, 2000);
            } else {
                alert("Ocurrió un error al procesar tu pedido. Por favor inténtalo de nuevo.");
                btnConfirmarPago.disabled = false;
                btnConfirmarPago.textContent = "CONFIRMAR PEDIDO";
            }
        });
    }

    function renderizarPaso3(pedidoId, total, direccion, metodo, tarjetaDisplay, itemsComprados) {
        const orderIdDisp = document.getElementById("order-id-display");
        const orderPaymentDisp = document.getElementById("order-payment-display");
        const orderAddressDisp = document.getElementById("order-address-display");
        const orderItemsDisp = document.getElementById("order-items-display");

        // Cortar ID si es UUID largo para que sea legible en la confirmación
        if (orderIdDisp) {
            orderIdDisp.textContent = pedidoId.length > 12 ? pedidoId.slice(0, 8).toUpperCase() : pedidoId;
        }

        if (orderAddressDisp) {
            orderAddressDisp.textContent = direccion;
        }

        if (orderPaymentDisp) {
            let labelPago = "";
            if (metodo === "efectivo") {
                labelPago = "Efectivo (Pago Contra Entrega)";
            } else {
                const metodoCapitalizado = metodo.charAt(0).toUpperCase() + metodo.slice(1);
                const mask = tarjetaDisplay.startsWith("****") ? tarjetaDisplay : `**** **** **** ${tarjetaDisplay.slice(-4)}`;
                labelPago = `${metodoCapitalizado} (${mask})`;
            }
            orderPaymentDisp.textContent = labelPago;
        }

        if (orderItemsDisp) {
            orderItemsDisp.innerHTML = itemsComprados.map(item => {
                const sub = item.precio * item.cantidad;
                return `
                    <div class="order-summary-item">
                        <span class="order-summary-item-name">${item.nombre} <span class="order-summary-item-qty">x${item.cantidad}</span></span>
                        <span class="order-summary-item-price">S/ ${sub.toFixed(2)}</span>
                    </div>
                `;
            }).join("");

            // Añadir fila de costo de envío y total
            orderItemsDisp.innerHTML += `
                <div class="order-summary-item" style="margin-top: 6px; font-size: 12px; color: var(--color-text-light);">
                    <span>Costo de Envío</span>
                    <span>S/ ${COSTO_ENVIO.toFixed(2)}</span>
                </div>
                <hr class="resumen-divider" style="margin: 8px 0;">
                <div class="order-summary-item" style="font-weight: 900; font-size: 14px; color: var(--color-dark);">
                    <span>Total Pagado</span>
                    <span>S/ ${total.toFixed(2)}</span>
                </div>
            `;
        }
    }

    /* =========================================================================
       6. INICIALIZACIÓN Y CONTROLADOR DE RUTA
       ========================================================================= */

    // Carga inicial de items
    renderizarCarrito();
    
    // Ejecutar motor de cupones inteligente
    await verificarCuponRecomendado();

    // Ruteo por parámetro en la URL (?step=2)
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get("step");
    if (stepParam === "2") {
        irAlPaso(2);
    } else {
        irAlPaso(1);
    }

    // Escuchar el botón Continuar de la barra blanca superior del menú
    const btnContinuarGlobal = document.getElementById("btn-continuar");
    if (btnContinuarGlobal) {
        btnContinuarGlobal.addEventListener("click", (e) => {
            e.preventDefault();
            irAlPaso(2);
        });
    }

    // Escuchar actualizaciones externas al carrito
    window.addEventListener("carritoActualizado", () => {
        renderizarCarrito();
    });
});
