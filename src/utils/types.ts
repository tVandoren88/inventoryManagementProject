import { GridColDef } from "@mui/x-data-grid";

// Custom type extending GridColDef
export type CustomGridColDef = GridColDef & { dbField?: string, validate?: (value: string) => string | null};
