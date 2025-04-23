-- Create a function to execute SQL statements
CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN '{"success": true}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'code', SQLSTATE
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Grant execute permission to anon users (if needed for your app)
GRANT EXECUTE ON FUNCTION exec_sql TO anon;
