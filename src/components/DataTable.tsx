import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    DataGrid,
    GridColDef,
    GridRowModes,
    GridRowModel,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarQuickFilter,
    GridActionsCellItem,
    GridFilterModel,
    GridToolbar,
    GridRowId,
    GridSortDirection,
} from "@mui/x-data-grid";
import {
    Alert,
    Box,
    Container,
    IconButton,
    Snackbar,
    Button,
    Input,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArticleIcon from '@mui/icons-material/Article';
import { CustomGridColDef } from "../utils/types"
import {GridApiCommon } from "@mui/x-data-grid";
import { useGridApiRef, GridCsvExportOptions, gridFilteredSortedRowIdsSelector, gridVisibleColumnFieldsSelector } from "@mui/x-data-grid";
import { constant } from "lodash";
interface DataTableProps {
    tableName: string;
    columns: CustomGridColDef[];
    defaultRowData: Record<string, any>;
    editPermissions:Boolean;
    sortColumn: string;
    sortDirection?:GridSortDirection;
}

const DataTable: React.FC<DataTableProps> = ({ tableName, columns = [], defaultRowData, editPermissions = false, sortColumn, sortDirection='asc'}) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [rowModesModel, setRowModesModel] = useState<Record<number, { mode: GridRowModes }>>({});
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] });
    const [alert, setAlert] = useState<{ message: string; severity: "success" | "error" | "warning" | "info" } | null>(null);
    const [originalRows, setOriginalRows] = useState<Record<GridRowId, any>>({});
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [vendorMap, setVendorMap] = useState<Record<string, string>>({});
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; id:  null;}>({
        open: false,
        id: null,
    });


const apiRef = useGridApiRef();
    const newColumns: CustomGridColDef[] = [
        ...(editPermissions
            ? [{
                field: "actions",
                headerName: "Actions",
                type: "actions",
                width: 150,
                cellClassName: "actions",
                getActions: ({ id }) => {
                    if (id === undefined) {
                        setAlert({ message: "Invalid row ID in actions", severity: "error" });
                        return [];
                    }
                    const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                    if (isInEditMode) {
                        return [
                            <Tooltip title="Save">
                                <GridActionsCellItem icon={<SaveIcon />} label="Save" onClick={handleSaveClick(id)} color="primary" />
                            </Tooltip>,
                            <Tooltip title="Cancel">
                                <GridActionsCellItem icon={<CloseIcon />} label="Cancel" onClick={handleCancelClick(id)} color="secondary" />
                            </Tooltip>
                        ];
                    }
                    return [
                        <Tooltip title="Edit Row">
                            <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={handleEditClick(id)} color="primary" />
                        </Tooltip>,
                        <Tooltip title="Delete Row">
                            <GridActionsCellItem icon={<CloseIcon />} label="Delete" onClick={handleDeleteClick(id)} color="error" />
                        </Tooltip>
                    ];
                }
            }]
            : [] // Return empty array if editPermissions is false
        ),
        ...columns,

    ];
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger file selection
        }
    };
    const handleDeleteClick = (id: number) => () => {
        setDeleteConfirmation({ open: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation.id) return;

        const {id} = deleteConfirmation;

        try {
            // // Delete the user from Supabase Auth if userId exists
            // if (tableName == "profiles") {
            //     const { error: authError } = await supabase.auth.admin.deleteUser(id);
            //     if (authError) {
            //         setAlert({ message: `Error deleting user: ${authError.message}`, severity: "error" });
            //         return;
            //     }
            // }
            // Delete the row from your table
            const { error } = await supabase.from(tableName).delete().eq("id", id);
            if (error) {
                setAlert({ message: `Error deleting row: ${error.message}`, severity: "error" });
                return;
            }

            // Update UI
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            setAlert({ message: "Row deleted successfully", severity: "success" });

        } catch (err) {
            setAlert({ message: "Unexpected error occurred", severity: "error" });
        } finally {
            setDeleteConfirmation({ open: false, id: null });
        }
    };

  const fetchAll = async () => {
    // 1. Fetch vendors and build map
    const { data: vendors, error: vendorError } = await supabase
      .from("vendors")
      .select("id, name");
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
    setVendorMap(map);

    // 2. Fetch parts data
    const { data, error } = await supabase.from(tableName).select("*");
    if (error) {
      setAlert({ message: `Error fetching ${tableName}: ${error.message}`, severity: "error" });
      setLoading(false);
      return;
    }

    // // 3. Map vendor_id to vendor names using vendorMap
    // const rowsWithVendorNames = (data || []).map(row => ({
    //   ...row,
    //   vendor_id: map[row.vendor_id] || row.vendor_id || "Unknown Vendor",
    // }));

    setRows(data);
    setLoading(false);
  };

useEffect(() => {

  fetchAll();
}, []);

    const handleAddRow = () => {
        const id = Date.now(); // Temporary ID for new row
        setRows((prev) => [...prev, { id, ...defaultRowData, isNew: true }]);
        setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
        setAlert({ message: "New row added", severity: "info" });
    };

    const processRowUpdate = async (newRow: GridRowModel) => {
        // for (const field of requiredFields) {
        //     if (!newRow[field]) {
        //         setAlert({ message: `Field "${field}" is required`, severity: "error" });
        //         return newRow; // Keep the row in edit mode
        //     }
        // }
        // Loop through columns to validate each field
        console.log(columns)
        for (const column of columns) {
            const value = newRow[column.field]; // Access the value for the specific field
            // if (value === undefined || value === "") {
            var errorMessage = null;
            console.log(column.headerName)
            if(column.validate){

                console.log("Validate" + value)
                errorMessage = column.validate(value); // Call the validate function if exists
                console.log(errorMessage)
            }
            if (errorMessage != null) {
                console.log("error")
                setAlert({ message: column.headerName + " Column: " + errorMessage, severity: "error" });
                return null; // Keep the row in edit mode if validation fails
            }
            // }
        }

        const { isNew, id, ...rowData } = newRow; // Exclude isNew
        console.log(rowData)
        if (isNew) {
            // Insert new row
            const { data, error } = await supabase.from(tableName).insert([rowData]).select().single();
            if (error) {
                setAlert({ message: `Error adding row: ${error.message}`, severity: "error" });
                return null; // Keep row in edit mode
            }
            return { ...data, isNew: false };
        } else {
            // Update existing row

            const { isNew, ...updateData } = newRow;
            console.log(updateData)
            const { error } = await supabase.from(tableName).update(updateData).eq("id", updateData.id);
            console.log(error)
            if (error) {
                setAlert({ message: `Error updating row: ${error.message}`, severity: "error" });
                return null; // Keep row in edit mode
            }
            return {...newRow}; // Return updated row
        }
    };


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

                if (!jsonData.length) {
                    setAlert({ message: "File is empty or invalid", severity: "error" });
                    return;
                }

                // Validate required fields
                for (const row of jsonData) {
                    console.log(row)
                    for (const field of requiredFields) {
                        if (!row[field]) {
                            setAlert({ message: `Missing required field: "${field}" in uploaded file`, severity: "error" });
                            return;
                        }
                    }
                }

                // Insert into Supabase
                const { error } = await supabase.from(tableName).insert(jsonData);
                if (error) {
                    setAlert({ message: `Error uploading data: ${error.message}`, severity: "error" });
                } else {
                    setAlert({ message: "File uploaded successfully", severity: "success" });
                    await fetchAll();
                }
            } catch (err) {
                setAlert({ message: "Error processing file", severity: "error" });
            }
        };
        reader.readAsArrayBuffer(file);
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, 100);
    };

    const handleCloseAlert = () => setAlert(null);

    const handleExport = () => {
        if (!apiRef.current) return;

        // Get visible row IDs
        const rowIds = gridFilteredSortedRowIdsSelector(apiRef);
        const visibleColumns = gridVisibleColumnFieldsSelector(apiRef);

        // Remove 'actions' and 'id' from exported columns
        const filteredColumns = apiRef.current.getAllColumns()
            .filter((col) => visibleColumns.includes(col.field) && col.field !== "actions" && col.field !== "id" && col.field !== "created_at");

        // Map columns to database field names
        const columnMappings = filteredColumns.reduce((acc, col) => {
            const dbField = (col as CustomGridColDef).dbField || col.field;
            acc[col.field] = dbField;
            return acc;
        }, {} as Record<string, string>);

        // Get row data and map to DB field names
        const rows = rowIds.map((id) => {
            const rowData = apiRef.current.getRow(id);
            if (!rowData) return null;

            const formattedRow: Record<string, any> = {};
            Object.entries(rowData).forEach(([key, value]) => {
                if (key !== "actions" && key !== "id" && key !== "created_at" && key !== "company_id") { // Exclude unwanted columns
                    const dbKey = columnMappings[key] || key;
                    formattedRow[dbKey] = value;
                }
            });

            return formattedRow;
        }).filter(Boolean);

        // Convert to CSV and download
        const csvContent = [
            Object.values(columnMappings).join(","), // CSV header
            ...rows.map((row) => Object.values(row).join(",")), // CSV rows
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "export.csv";
        link.click();
    };
    const handleExportXLSX = () => {
        if (!apiRef.current) return;

        const rowIds = gridFilteredSortedRowIdsSelector(apiRef);
        const visibleColumns = gridVisibleColumnFieldsSelector(apiRef);

        // Get visible columns (excluding actions)
        const columns = apiRef.current
            .getAllColumns()
            .filter(col => visibleColumns.includes(col.field) && col.field !== "actions")
            .map(col => col.field);

        // Get row data
        const rows = rowIds.map(id => {
            const rowData = apiRef.current.getRow(id);
            if (!rowData) return null;
            const formattedRow: Record<string, any> = {};
            columns.forEach(col => (formattedRow[col] = rowData[col]));
            return formattedRow;
        }).filter(Boolean);

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");

        // Save the file
        const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });
        saveAs(blob, "export.xlsx");
    };
    const CustomToolbar = () => (
        <GridToolbarContainer>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <Box>
                    <Tooltip title="Add Row">
                        <IconButton onClick={handleAddRow} color="primary">
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh Table">
                        <IconButton onClick={fetchAll} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Import Data">
                        <IconButton onClick={handleUploadClick} component="label" color="primary">
                            <UploadFileIcon />
                            <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept=".csv, .xlsx"
                            onChange={handleFileUpload}
                        />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download CSV ">
                        <IconButton onClick={handleExport} color="primary">
                            <FileDownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Export to Excel">
                        <IconButton onClick={handleExportXLSX} color="primary">
                            <ArticleIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box>
                    <GridToolbarQuickFilter debounceMs={300} />
                </Box>
            </Box>
        </GridToolbarContainer>
    );
    const handleEditClick = (id: number) => () => {
        setRows(prevRows => {
            const row = prevRows.find(row => row.id === id);
            if (row) {
                setOriginalRows(prev => ({ ...prev, [id]: { ...row } })); // Store original row
            }
            return prevRows;
        });

        setRowModesModel(prev => ({
            ...prev,
            [id]: { mode: GridRowModes.Edit },
        }));
    };

    const handleSaveClick = (id: GridRowId) => async () => {
        if (!id) {
            setAlert({ message: "Invalid row ID for saving", severity: "error" });
            return;
        }

        // Get the full row's edited values
        const updatedRow = apiRef.current.getRowWithUpdatedValues(id);
        if (!updatedRow) {
            setAlert({ message: "Failed to retrieve updated row data", severity: "error" });
            return;
        }

        // Process row update in Supabase
        const processedRow = await processRowUpdate(updatedRow);
        if (!processedRow) return;

        setRowModesModel((prev) => ({
            ...prev,
            [id]: { mode: GridRowModes.View },
        }));

        apiRef.current.setEditCellValue({ id, field: "id", value: processedRow.id }); // Ensures re-render
        apiRef.current.stopRowEditMode({ id });

        setAlert({ message: "Row saved successfully", severity: "success" });

        await fetchAll();
    };

    const handleCancelClick = (id: number) => () => {
        setRows(prevRows => {
            const updatedRows = prevRows.map(row =>
                row.id === id ? { ...originalRows[id] } : row
            );
            return [...updatedRows]; // 🔥 Force re-render
        });

        setRowModesModel(prev => ({
            ...prev,
            [id]: { mode: GridRowModes.View },
        }));

        setTimeout(() => setRows(prev => [...prev]), 0);
    };

    const handleRowEditStart = (params: any, event: any) => {
        event.defaultMuiPrevented = true;
    };

    const handleRowEditStop = (params: any, event: any) => {
        event.defaultMuiPrevented = true;
    };

    return (
        <Box sx={{ flexGrow: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", p: 2 }}>
            <DataGrid
                apiRef={apiRef}
                rows={rows}
                columns={newColumns}
                pageSizeOptions={[5, 10, 20,100]}
                autoHeight
                loading={loading}
                slots={{ toolbar: CustomToolbar }}
                editMode="row"
                // processRowUpdate={processRowUpdate}
                rowModesModel={rowModesModel}
                onRowEditStart={handleRowEditStart}
                onRowEditStop={handleRowEditStop}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                sx={{
                    width: "100%",
                    '& .MuiDataGrid-root': {
                        minHeight: "calc(100vh - 100px)", // Adjust height dynamically
                    },
                }}
                initialState={{
                    sorting: {
                      sortModel: [{ field: sortColumn, sort: sortDirection }],
                    },
                    pagination:{
                        paginationModel:{
                            pageSize: 10
                        }
                    }
                }}
            />

            <Snackbar open={Boolean(alert)} autoHideDuration={4000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                {alert ? <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>{alert.message}</Alert> : undefined}
            </Snackbar>
            <Dialog open={deleteConfirmation.open} onClose={() => setDeleteConfirmation({ open: false, id: null })}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this row? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmation({ open: false, id: null })} color="secondary">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

        </Box>

    );
};

export default DataTable;
