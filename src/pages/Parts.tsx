import { Box, Typography } from "@mui/material";
import TabsMenu from "../components/TabsMenu";
import PartsTable from "../components/PartsTable";
import AddEntity from "../components/AddEntity";

const Parts: React.FC = () => {
    const tabs = [
        { label: "Add Part", component: <AddEntity entityType="part" />, permission: "manageParts" },
        { label: "View Parts", component: <PartsTable />, permission: "view" },
        // { label: "Create Report", component: <CreateReport />, permission: "createReport" },
    ];
    return (
        <Box sx={{ justifyContent: 'center', width:'100%'}}>
            <TabsMenu tabs={tabs}></TabsMenu>
        </Box>
    );
};

export default Parts;
