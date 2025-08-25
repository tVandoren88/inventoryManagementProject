import { Box, Typography } from "@mui/material";
import TabsMenu from "../components/tabsMenu";
import VendorTable from "../components/VendorTable";
import AddEntity from "../components/AddEntity";

const Vendors: React.FC = () => {
    const tabs = [
        { label: "Add Vendor", component: <AddEntity entityType="vendor" />, permission: "manageVendors" },
        { label: "View Vendors", component: <VendorTable />, permission: "view" },
        // { label: "Create Report", component: <CreateReport />, permission: "createReport" },
    ];
    return (
        <Box sx={{display: 'flex', justifyContent: 'center', width:'100%'}}>
            <TabsMenu tabs={tabs}></TabsMenu>
        </Box>
    );
};

export default Vendors;
