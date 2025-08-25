// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
    Box,
    Tabs,
    Tab,
    Container,
    Typography,
    Grid,
    Paper,
    useTheme,
} from "@mui/material";
import AddPart from "./Parts";
import CustomerTable from "../components/CustomerTable";
import Loading from "../components/Loading";
import AccessDenied from "../components/AccessDenied";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const Dashboard: React.FC = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const { user, role, loading, hasPermission, company_id } = useAuth();
    const theme = useTheme();
    const [counts, setCounts] = useState({
        parts: 0,
        customers: 0,
        invoices: 0,
        pendingOrders: 0,
    });

    const fetchCounts = async () => {

        const [partsRes, customersRes, invoicesRes, pendingOrdersRes] = await Promise.all([
        supabase.from("parts").select("*", { count: "exact", head: true }).eq("company_id", company_id),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("company_id", company_id),
        supabase.from("invoices").select("*", { count: "exact", head: true }).eq("company_id", company_id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("company_id", company_id).eq("status", "pending"),
        ]);

        setCounts({
        parts: partsRes.count ?? 0,
        customers: customersRes.count ?? 0,
        invoices: invoicesRes.count ?? 0,
        pendingOrders: pendingOrdersRes.count ?? 0,
        });
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    // if (role !== "admin") return <AccessDenied />;

    return (
        <Container maxWidth="lg"
                sx={{
                paddingTop: 0,
                paddingBottom: 0,
                margin: 0,
            }}>
            {hasPermission(['viewDashboard']) && (
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Dashboard
                    </Typography>

                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6">Total Parts</Typography>
                                <Typography variant="h4">{counts.parts}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6">Customers</Typography>
                                <Typography variant="h4">{counts.customers}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6">Invoices</Typography>
                                <Typography variant="h4">{counts.invoices}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6">Pending Orders</Typography>
                                <Typography variant="h4">{counts.parts}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Tabs
                        value={tabIndex}
                        onChange={(_, newValue) => setTabIndex(newValue)}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Add Part" />
                        <Tab label="Customers" />
                    </Tabs>

                    {tabIndex === 0 && <AddPart />}
                    {tabIndex === 1 && <CustomerTable />}
                </Box>
            )}
        </Container>
    );
};

export default Dashboard;
