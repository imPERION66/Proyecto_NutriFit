-- =========================================================================
-- SCRIPT DE REESTRUCTURACIÓN DE TABLAS DE PEDIDOS (MAESTRO-DETALLE)
-- Ejecutar este script en el "SQL Editor" de Supabase
-- =========================================================================

-- Habilitar extensión para generación de UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Eliminar tablas existentes para asegurar una reestructuración limpia
DROP TABLE IF EXISTS public.detalle_pedidos CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;

-- 2. Crear Tabla de Pedidos (Maestro)
CREATE TABLE public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    estado TEXT DEFAULT 'En Preparación' NOT NULL,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    direccion_entrega TEXT NOT NULL,
    telefono TEXT,
    metodo_pago TEXT DEFAULT 'efectivo' NOT NULL
);

-- 3. Crear Tabla de Detalle de Pedidos (Detalle)
CREATE TABLE public.detalle_pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    plato_id TEXT REFERENCES public.platos(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

-- 4. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedidos ENABLE ROW LEVEL SECURITY;

-- 5. Crear Políticas de Acceso para la Tabla 'pedidos'
CREATE POLICY "Permitir a usuarios leer sus propios pedidos" 
    ON public.pedidos FOR SELECT 
    TO authenticated 
    USING (auth.uid() = usuario_id);

CREATE POLICY "Permitir a usuarios crear sus propios pedidos" 
    ON public.pedidos FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Permitir a usuarios actualizar sus propios pedidos" 
    ON public.pedidos FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = usuario_id);

CREATE POLICY "Permitir a administradores gestionar todos los pedidos" 
    ON public.pedidos FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE perfiles.id = auth.uid() AND perfiles.id_rol = 1
        )
    );

-- 6. Crear Políticas de Acceso para la Tabla 'detalle_pedidos'
CREATE POLICY "Permitir a usuarios leer los detalles de sus pedidos" 
    ON public.detalle_pedidos FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos 
            WHERE pedidos.id = detalle_pedidos.pedido_id AND pedidos.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Permitir a usuarios insertar detalles en sus pedidos" 
    ON public.detalle_pedidos FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos 
            WHERE pedidos.id = detalle_pedidos.pedido_id AND pedidos.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Permitir a administradores gestionar todos los detalles" 
    ON public.detalle_pedidos FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE perfiles.id = auth.uid() AND perfiles.id_rol = 1
        )
    );

-- 7. Conceder privilegios a los roles de la API
GRANT ALL ON public.pedidos TO anon, authenticated, service_role;
GRANT ALL ON public.detalle_pedidos TO anon, authenticated, service_role;
