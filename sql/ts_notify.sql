CREATE OR REPLACE FUNCTION notify_bdt_execution() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM pg_notify('bdt_execution'::TEXT, NEW.id::TEXT);
    RETURN NEW;
END;
$$;

CREATE TRIGGER bdt_execution_trigger AFTER INSERT ON public.app_bdttestexecution
FOR EACH ROW EXECUTE PROCEDURE notify_bdt_execution();



CREATE OR REPLACE FUNCTION notify_rt_execution() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM pg_notify('rt_execution'::TEXT, NEW.id::TEXT);
    RETURN NEW;
END;
$$;

CREATE TRIGGER rt_execution_trigger AFTER INSERT ON public.app_rttestexecution
FOR EACH ROW EXECUTE PROCEDURE notify_rt_execution();




CREATE OR REPLACE FUNCTION notify_e2e_execution() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM pg_notify('e2e_execution'::TEXT, NEW.id::TEXT);
    RETURN NEW;
END;
$$;

CREATE TRIGGER e2e_execution_trigger AFTER INSERT ON public.app_e2etestexecution
FOR EACH ROW EXECUTE PROCEDURE notify_e2e_execution();




CREATE OR REPLACE FUNCTION notify_vrt_execution() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM pg_notify('vrt_execution'::TEXT, NEW.id::TEXT);
    RETURN NEW;
END;
$$;

CREATE TRIGGER vrt_execution_trigger AFTER INSERT ON public.app_vrttestexecution
FOR EACH ROW EXECUTE PROCEDURE notify_vrt_execution();