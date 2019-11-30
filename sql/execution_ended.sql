CREATE FUNCTION public."EXECUTION_ENDED"(IN "EXECUTION_ID" integer)
    RETURNS TABLE(ENDED BOOLEAN)
    LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
RETURN QUERY 
	SELECT COUNT(*) = SUM(STATUS) AS ENDED
	FROM (SELECT (CASE
			WHEN (rt.status IS NULL OR rt.status <> 'PROCESANDO') AND (l.status IS NULL OR l.status <> 'PROCESANDO') 
				AND (e2e.status IS NULL OR e2e.status <> 'PROCESANDO') AND (vrt.status IS NULL OR vrt.status <> 'PROCESANDO') 
				AND (bdt.status IS NULL OR bdt.status <> 'PROCESANDO') THEN 1
			ELSE 0
		END) AS STATUS
		FROM public.app_teststrategyexecution tte
		LEFT JOIN public.app_rttestexecution rt ON rt.test_strategy_execution_id = tte.id
		LEFT JOIN public.app_lighthouseexecution l ON l.test_strategy_execution_id = tte.id
		LEFT JOIN public.app_e2etestexecution e2e ON e2e.test_strategy_execution_id = tte.id
		LEFT JOIN public.app_vrttestexecution vrt ON vrt.test_strategy_execution_id = tte.id
		LEFT JOIN public.app_bdttestexecution bdt ON bdt.test_strategy_execution_id = tte.id
		WHERE tte.id = $1) A;
END
$BODY$;
ALTER FUNCTION public."EXECUTION_ENDED"(integer)
    OWNER TO miller;