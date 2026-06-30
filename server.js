// =========================================================================
// SERVIDOR LOCAL DE DESARROLLO - NUTRIFIT
// =========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    // Decodificar la URL para soportar caracteres especiales
    const decodedUrl = decodeURIComponent(req.url);
    console.log(`[REQUEST] URL: ${req.url} -> Decoded: ${decodedUrl}`);
    
    // 1. Endpoint seguro para exponer la configuración pública de Supabase
    if (decodedUrl === '/api/config') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
        });
        res.end(JSON.stringify({
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
        }));
        return;
    }

    // 2. Servir archivos estáticos de manera segura
    // Separar los parámetros de búsqueda de la ruta
    const urlPath = decodedUrl.split('?')[0].split('#')[0];
    
    // Normalizar la ruta y mapear la raíz a index.html
    const normalizedPath = urlPath === '/' ? '/index.html' : urlPath;
    
    // Construir la ruta absoluta del archivo resolviéndola en el directorio de la aplicación
    const filePath = path.join(__dirname, normalizedPath);

    // Seguridad: Bloquear acceso a archivos sensibles y de configuración
    const sensitiveFiles = ['.env', 'db_schema.sql', 'package.json', 'package-lock.json', 'server.js'];
    const fileName = path.basename(filePath);
    
    if (sensitiveFiles.includes(fileName) || fileName.startsWith('.')) {
        console.warn(`[403] Acceso prohibido a archivo sensible: ${normalizedPath}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 - Acceso denegado');
        return;
    }

    // Seguridad: Prevenir Directory Traversal (asegurar que la ruta resuelta está bajo la raíz)
    if (!filePath.startsWith(__dirname)) {
        console.warn(`[403] Intento de Directory Traversal detectado: ${normalizedPath}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 - Acceso denegado');
        return;
    }

    // Obtener la extensión y el Content-Type
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Leer y servir el archivo
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.warn(`[404] No encontrado: ${normalizedPath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - Archivo no encontrado');
            } else {
                console.error(`[500] Error del servidor al leer ${normalizedPath}:`, error.code);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Error interno del servidor: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` NutriFit: Servidor corriendo en http://localhost:${PORT}`);
    console.log(` Endpoint API Config: http://localhost:${PORT}/api/config`);
    console.log(`=======================================================`);
});
