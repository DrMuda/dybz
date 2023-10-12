import { useCallback, useEffect, useState } from "react";

export default <Res>({
  queryKey,
  queryFn,
  retryMaxCount = 1,
}: {
  queryKey: unknown[];
  queryFn: () => Promise<Res>;
  retryMaxCount?: number;
}) => {
  const [data, setData] = useState<Res | void>();
  const [isLoading, setIsLoading] = useState(false);
  const [isReFetching, setIsReFetching] = useState(false);
  const [error, setError] = useState<never>();

  const query = useCallback(async () => {
    let success = false;
    let retryCount = 0;
    setError(undefined);
    let res: void | Res = undefined;
    while (!success && retryCount < retryMaxCount) {
      res = await queryFn().catch((error) => {
        setError(error);
      });
      if (res) {
        success = true;
      } else {
        retryCount++;
      }
    }
    setData(res);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFn, ...queryKey]);
  const refetch = useCallback(async () => {
    setIsReFetching(true);
    await query();
    setIsReFetching(false);
  }, [query]);

  useEffect(() => {
    setIsLoading(true);
    query().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    isLoading,
    isReFetching,
    error,
    refetch,
  };
};
