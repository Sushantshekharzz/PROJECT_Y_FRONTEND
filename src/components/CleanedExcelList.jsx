import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { getCleanExcel, deleteCleanedExcel } from "../api/excelClean";
import { saveAs } from "file-saver";
import CustomAlert from "../components/CustomAlert";

export default function CleanedExcelList({ refresh }) {
  const [cleanedList, setCleanedList] = useState([]);
  const [openedCleaned, setOpenedCleaned] = useState({});
  const [filters, setFilters] = useState({});
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState(null);

  const showAlert = (msg, code = 200) => {
    setAlertMessage(msg);
    setStatusCode(code);
    setAlert(true);
  };

  useEffect(() => {
    fetchCleanedExcels();
  }, [refresh]);

  const fetchCleanedExcels = async () => {
    try {
      const res = await getCleanExcel();
      const uploads = res?.data?.uploads || [];

      // Table display data
      const cleanedList = uploads.map((e) => ({
        id: e.id,
        fileName: e.fileName,
        cleanedData: e.cleanedData,
        cleanedHeaders: e.cleanedHeaders,
      }));

      // Filters info for tooltip
      const filtersMap = {};
      uploads.forEach((e) => {
        filtersMap[e.id] = {
          columnActions: e.columnActions || {},
          nullOptions: e.nullOptions || {},
        };
      });

      setCleanedList(cleanedList);
      setFilters(filtersMap);
    } catch (err) {
      console.error(err);
      showAlert("Failed to fetch cleaned excels", 500);
    }
  };

  const handleOpenCleaned = (excel) => {
    setOpenedCleaned((prev) => ({ ...prev, [excel.id]: !prev[excel.id] }));
  };

  const handleDeleteCleaned = async (id) => {
    try {
      const res = await deleteCleanedExcel(id);
      fetchCleanedExcels(); // Refresh after delete
      showAlert(res.data.message || "🗑️ Deleted successfully!", res.status || 200);
    } catch (err) {
      console.error(err);
      showAlert(
        err.response?.data?.message || "❌ Error deleting.",
        err.status || 500
      );
    }
  };

  const handleExportCleaned = (excel) => {
    const csvContent = [
      excel.cleanedHeaders.join(","),
      ...excel.cleanedData.map((row) =>
        excel.cleanedHeaders.map((h) => row[h]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, excel.fileName);
  };

  return (
    <Box sx={{ mt: 5 }}>
      {alert && (
        <CustomAlert
          setAlert={setAlert}
          message={alertMessage}
          statusCode={statusCode}
        />
      )}

      <Typography variant="h4" fontWeight={600} mb={3}>
        Cleaned Excels
      </Typography>

      <Stack spacing={2}>
        {cleanedList.map((excel) => {
          const isOpen = openedCleaned[excel.id];
          const excelFilters = filters[excel.id] || {};

          return (
            <Card
              key={excel.id}
              sx={{ border: isOpen ? "2px solid #4caf50" : "none", borderRadius: 2 }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <DescriptionIcon color="success" />
                  <Typography>{excel.fileName}</Typography>

                  {/* Info Icon for applied filters */}
                  {Object.keys(excelFilters.columnActions).length > 0 && (
                    <Tooltip
                      arrow
                      placement="top"
                      title={
                        <Box>
                          {Object.entries(excelFilters.columnActions).map(
                            ([col, actions]) => (
                              <Typography key={col} variant="body2">
                                <b>{col}</b>: {actions.join(", ")}
                                {excelFilters.nullOptions[col]?.mode === "replace" &&
                                  ` → replace with "${excelFilters.nullOptions[col].value}"`}
                                {excelFilters.nullOptions[col]?.mode === "removeRow" &&
                                  " → remove row"}
                              </Typography>
                            )
                          )}
                        </Box>
                      }
                    >
                      <InfoOutlinedIcon
                        color="action"
                        sx={{ fontSize: 18, cursor: "pointer" }}
                      />
                    </Tooltip>
                  )}
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenCleaned(excel)}
                  >
                    {isOpen ? "Close" : "View"}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleExportCleaned(excel)}
                  >
                    Export
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCleaned(excel.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>

              {isOpen && (
                <Box sx={{ p: 2 }}>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {excel.cleanedHeaders.map((h, i) => (
                            <TableCell key={i}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {excel.cleanedData.map((row, ri) => (
                          <TableRow key={ri}>
                            {excel.cleanedHeaders.map((h, ci) => (
                              <TableCell key={ci}>{row[h]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
