import { Box, Typography } from "@mui/material";
import TabsMenu from "../components/TabsMenu";
import AddEntity from "../components/AddEntity";
import Users from "../components/Users";
import AdminSettings from "../components/AdminSettings";

const Admin: React.FC = () => {
    const tabs = [
        { label: "Add User", component: <AddEntity entityType="user" />, permission: "manageUsers" },
        { label: "Manage Users", component: <Users />, permission: "view" },
        { label: "Settings", component: <AdminSettings />, permission: "adminSettings" },
        // { label: "Create Report", component: <CreateReport />, permission: "createReport" },
    ];
    return (
        <Box >
            <TabsMenu tabs={tabs}></TabsMenu>
        </Box>
    );
};

export default Admin;
