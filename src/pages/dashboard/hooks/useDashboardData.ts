import { useState, useEffect } from "react";
import { useDataProvider, useNotify } from "react-admin";
import { DashboardDataProvider } from "../../../providers/dashbaordDataProvider.ts";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalOrders: number;
  revenueToday: number;
}

interface ChartData {
  date: string;
  value: number;
}

interface DashboardData {
  stats: DashboardStats;
  revenueChart: ChartData[];
  usersChart: ChartData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Custom hook for fetching and managing dashboard data
 * Provides statistics, chart data, loading state, and error handling
 *
 * @returns {DashboardData} Dashboard data, loading state, and refresh function
 *
 * @example
 * ```typescript
 * const Dashboard = () => {
 *   const { stats, revenueChart, isLoading, error, refresh } = useDashboardData();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       <StatsDisplay stats={stats} />
 *       <RevenueChart data={revenueChart} />
 *     </div>
 *   );
 * };
 * ```
 */
export const useDashboardData = (): DashboardData => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalOrders: 0,
    revenueToday: 0,
  });

  const [revenueChart, setRevenueChart] = useState<ChartData[]>([]);
  const [usersChart, setUsersChart] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dataProvider = useDataProvider<DashboardDataProvider>();
  const notify = useNotify();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch statistics
      const statsResponse =
        await dataProvider.dashboardStats<DashboardStats>("dashboard");
      setStats(statsResponse.data as DashboardStats);

      // Fetch revenue data
      const revenueResponse = await dataProvider.revenueChart<
        Array<Record<string, object>>
      >("dashboard", {
        pagination: { page: 1, perPage: 30 },
        sort: { field: "date", order: "ASC" },
        filter: { period: "last30days" },
      });
      setRevenueChart(revenueResponse.data as unknown as ChartData[]);

      // Fetch users data
      const usersResponse =
        await dataProvider.usersChart<ChartData[]>("dashboard");
      setUsersChart(usersResponse.data);
    } catch (err) {
      setError(err as Error);
      notify("Error loading dashboard data", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData().then(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchDashboardData().then(() => {});
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    revenueChart,
    usersChart,
    isLoading,
    error,
    refresh: fetchDashboardData,
  };
};

// Example usage with TypeScript type for the return data
export const useDashboardRevenue = () => {
  const { revenueChart, isLoading } = useDashboardData();

  const calculateTotalRevenue = () => {
    return revenueChart.reduce((sum, item) => sum + item.value, 0);
  };

  return {
    totalRevenue: calculateTotalRevenue(),
    revenueData: revenueChart,
    isLoading,
  };
};
