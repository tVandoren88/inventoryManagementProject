import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";
import AccessDenied from "./AccessDenied";

interface TabItem {
    label: string;
    component: React.ReactNode;
    permission?: string; // Optional permission check
}

interface TabsMenuProps {
    tabs: TabItem[];
}

const TabsMenu: React.FC<TabsMenuProps> = ({ tabs }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const { user, role, loading, hasPermission } = useAuth();

    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    if (false) return <AccessDenied />;

    // Filter tabs based on permissions
    const visibleTabs = tabs.filter((tab) => !tab.permission || hasPermission([tab.permission]));

    return (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
            {visibleTabs.length > 0 ? (
                <>
                    {/* Tabs Navigation */}
                    <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} centered>
                        {visibleTabs.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>

                    {/* Render Selected Tab Content */}
                    <Box sx={{ mt: 2 }}>{visibleTabs[tabIndex].component}</Box>
                </>
            ) : (
                <AccessDenied />
            )}
        </Box>
    );
};

export default TabsMenu;
