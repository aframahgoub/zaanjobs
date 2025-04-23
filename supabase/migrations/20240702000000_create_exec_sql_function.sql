-- Create the exec_sql function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'exec_sql'
  ) THEN
    EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result JSONB;
    BEGIN
      EXECUTE sql;
      RETURN jsonb_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
    END;
    $$;
    $FUNC$;
  END IF;
END;
$$;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, anon;
