import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Loading, Title } from "react-admin";
import { useDashboardData } from "./hooks/useDashboardData";

import { RevenueChart } from "./parts/RevenueChart.tsx";
import { StatsCards } from "./parts/StatsCards";
import { UsersChart } from "./parts/UsersChart.tsx";
//import { useSettings } from "./hooks/useSettings.ts";

export const Dashboard: React.FC = () => {
  //const { settings } = useSettings();
  const { stats, revenueChart, usersChart, isLoading, error } =
    useDashboardData();

  if (isLoading) return <Loading />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  return (
    <div>
      <Title title="Dashboard" />

      <Grid container spacing={2}>
        {/* Stats Cards */}
        <Grid size={{ xl: 12 }}>
          <StatsCards stats={stats} />
        </Grid>

        {/* Revenue Chart */}
        <Grid size={{ xl: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Revenue</Typography>
              <RevenueChart data={revenueChart} />
            </CardContent>
          </Card>
        </Grid>

        {/* Users Chart */}
        <Grid size={{ xl: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Users</Typography>
              <UsersChart data={usersChart} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
