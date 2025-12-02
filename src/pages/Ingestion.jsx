import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { UploadFile as UploadFileIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { uploadExcel, getAllExcels, deleteExcel } from "../api/excelUpload";
import { AuthContext } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";

const deepCopy = (obj) =>
  typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

const excelDateToJSDate = (excelDate) => {
  if (excelDate == null || excelDate === "" || isNaN(excelDate)) return excelDate;
  const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function Ingestion() {
  const { user } = useContext(AuthContext);
  const [excelList, setExcelList] = useState([]);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const fetchExcels = async () => {
      try {
        const res = await getAllExcels();
        const uploads = res?.data?.uploads || res?.uploads || [];
        setExcelList(Array.isArray(uploads) ? uploads : []);
      } catch (err) {
        console.error(err);
        setExcelList([]);
      }
    };
    fetchExcels();
  }, []);

  const showAlert = (msg, code = 200) => {
    setAlertMessage(msg);
    setStatusCode(code);
    setAlert(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const binary = evt.target.result;
      const workbook = XLSX.read(binary, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length === 0) return showAlert("❌ Excel file is empty.", 500);

      const headerLength = jsonData[0].length;
      const normalizedData = jsonData.map((row) => {
        const newRow = [...row];
        while (newRow.length < headerLength) newRow.push("");
        return newRow;
      });

      const cleanedData = normalizedData.filter((row) =>
        row.some((cell) => cell && cell.toString().trim() !== "")
      );

      const convertedData = cleanedData.map((row) =>
        row.map((cell) => {
          if (!isNaN(cell) && cell > 40000) return excelDateToJSDate(cell);
          return cell;
        })
      );

      setUploadData(deepCopy(convertedData));
      showAlert("✅ File loaded successfully.");
    };
    reader.readAsBinaryString(file);
  };

  const handleUploadToDB = async () => {
    if (!user) return showAlert("❌ Please log in again.", 401);
    setLoading(true);
    try {
      const [headers, ...rows] = uploadData;
      const formatted = rows.map((row) =>
        headers.reduce((acc, h, i) => {
          let val = row[i] ?? "";
          if (!isNaN(val) && val > 40000) val = excelDateToJSDate(val);
          acc[h] = val;
          return acc;
        }, {})
      );

      const cleaned = formatted.filter((row) =>
        Object.values(row).some((v) => v && v.toString().trim() !== "")
      );

      const res = await uploadExcel({ fileName: uploadFileName, data: cleaned, headers });

      showAlert(res.data.message || "✅ Upload successful!", res.status || 200);

      const refreshed = await getAllExcels();
      const uploads = refreshed?.data?.uploads || refreshed?.uploads || [];
      setExcelList(Array.isArray(uploads) ? uploads : []);

      setShowUpload(false);
      setUploadFileName("");
      setUploadData([]);
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || "❌ Upload failed.", err.status || 500);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteExcel(id);
      setExcelList(excelList.filter((x) => x.id !== id));
      showAlert(res.data.message || "🗑️ Deleted successfully!", res.status || 200);
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || "❌ Error deleting.", err.status || 500);
    }
  };

  // Preview limited rows & columns
  const previewData = uploadData.slice(0, 5).map((row) => row.slice(0, 20));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb", p: { xs: 1, sm: 3 } }}>
      {alert && <CustomAlert setAlert={setAlert} message={alertMessage} statusCode={statusCode} />}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
        spacing={1}
      >
        <Typography variant="h4" fontWeight={600}>
          Excel Data Management
        </Typography>
        {!showUpload ? (
          <Button
            startIcon={<UploadFileIcon />}
            variant="contained"
            onClick={() => setShowUpload(true)}
            fullWidth={{ xs: true, sm: false }}
          >
            Add Excel
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setShowUpload(false);
              setUploadFileName("");
              setUploadData([]);
            }}
            fullWidth={{ xs: true, sm: false }}
          >
            Cancel
          </Button>
        )}
      </Stack>

      {/* Upload Section */}
      {showUpload && (
        <Box
          sx={{
            bgcolor: "#fff",
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h6" mb={2}>
            Upload New Excel
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mb={2}>
            <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
              Choose File
              <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
            </Button>
            {uploadFileName && (
              <Typography sx={{ wordBreak: "break-word" }}>
                Selected File: <b>{uploadFileName}</b>
              </Typography>
            )}
          </Stack>

          {uploadData.length > 0 && (
            <>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadToDB}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Upload to DB"}
              </Button>

              {/* Preview Table */}
              <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead sx={{ bgcolor: "#1976d2" }}>
                    <TableRow>
                      {previewData[0]?.map((h, i) => (
                        <TableCell key={i} sx={{ fontWeight: "bold" }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.slice(1).map((row, ri) => (
                      <TableRow key={ri}>
                        {row.map((cell, ci) => (
                          <TableCell key={ci}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Uploaded Files Section */}
      <Typography variant="h6" mb={2}>
        Uploaded Files
      </Typography>
      {excelList.length === 0 ? (
        <Typography color="text.secondary">No files uploaded yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {excelList.map((excel) => (
            <Paper key={excel.id} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>{excel.fileName}</Typography>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => handleDelete(excel.id)}
                >
                  Delete
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
