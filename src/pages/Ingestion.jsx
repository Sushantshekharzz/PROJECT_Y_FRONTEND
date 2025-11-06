import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Stack,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Undo as UndoIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import {
  uploadExcel,
  getAllExcels,
  updateExcel,
  deleteExcel,
} from "../api/excel";
import { AuthContext } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";

// Helper: deep copy
const deepCopy = (obj) =>
  typeof structuredClone === "function"
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));

export default function Ingestion() {
  const { user } = useContext(AuthContext);

  const [excelList, setExcelList] = useState([]);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // Upload section
  const [uploadData, setUploadData] = useState([]);
  const [uploadEdit, setUploadEdit] = useState([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadEditing, setUploadEditing] = useState(false);

  // Opened excels (multiple)
  const [openedExcels, setOpenedExcels] = useState({}); // {id: {data, headers, editData, isEditing}}

  // Fetch all Excel uploads
  useEffect(() => {
    const fetchExcels = async () => {
      try {
        const res = await getAllExcels();
        const uploads = res?.data?.uploads || res?.uploads || res || [];
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

  // ---------- UPLOAD SECTION ----------
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

      if (jsonData.length === 0) return showAlert("❌ Excel file is empty." , 500);

      // Normalize row lengths
      const headerLength = jsonData[0].length;
      const normalizedData = jsonData.map((row) => {
        const newRow = [...row];
        while (newRow.length < headerLength) newRow.push("");
        return newRow;
      });

      // Remove empty rows
      const cleanedData = normalizedData.filter((row) =>
        row.some((cell) => cell && cell.toString().trim() !== "")
      );

      setUploadData(deepCopy(cleanedData));
      setUploadEdit(deepCopy(cleanedData));
      showAlert("✅ File loaded successfully.");
    };
    reader.readAsBinaryString(file);
  };

  const handleUploadCellChange = (r, c, val) => {
    console.log("rrrr")
    const newData = uploadEdit.map((row, i) => (i === r ? [...row] : row));
    newData[r][c] = val;
    setUploadEdit(newData);
   
  };

  const handleUploadRevert = () => {
    setUploadEdit(deepCopy(uploadData));
    setUploadEditing(false);
    showAlert("↩️ Reverted to last saved upload data.");
  };

  const handleUploadConfirm = () => {
    setUploadData(deepCopy(uploadEdit));
    setUploadEditing(false);
    showAlert("✅ Changes confirmed.");
  };

  const handleUploadToDB = async () => {
    if (!user) return showAlert("❌ Please log in again.", 401);
    setLoading(true);
    try {
      const [headers, ...rows] = uploadData;
      const formatted = rows.map((row) =>
        headers.reduce((acc, h, i) => {
          acc[h] = row[i] ?? "";
          return acc;
        }, {})
      );
      const cleaned = formatted.filter((row) =>
        Object.values(row).some((v) => v && v.toString().trim() !== "")
      );

      // ✅ Include headers in request
     const res  =  await uploadExcel({ fileName: uploadFileName, data: cleaned, headers });

      showAlert(res.data.message || "✅ Upload successful!" , res.status || 200);
      const refreshed = await getAllExcels();
      const uploads = refreshed?.data?.uploads || refreshed?.uploads || [];
      setExcelList(Array.isArray(uploads) ? uploads : []);
      setShowUpload(false);
      setUploadFileName("");
      setUploadData([]);
      setUploadEdit([]);
    } catch (err) {
      console.error(err);
      showAlert(err.response.data.message || "❌ Upload failed.", err.status || 500);
    } finally {
      setLoading(false);
    }
  };

  // ---------- EXISTING EXCEL SECTION ----------
  const handleOpenExcel = (excel) => {
    const headers = excel.headers || Object.keys(excel.data[0] || {});
    const rows = excel.data.map((row) => headers.map((h) => row[h] ?? ""));
    const sheet = [headers, ...rows];

    setOpenedExcels((prev) => ({
      ...prev,
      [excel.id]: {
        fileName: excel.fileName,
        data: deepCopy(sheet),
        editData: deepCopy(sheet),
        isEditing: false,
         isChanged: false,
        headers,
      },
    }));
  };

  const handleCloseExcel = (id) => {
    setOpenedExcels((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleOpenCellChange = (id, r, c, val) => {
    setOpenedExcels((prev) => {
      const excel = deepCopy(prev[id]);
      excel.editData[r][c] = val;
      excel.isChanged = true; // ✅ mark this Excel as changed
      return { ...prev, [id]: excel };
    });
  };

  const handleOpenRevert = (id) => {
    setOpenedExcels((prev) => {
      const excel = deepCopy(prev[id]);
      excel.editData = deepCopy(excel.data);
      excel.isEditing = false;
      return { ...prev, [id]: excel };
    });
    showAlert("↩️ Reverted to last saved data.");
  };

  const handleOpenConfirm = (id) => {
    setOpenedExcels((prev) => {
      const excel = deepCopy(prev[id]);
      excel.data = deepCopy(excel.editData);
      excel.isEditing = false;
       // detect change
  
    excel.isChanged = true; // ✅ store locally
      return { ...prev, [id]: excel };
    });
    showAlert("✅ Changes confirmed.");
   
  };

const handleUpdateExistingToDB = async (id) => {
  const excel = openedExcels[id];
  if (!excel) return;
  setLoading(true);

  try {
    const [headers, ...rows] = excel.data;
    const formatted = rows.map((row) =>
      headers.reduce((acc, h, i) => {
        acc[h] = row[i] ?? "";
        return acc;
      }, {})
    );

    // ✅ Send update to backend
   const res  =  await updateExcel(id, { data: formatted, headers });

    // ✅ Re-fetch all Excels to get updated one
    const refreshed = await getAllExcels();
    const uploads = refreshed?.data?.uploads || refreshed?.uploads || [];
    setExcelList(Array.isArray(uploads) ? uploads : []);
        setOpenedExcels((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isChanged: false,
      },
    }));
            handleCloseExcel(id); // 👈 CLOSE the updated Excel automatically



    // ✅ Optionally re-open the updated file with latest data
          showAlert(res.data.message || "✅ Excel updated successfully!" , res.status || 200);


  } catch (err) {
    console.error(err);
    showAlert(err.response.data.message || "❌ Update failed.", err.status || 500);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    try {
     const res  =  await deleteExcel(id);
      setExcelList(excelList.filter((x) => x.id !== id));
                showAlert(res.data.message || "🗑️ Deleted successfully!" , res.status || 200);

    } catch (err) {
      console.error(err);
      showAlert(err.response.data.message || "❌ Error deleting.", err.status || 500);
    }
  };

  // ---------- UI ----------
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb", p: 3 }}>
      {alert && (
        <CustomAlert
          setAlert={setAlert}
          message={alertMessage}
          statusCode={statusCode}
        />
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={600}>
          Excel Data Management
        </Typography>
        {!showUpload ? (
          <Button
            startIcon={<AddCircleOutlineIcon />}
            variant="contained"
            onClick={() => setShowUpload(true)}
          >
            Add Excel
          </Button>
        ) : (
          <Button
            startIcon={<CloseIcon />}
            variant="outlined"
            color="error"
            onClick={() => {
              setShowUpload(false);
              setUploadFileName("");
              setUploadData([]);
            }}
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
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h6" mb={2}>
            Upload New Excel
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Choose File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </Button>
            {uploadFileName && (
              <Typography>
                Selected File: <b>{uploadFileName}</b>
              </Typography>
            )}
          </Stack>

          {uploadData.length > 0 && (
            <>
              <Stack direction="row" spacing={2} mb={2} justifyContent="center">
                {!uploadEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    onClick={() => setUploadEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      startIcon={<CheckCircleIcon />}
                      variant="contained"
                      color="success"
                      onClick={handleUploadConfirm}
                    >
                      Keep Changes
                    </Button>
                    <Button
                      startIcon={<UndoIcon />}
                      variant="outlined"
                      color="error"
                      onClick={handleUploadRevert}
                    >
                      Revert
                    </Button>
                  </>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={loading || uploadEditing}
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadToDB}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Upload to DB"
                  )}
                </Button>
              </Stack>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead sx={{ bgcolor: "#1976d2" }}>
                    <TableRow>
                      {uploadData[0].map((h, i) => (
                        <TableCell key={i} sx={{ fontWeight: "bold" }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(uploadEditing ? uploadEdit : uploadData)
                      .slice(1)
                      .map((r, ri) => (
                        <TableRow key={ri}>
                          {r.map((cell, ci) => (
                            <TableCell key={ci}>
                              {uploadEditing ? (
                                <TextField
                                  variant="standard"
                                  value={cell || ""}
                                  onChange={(e) =>
                                    handleUploadCellChange(
                                      ri + 1,
                                      ci,
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                cell
                              )}
                            </TableCell>
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
        <Typography color="text.secondary">
          No files uploaded yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {excelList.map((excel) => (
            <React.Fragment key={excel.id}>
              <Card
                sx={{
                  border: openedExcels[excel.id] && "2px solid #1976d2",
                  borderRadius: 2,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <DescriptionIcon color="primary" />
                    <Typography>{excel.fileName}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        openedExcels[excel.id]
                          ? handleCloseExcel(excel.id)
                          : handleOpenExcel(excel)
                      }
                    >
                      {openedExcels[excel.id] ? "Close" : "Open"}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(excel.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Inline opened Excel */}
              {openedExcels[excel.id] && (
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: 3,
                    borderRadius: 3,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    mb={2}
                  >
                    {!openedExcels[excel.id].isEditing ? (
                      <Button
                        startIcon={<EditIcon />}
                        variant="contained"
                        onClick={() =>
                          setOpenedExcels((prev) => ({
                            ...prev,
                            [excel.id]: {
                              ...prev[excel.id],
                              isEditing: true,
                            },
                          }))
                        }
                      >
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          startIcon={<CheckCircleIcon />}
                          color="success"
                          variant="contained"
                          onClick={() => handleOpenConfirm(excel.id)}
                        >
                          Keep Changes
                        </Button>
                        <Button
                          startIcon={<UndoIcon />}
                          color="error"
                          variant="outlined"
                          onClick={() => handleOpenRevert(excel.id)}
                        >
                          Revert
                        </Button>
                      </>
                    )}
                    <Button
                      startIcon={<CloudUploadIcon />}
                      variant="contained"
                      color="secondary"
                      disabled={loading || openedExcels[excel.id].isEditing ||!openedExcels[excel.id].isChanged}
                      onClick={() => handleUpdateExistingToDB(excel.id)}
                    >
                      {loading ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        "Update DB"
                      )}
                    </Button>
                  </Stack>

                  <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead sx={{ bgcolor: "#1976d2" }}>
                        <TableRow>
                          {openedExcels[excel.id].data[0].map((h, i) => (
                            <TableCell key={i} sx={{ fontWeight: "bold" }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(openedExcels[excel.id].isEditing
                          ? openedExcels[excel.id].editData
                          : openedExcels[excel.id].data
                        )
                          .slice(1)
                          .map((r, ri) => (
                            <TableRow key={ri}>
                              {r.map((cell, ci) => (
                                <TableCell key={ci}>
                                  {openedExcels[excel.id].isEditing ? (
                                    <TextField
                                      variant="standard"
                                      value={cell || ""}
                                      onChange={(e) =>
                                        handleOpenCellChange(
                                          excel.id,
                                          ri + 1,
                                          ci,
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    cell
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </React.Fragment>
          ))}
        </Stack>
      )}
    </Box>
  );
}
