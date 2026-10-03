-- Bloquea el acceso directo vía PostgREST (anon/authenticated) a las tablas de
-- la app. Todo el acceso pasa por el servidor Next.js usando Prisma con el rol
-- propietario (que no está sujeto a RLS). Sin políticas = denegado por defecto.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','projects','events','event_participations','event_supervisors',
    'donations','allies','rewards','reward_claims','points_transactions',
    'site_settings','core_values','org_areas','contact_messages'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- La tabla interna de Prisma tampoco debe exponerse (no existe en la shadow DB).
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
