import { useEffect, useState, useCallback } from "react";
import instances from "../components/axios";

const useDashboardData = (customername, date, fields = []) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!customername || !date) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = fields.map((f) => `${f}=true`).join("&");
      const response = await instances.get(
        `/calculate/dashboard/${customername}/${date}?${queryParams}`
      );
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [customername, date, fields]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};

export default useDashboardData;
