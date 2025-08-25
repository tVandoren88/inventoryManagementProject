import { Box, Typography } from "@mui/material";
import TabsMenu from "../components/tabsMenu";
import CustomerTable from "../components/CustomerTable";
import AddEntity from "../components/AddEntity";

const Customers: React.FC = () => {
    const tabs = [
        { label: "Add Customer", component: <AddEntity entityType="customer" />, permission: "manageCustomers" },
        { label: "View Customers", component: <CustomerTable />, permission: "view" },
        // { label: "Create Report", component: <CreateReport />, permission: "createReport" },
    ];
    return (
        <Box sx={{justifyContent: 'center', width:'100%'}}>
            <TabsMenu tabs={tabs}></TabsMenu>
        </Box>
    );
};

export default Customers;
