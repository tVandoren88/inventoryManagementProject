import { Box, Typography } from "@mui/material";
import TabsMenu from "../components/tabsMenu";
import InvoiceTable from "../components/InvoiceTable";
import AddEntity from "../components/AddEntity";

const Invoices: React.FC = () => {
    const tabs = [
        { label: "Add Invoice", component: <AddEntity entityType="invoice" />, permission: "manageInvoices" },
        { label: "View Invoices", component: <InvoiceTable />, permission: "view" },
        // { label: "Create Report", component: <CreateReport />, permission: "createReport" },
    ];
    return (
        <Box sx={{justifyContent: 'center', width:'100%'}}>
            <TabsMenu tabs={tabs} ></TabsMenu>
        </Box>
    );
};

export default Invoices;
