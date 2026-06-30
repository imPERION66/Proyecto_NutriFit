-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA NUTRIFIT
-- =========================================================================

-- Habilitar la extensión para UUIDs si no está habilitada
create extension if not exists "uuid-ossp";

-- 1. TABLA: roles
create table if not exists public.roles (
    id integer primary key,
    nombre text not null unique
);

-- Inserción de Roles Semilla
insert into public.roles (id, nombre) values
(1, 'Administrador'),
(2, 'Cliente')
on conflict (id) do nothing;

-- 2. TABLA: perfiles
create table if not exists public.perfiles (
    id uuid references auth.users on delete cascade primary key,
    nombre_completo text,
    correo_electronico text,
    id_rol integer references public.roles(id) default 2,
    peso numeric(5,2), -- en kg, e.g., 75.50
    talla numeric(5,2), -- en cm, e.g., 175.00
    objetivo text check (objetivo in ('bajar', 'mantener', 'ganar')),
    fecha_creacion timestamp with time zone default now()
);

-- 3. TABLA: platos
create table if not exists public.platos (
    id text primary key, -- e.g., 'omelette-fit'
    nombre text not null,
    categoria text not null check (categoria in ('desayuno', 'almuerzo', 'cena', 'postre')),
    objetivo text not null check (objetivo in ('bajar', 'mantener', 'ganar')),
    kcal integer not null,
    proteina integer not null,
    carbohidratos integer not null,
    precio numeric(10,2) not null,
    imagen_url text not null,
    activo boolean default true,
    fecha_creacion timestamp with time zone default now()
);

-- Inserción de 40 Platos Semilla
insert into public.platos (id, nombre, categoria, objetivo, kcal, proteina, carbohidratos, precio, imagen_url) values
-- --- DESAYUNOS ---
('omelette-fit', 'Omelette de Claras y Espinaca', 'desayuno', 'bajar', 240, 22, 18, 14.50, '../assets/img/platos/desayunos/omelette-fit.jpg'),
('avena-frutos-rojos', 'Bowl de Avena con Arándanos', 'desayuno', 'mantener', 258, 13, 21, 15.40, '../assets/img/platos/desayunos/avena-frutos-rojos.jpg'),
('pancakes-proteicos', 'Pancakes de Avena y Plátano', 'desayuno', 'ganar', 276, 14, 24, 16.30, '../assets/img/platos/desayunos/pancakes-proteicos.jpg'),
('tostadas-palta', 'Tostadas Integrales con Palta y Huevo', 'desayuno', 'mantener', 294, 15, 27, 17.20, '../assets/img/platos/desayunos/tostadas-palta.jpg'),
('arepa-fit', 'Arepas de Maíz con Queso Light', 'desayuno', 'mantener', 312, 16, 30, 18.10, '../assets/img/platos/desayunos/arepa-fit.jpg'),
('quinoa-breakfast', 'Quinoa con Manzana y Canela', 'desayuno', 'ganar', 330, 17, 33, 19.00, '../assets/img/platos/desayunos/quinoa-breakfast.jpg'),
('smoothie-mango', 'Smoothie Bowl de Mango y Chía', 'desayuno', 'bajar', 348, 18, 36, 19.90, '../assets/img/platos/desayunos/smoothie-mango.jpg'),
('yogurt-granola', 'Yogurt Griego con Granola Artesanal', 'desayuno', 'mantener', 366, 19, 39, 20.80, '../assets/img/platos/desayunos/yogurt-granola.jpg'),
('revuelto-vegano', 'Revuelto de Tofu con Cúrcuma', 'desayuno', 'bajar', 384, 20, 42, 21.70, '../assets/img/platos/desayunos/revuelto-vegano.jpg'),
('shake-cafe', 'Batido Energético de Café y Proteína', 'desayuno', 'ganar', 402, 21, 45, 22.60, '../assets/img/platos/desayunos/shake-cafe.jpg'),
-- --- ALMUERZOS ---
('ceviche-clasico', 'Ceviche de Pescado Clásico', 'almuerzo', 'bajar', 390, 22, 28, 19.00, '../assets/img/platos/almuerzos/ceviche-clasico.jpg'),
('aji-gallina-light', 'Ají de Gallina con Arroz Integral', 'almuerzo', 'mantener', 414, 23, 32, 20.20, '../assets/img/platos/almuerzos/aji-gallina-light.jpg'),
('lomo-saltado-pollo', 'Lomo Saltado de Pollo con Papas', 'almuerzo', 'ganar', 438, 24, 36, 21.40, '../assets/img/platos/almuerzos/lomo-saltado-pollo.jpg'),
('salmon-grill', 'Salmón al Horno con Espárragos', 'almuerzo', 'bajar', 462, 25, 40, 22.60, '../assets/img/platos/almuerzos/salmon-grill.jpg'),
('tacu-tacu-fit', 'Tacu Tacu de Lentejas con Huevo', 'almuerzo', 'ganar', 486, 26, 44, 23.80, '../assets/img/platos/almuerzos/tacu-tacu-fit.jpg'),
('quinoa-bowl-pollo', 'Ensalada de Quinoa con Pollo', 'almuerzo', 'mantener', 510, 27, 48, 25.00, '../assets/img/platos/almuerzos/quinoa-bowl-pollo.jpg'),
('pasta-pesto', 'Pasta Integral con Pesto', 'almuerzo', 'ganar', 534, 28, 52, 26.20, '../assets/img/platos/almuerzos/pasta-pesto.jpg'),
('sudado-pescado', 'Sudado de Pescado', 'almuerzo', 'bajar', 558, 29, 56, 27.40, '../assets/img/platos/almuerzos/sudado-pescado.jpg'),
('arroz-pollo-light', 'Arroz con Pollo Integral', 'almuerzo', 'mantener', 582, 30, 60, 28.60, '../assets/img/platos/almuerzos/arroz-pollo-light.jpg'),
('poke-salmon', 'Poke Bowl de Salmón y Edamame', 'almuerzo', 'bajar', 606, 31, 64, 29.80, '../assets/img/platos/almuerzos/poke-salmon.jpg'),
-- --- CENAS ---
('sopa-pollo', 'Sopa Dietética de Pollo y Verduras', 'cena', 'bajar', 280, 18, 14, 17.00, '../assets/img/platos/cenas/sopa-pollo-clara.jpg'),
('tacos-lechuga', 'Tacos de Lechuga con Carne Magra', 'cena', 'bajar', 300, 19, 17, 18.05, '../assets/img/platos/cenas/tacos-lechuga.jpg'),
('pizza-fit', 'Pizza con Base de Coliflor', 'cena', 'mantener', 320, 20, 20, 19.10, '../assets/img/platos/cenas/pizza-fit.jpg'),
('pollo-limon', 'Pechuga de Pollo al Limón', 'cena', 'mantener', 340, 21, 23, 20.15, '../assets/img/platos/cenas/pollo-limon.jpg'),
('burger-lentejas', 'Hamburguesa de Lentejas', 'cena', 'mantener', 360, 22, 26, 21.20, '../assets/img/platos/cenas/burger-lentejas.jpg'),
('brochetas-pollo', 'Brochetas de Pollo y Vegetales', 'cena', 'bajar', 380, 23, 29, 22.25, '../assets/img/platos/cenas/brochetas-pollo.jpg'),
('wrap-atun', 'Wrap Integral de Atún', 'cena', 'mantener', 400, 24, 32, 23.30, '../assets/img/platos/cenas/wrap-atun.jpg'),
('pescado-pure', 'Pescado a la Plancha con Puré', 'cena', 'ganar', 420, 25, 35, 24.35, '../assets/img/platos/cenas/pescado-pure.jpg'),
('quesadilla-fit', 'Quesadilla Integral de Espinaca', 'cena', 'mantener', 440, 26, 38, 25.40, '../assets/img/platos/cenas/quesadilla-fit.jpg'),
('atun-sesamo', 'Atun Sellado con Sésamo', 'cena', 'ganar', 460, 27, 41, 26.45, '../assets/img/platos/cenas/atun-sesamo.jpg'),
-- --- POSTRES ---
('mousse-palta', 'Mousse de Chocolate con Palta', 'postre', 'mantener', 130, 5, 16, 9.50, '../assets/img/platos/postres/mousse-palta.jpg'),
('gelatina-fruta', 'Gelatina Diet con Frutas', 'postre', 'bajar', 152, 6, 20, 10.45, '../assets/img/platos/postres/gelatina-fruta.jpg'),
('barras-proteina', 'Barritas de Proteína', 'postre', 'ganar', 174, 7, 24, 11.40, '../assets/img/platos/postres/barras-proteina.jpg'),
('manzana-asada', 'Manzana Asada con Canela', 'postre', 'bajar', 196, 8, 28, 12.35, '../assets/img/platos/postres/manzana-asada.jpg'),
('mazamorra-light', 'Mazamorra Morada Light', 'postre', 'mantener', 218, 9, 32, 13.30, '../assets/img/platos/postres/mazamorra-light.jpg'),
('pudin-tofu', 'Pudín de Chocolate con Tofu', 'postre', 'mantener', 240, 10, 36, 14.25, '../assets/img/platos/postres/pudin-tofu.jpg'),
('galletas-avena', 'Galletas de Avena y Cacao', 'postre', 'ganar', 262, 11, 40, 15.20, '../assets/img/platos/postres/galletas-avena.jpg'),
('trufas-datiles', 'Trufas de Dátiles y Coco', 'postre', 'ganar', 284, 12, 44, 16.15, '../assets/img/platos/postres/trufas-datiles.jpg'),
('sorbete-mango', 'Sorbete de Mango Natural', 'postre', 'bajar', 306, 13, 48, 17.10, '../assets/img/platos/postres/sorbete-mango.jpg'),
('frozen-yogurt', 'Yogurt Helado con Arándanos', 'postre', 'bajar', 328, 14, 52, 18.05, '../assets/img/platos/postres/frozen-yogurt.jpg')
on conflict (id) do update set
    nombre = excluded.nombre,
    categoria = excluded.categoria,
    objetivo = excluded.objetivo,
    kcal = excluded.kcal,
    proteina = excluded.proteina,
    carbohidratos = excluded.carbohidratos,
    precio = excluded.precio,
    imagen_url = excluded.imagen_url;

-- 4. TABLA: pedidos
create table if not exists public.pedidos (
    id uuid default gen_random_uuid() primary key,
    usuario_id uuid references public.perfiles(id) not null,
    fecha_pedido timestamp with time zone default now(),
    estado text default 'pendiente' check (estado in ('pendiente', 'preparando', 'en camino', 'entregado', 'cancelado')),
    total numeric(10,2) not null check (total >= 0),
    direccion_entrega text,
    telefono text
);

-- 5. TABLA: detalle_pedidos
create table if not exists public.detalle_pedidos (
    id uuid default gen_random_uuid() primary key,
    pedido_id uuid references public.pedidos(id) on delete cascade not null,
    plato_id text references public.platos(id) not null,
    cantidad integer not null check (cantidad > 0),
    precio_unitario numeric(10,2) not null check (precio_unitario >= 0)
);

-- 6. TABLA: reclamos
create table if not exists public.reclamos (
    id uuid default gen_random_uuid() primary key,
    usuario_id uuid references public.perfiles(id) on delete set null,
    nombre_completo text not null,
    correo text not null,
    telefono text,
    detalle text not null,
    fecha_reclamo timestamp with time zone default now(),
    estado text default 'pendiente' check (estado in ('pendiente', 'en revision', 'resuelto'))
);

-- =========================================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS) Y PRIVILEGIOS
-- =========================================================================

-- Habilitar RLS en todas las tablas
alter table public.roles enable row level security;
alter table public.perfiles enable row level security;
alter table public.platos enable row level security;
alter table public.pedidos enable row level security;
alter table public.detalle_pedidos enable row level security;
alter table public.reclamos enable row level security;

-- Función de ayuda para verificar si un usuario es administrador de forma segura (evita recursión)
create or replace function public.es_administrador(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.perfiles
    where id = user_id and id_rol = 1
  );
end;
$$ language plpgsql security definer;

-- POLÍTICAS: roles
create policy "Permitir lectura publica de roles" on public.roles
    for select to public using (true);

create policy "Permitir escritura de roles solo a administradores" on public.roles
    for all to authenticated
    using (public.es_administrador(auth.uid()));

-- POLÍTICAS: perfiles
create policy "Permitir a usuarios leer su propio perfil" on public.perfiles
    for select to authenticated
    using (auth.uid() = id);

create policy "Permitir a usuarios insertar su propio perfil" on public.perfiles
    for insert to authenticated
    with check (auth.uid() = id);

create policy "Permitir a usuarios actualizar su propio perfil" on public.perfiles
    for update to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "Permitir a administradores leer todos los perfiles" on public.perfiles
    for select to authenticated
    using (public.es_administrador(auth.uid()));

create policy "Permitir a administradores actualizar todos los perfiles" on public.perfiles
    for update to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- POLÍTICAS: platos
create policy "Permitir lectura publica de platos" on public.platos
    for select to public using (true);

create policy "Permitir administracion de platos a administradores" on public.platos
    for all to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- POLÍTICAS: pedidos
create policy "Permitir a usuarios leer sus propios pedidos" on public.pedidos
    for select to authenticated
    using (auth.uid() = usuario_id);

create policy "Permitir a usuarios crear sus propios pedidos" on public.pedidos
    for insert to authenticated
    with check (auth.uid() = usuario_id);

create policy "Permitir a administradores gestionar todos los pedidos" on public.pedidos
    for all to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- POLÍTICAS: detalle_pedidos
create policy "Permitir a usuarios leer detalles de sus pedidos" on public.detalle_pedidos
    for select to authenticated
    using (
        exists (
            select 1 from public.pedidos
            where pedidos.id = detalle_pedidos.pedido_id and pedidos.usuario_id = auth.uid()
        )
    );

create policy "Permitir a usuarios insertar detalles en sus pedidos" on public.detalle_pedidos
    for insert to authenticated
    with check (
        exists (
            select 1 from public.pedidos
            where pedidos.id = detalle_pedidos.pedido_id and pedidos.usuario_id = auth.uid()
        )
    );

create policy "Permitir a administradores gestionar todos los detalles" on public.detalle_pedidos
    for all to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- POLÍTICAS: reclamos
create policy "Permitir insertar reclamos a cualquiera" on public.reclamos
    for insert to public
    with check (true);

create policy "Permitir a usuarios leer sus propios reclamos" on public.reclamos
    for select to authenticated
    using (auth.uid() = usuario_id);

create policy "Permitir a administradores gestionar todos los reclamos" on public.reclamos
    for all to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- =========================================================================
-- DISPARADORES (TRIGGERS) PARA AUTOMATIZACIONES
-- =========================================================================

-- Función para insertar perfil automático en registro de usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre_completo, correo_electronico, id_rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre_completo', new.raw_user_meta_data->>'full_name', 'Usuario NutriFit'),
    new.email,
    2
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para ejecutar la función handle_new_user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- CONCESIÓN DE PRIVILEGIOS DE API PARA ROLES ANON Y AUTHENTICATED
-- =========================================================================
grant usage on schema public to anon, authenticated;
grant all privileges on all tables in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to anon, authenticated;
grant all privileges on all functions in schema public to anon, authenticated;

-- =========================================================================
-- 7. TABLA: contactos
-- =========================================================================
create table if not exists public.contactos (
    id uuid default gen_random_uuid() primary key,
    usuario_id uuid references public.perfiles(id) on delete set null,
    nombre_completo text not null,
    correo_electronico text not null,
    telefono text,
    motivo text not null,
    mensaje text not null,
    fecha_creacion timestamp with time zone default now(),
    estado text default 'pendiente' check (estado in ('pendiente', 'leido', 'respondido'))
);

-- RLS para contactos
alter table public.contactos enable row level security;

create policy "Permitir insertar contactos a cualquiera" on public.contactos
    for insert to public
    with check (true);

create policy "Permitir a administradores gestionar todos los contactos" on public.contactos
    for all to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- Otorgar privilegios a la nueva tabla
grant all privileges on public.contactos to anon, authenticated;

-- =========================================================================
-- MODIFICACIONES ADICIONALES PARA EL PERFIL DEL CLIENTE
-- =========================================================================

-- Agregar columnas a perfiles si no existen
alter table public.perfiles add column if not exists telefono text;
alter table public.perfiles add column if not exists direccion text;
alter table public.perfiles add column if not exists latitud numeric(10, 8);
alter table public.perfiles add column if not exists longitud numeric(11, 8);

-- =========================================================================
-- 8. TABLA: tarjetas_usuario
-- =========================================================================
create table if not exists public.tarjetas_usuario (
    id uuid default gen_random_uuid() primary key,
    usuario_id uuid references public.perfiles(id) on delete cascade not null,
    numero_enmascarado text not null,
    nombre_titular text not null,
    fecha_vencimiento text not null,
    fecha_creacion timestamp with time zone default now()
);

-- RLS para tarjetas_usuario
alter table public.tarjetas_usuario enable row level security;

create policy "Permitir a usuarios gestionar sus propias tarjetas" on public.tarjetas_usuario
    for all to authenticated
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);

create policy "Permitir a administradores gestionar todas las tarjetas" on public.tarjetas_usuario
    for all to authenticated
    using (public.es_administrador(auth.uid()))
    with check (public.es_administrador(auth.uid()));

-- Otorgar privilegios a la nueva tabla
grant all privileges on public.tarjetas_usuario to anon, authenticated;

