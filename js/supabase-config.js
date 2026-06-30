// =========================================================================
// CONFIGURACIÓN GLOBAL DE SUPABASE - NUTRIFIT
// =========================================================================

// Configuración por defecto de desarrollo (fallback en caso de que no se cargue .env)
const DEFAULT_URL = "https://hrzxkedepcjayiqmaslo.supabase.co";
const DEFAULT_ANON_KEY = "sb_publishable_qOrhQv98yYFILqA36uYCbw_P5rBhTS8";

// Función auxiliar para formatear la URL con el protocolo https:// si es necesario
function formatSupabaseUrl(url) {
    if (!url) return "";
    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url;
}

// Inicialización global del cliente de Supabase
let supabaseClient = null;

if (typeof supabase === 'undefined') {
    console.error("Error: La librería de Supabase vía CDN no se ha cargado antes de este archivo de configuración.");
} else {
    // Inicialización sincrónica inicial con los valores por defecto
    supabaseClient = supabase.createClient(formatSupabaseUrl(DEFAULT_URL), DEFAULT_ANON_KEY);
    console.log("NutriFit: Cliente de Supabase inicializado con configuración por defecto.");
}

// Carga dinámica de variables desde el endpoint de configuración local (/api/config)
async function cargarVariablesEntorno() {
    if (typeof supabase === 'undefined') return;
    
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();

        // Si se cargaron las variables del servidor, re-inicializar el cliente
        const url = config.SUPABASE_URL;
        const anonKey = config.SUPABASE_ANON_KEY;

        if (url && anonKey) {
            supabaseClient = supabase.createClient(formatSupabaseUrl(url), anonKey);
            console.log("NutriFit: Conexión con Supabase actualizada exitosamente desde el servidor local (/api/config).");
        }
    } catch (error) {
        console.warn("NutriFit: No se pudo obtener la configuración dinámica desde /api/config. Usando configuración por defecto de desarrollo. Detalles:", error.message);
    }
}

// Ejecutar la carga al importar el script
cargarVariablesEntorno();