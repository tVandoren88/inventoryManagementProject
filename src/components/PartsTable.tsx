import { Box, MenuItem, Select } from "@mui/material";
import DataTable from "./DataTable";
import { useAuth } from "../context/AuthContext";
import { validateField } from "../utils/validation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { GridRenderEditCellParams } from "@mui/x-data-grid";

const PartsTable: React.FC = () => {
    const { hasPermission } = useAuth();
    const [vendorList, setVendorList] = useState<{ id: string, name: string }[]>([]);
    const [vendorMap, setVendorMap] = useState<Record<string, string>>({});
    const [alert, setAlert] = useState<{ message: string; severity: "success" | "error" | "warning" | "info" } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchAll = async () => {
    // 1. Fetch vendors and build map
    const { data: vendors, error: vendorError } = await supabase.from("vendors").select("id, name");

    setVendorList(vendors || []);
    setVendorMap((vendors || []).reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
    }, {} as Record<string, string>));
    if (vendorError) {
      console.error("Error fetching vendors:", vendorError);
      setAlert({ message: `Error fetching vendors: ${vendorError.message}`, severity: "error" });
      setLoading(false);
      return;
    }

    const map = (vendors || []).reduce((acc, vendor) => {
      acc[vendor.id] = vendor.name;
      return acc;
    }, {} as Record<string, string>);


  };

    useEffect(() => {

    fetchAll();
    }, []);

    const columns = [
        { field: "name", dbField: "name", headerName: "Part Name", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('required',value, true) },
        { field: "description", dbField: "description", headerName: "Description", width: 200, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('required',value, true) },
        { field: "cog", dbField: "cog", headerName: "Cost of Goods", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('price',value, true) },
        { field: "selling_price", dbField: "selling_price", headerName: "Selling Price", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('price',value, false) },
        { field: "tax", dbField: "tax", headerName: "Tax", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('price',value, false) },
        { field: "total_price", dbField: "total_price", headerName: "Total Price", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('price',value, false) },
        { field: "quantity", dbField: "quantity", headerName: "Quantity", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('number',value, true) },
        { field: "product_number", dbField: "product_number", headerName: "Product Number", width: 150, editable: hasPermission(["manageParts"]), validate: (value:string) => validateField('required',value, true) },
        { field: "vendor_id",
            dbField: "vendor_id",
            headerName: "Vendor",
            width: 150,
            editable: hasPermission(["manageParts"]),
            validate: (value:string) => validateField('required',value, true),

            valueFormatter: (params) => {
                if (!params) return "Unknown Vendor";
                return vendorMap[params] || "Unknown Vendor";
            },

            renderEditCell: (params: GridRenderEditCellParams) => {
                      const { id, field, value, api } = params;

                      return (
                        <Select
                          value={value || ""}
                          onChange={(event) => {
                            api.setEditCellValue({ id, field, value: event.target.value });
                            api.stopRowEditMode({ id });
                          }}
                          fullWidth
                        >
                          {vendorList.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.name}
                            </MenuItem>
                          ))}
                        </Select>
                      );
                    },
         },
    ];

    return (
        <Box sx={{ flexGrow: 1, width: "100%", flexDirection: "column", alignItems: "stretch", p: 2 }}>

            <DataTable
                tableName="parts"
                columns={columns}
                defaultRowData={{
                    name: "",
                    description: "",
                    cog: "",
                    selling_price: "",
                    tax: "",
                    total_price: "",
                    quantity: "",
                    product_number: "",
                    vendor_id: ""
                }}
                editPermissions = {hasPermission(["manageParts"])}
                sortColumn="id"
                sortDirection={'desc'}
            />
        </Box>
    );
};

export default PartsTable;
