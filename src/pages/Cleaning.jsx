import React, { useState, useEffect, useContext } from "react";
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
  CircularProgress,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Grid,
} from "@mui/material";
import { Description as DescriptionIcon } from "@mui/icons-material";
import { getAllExcels } from "../api/excelUpload";
import { AuthContext } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";
import { cleanExcel } from "../api/excelClean";
import CleanedExcelList from "../components/CleanedExcelList";

// Deep copy helper
const deepCopy = (obj) =>
  typeof structuredClone === "function"
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));

// Parse date in MM-DD-YYYY format
const parseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;

  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(val);
  if (match) {
    const [_, mm, dd, yyyy] = match.map(Number);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    return new Date(yyyy, mm - 1, dd);
  }

  return null; // treat all other formats as string
};

// Detect column type (string, number, date)
const isDateValue = (val) => {
  if (!val) return false;
  const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-(\d{4})$/;
  return regex.test(val);
};

const detectColumnType = (values) => {
  let numberCount = 0;
  let dateCount = 0;
  let stringCount = 0;

  for (let val of values) {
    if (!val) continue;
    if (!isNaN(Number(val))) numberCount++;
    else if (isDateValue(val)) dateCount++;
    else stringCount++;
  }

  if (dateCount > numberCount && dateCount > stringCount) return "date";
  if (numberCount > dateCount && numberCount > stringCount) return "number";
  return "string";
};

// Allowed actions by type
const allowedActionsMap = {
  string: ["removeNull", "trim", "lowercase", "uppercase", "removeDuplicates", "removeGarbage"],
  number: ["removeNull", "removeDuplicates", "removeGarbage"],
  date: ["removeNull", "removeDuplicates", "removeGarbage"],
};

const cleaningOptions = [
  { value: "removeNull", label: "Remove Null Values" },
  { value: "trim", label: "Trim Spaces" },
  { value: "lowercase", label: "Convert to Lowercase" },
  { value: "uppercase", label: "Convert to Uppercase" },
  { value: "removeDuplicates", label: "Remove Duplicates" },
  { value: "removeGarbage", label: "Remove Garbage Value" },
];

export default function MultiExcelCleaning() {
  const { user } = useContext(AuthContext);
  const [excelList, setExcelList] = useState([]);
  const [openedExcels, setOpenedExcels] = useState({});
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState(null);
  const [loadingExcels, setLoadingExcels] = useState({});
  const [nullOptions, setNullOptions] = useState({});
    const [refresh,setRefresh] = useState(false);



  const showAlert = (msg, code = 200) => {
    setAlertMessage(msg);
    setStatusCode(code);
    setAlert(true);
  };

  

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllExcels();
        setExcelList(res?.data?.uploads || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleOpenExcel = (excel) => {
    const headers = excel.headers || Object.keys(excel.data[0] || {});
    const columnTypes = {};
    headers.forEach((h) => {
      const colValues = excel.data.map((row) => row[h]);
      columnTypes[h] = detectColumnType(colValues);
    });

    const rows = excel.data.map((row) =>
      headers.map((h) =>
        columnTypes[h] === "date" ? parseDate(row[h]) : row[h] ?? ""
      )
    );

    setOpenedExcels((prev) => ({
      ...prev,
      [excel.id]: {
        ...prev[excel.id],
        fileName: excel.fileName,
        data: prev[excel.id]?.data || deepCopy([headers, ...rows]),
        editData: prev[excel.id]?.editData || deepCopy([headers, ...rows]),
        headers,
        columnActions: prev[excel.id]?.columnActions || {},
        columnTypes,
        isEditing: false,
        isChanged: false,
        isOpen: true,
      },
    }));

    setNullOptions((prev) => ({ ...prev, [excel.id]: prev[excel.id] || {} }));
  };

  const handleCloseExcel = (id) => {
    setOpenedExcels((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, columnActions: {} },
    }));
    setNullOptions((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleActionChange = (id, col, actions) => {
    setOpenedExcels((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        columnActions: { ...prev[id].columnActions, [col]: actions },
        isChanged: true,
      },
    }));

    setNullOptions((prev) => {
      const excelNulls = { ...(prev[id] || {}) };
      if (actions.includes("removeNull")) {
        if (!excelNulls[col]) excelNulls[col] = { mode: "removeRow", value: "" };
      } else delete excelNulls[col];

      return { ...prev, [id]: excelNulls };
    });
  };

const handleStartCleaning = async (id) => {
  const excel = openedExcels[id];
  if (!user) return showAlert("Login again.", 401);

  const selectedColumns = Object.keys(excel.columnActions).filter(
    (c) => excel.columnActions[c]?.length
  );

  if (selectedColumns.length === 0)
    return showAlert("Select at least one column.", 400);

  setLoadingExcels((p) => ({ ...p, [id]: true }));

  try {
    // Trigger cleaning on server, but do NOT use the response
    await cleanExcel({
      excelId: id,
      columnActions: excel.columnActions,
      columnTypes: excel.columnTypes,
      nullOptions: nullOptions[id] || {},
    });

    // Keep local data unchanged
    setOpenedExcels((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        columnActions: {}, // reset selected actions
        isChanged: false,
      },
    }));

    setNullOptions((prev) => ({ ...prev, [id]: {} }));

    showAlert("Cleaning triggered on server!", 200);
    setRefresh((prev)=>!prev)
    
  } catch (err) {
    console.error(err);
    showAlert("Cleaning failed.", 500);
  } finally {
    setLoadingExcels((p) => ({ ...p, [id]: false }));
  }
};


  const handleRevert = (id) => {
    setOpenedExcels((prev) => {
      const excel = deepCopy(prev[id]);
      excel.editData = deepCopy(excel.data);
      excel.columnActions = {};
      excel.isChanged = false;
      return { ...prev, [id]: excel };
    });
    setNullOptions((prev) => ({ ...prev, [id]: {} }));
    showAlert("Reverted.");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb", p: { xs: 2, md: 3 } }}>
      {alert && (
        <CustomAlert
          setAlert={setAlert}
          message={alertMessage}
          statusCode={statusCode}
        />
      )}

      <Typography variant="h4" fontWeight={600} mb={3}>
        Multi Excel Cleaning
      </Typography>

      <Stack spacing={2}>
        {excelList.map((excel) => {
          const opened = openedExcels[excel.id];
          const isOpen = opened?.isOpen;
          const excelNullOptions = nullOptions[excel.id] || {};

          return (
            <React.Fragment key={excel.id}>
              <Card
                sx={{
                  border: isOpen ? "2px solid #1976d2" : "none",
                  borderRadius: 2,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DescriptionIcon color="primary" />
                    <Typography>{excel.fileName}</Typography>
                  </Stack>

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                    onClick={() =>
                      isOpen ? handleCloseExcel(excel.id) : handleOpenExcel(excel)
                    }
                  >
                    {isOpen ? "Close" : "Open"}
                  </Button>
                </CardContent>
              </Card>

              {isOpen && opened && (
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Table */}
                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: 400, overflowX: "auto", borderRadius: 2 }}
                  >
                    <Table stickyHeader size="small">
                      <TableHead sx={{ bgcolor: "#1976d2" }}>
                        <TableRow>
                          {opened.headers.map((h, i) => (
                            <TableCell key={i} sx={{ fontWeight: "bold" }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {opened.editData.slice(1).map((row, ri) => (
                          <TableRow key={ri}>
                            {row.map((cell, ci) => (
                              <TableCell key={ci}>
                                {opened.columnTypes[opened.headers[ci]] === "date"
                                  ? cell instanceof Date
                                    ? cell.toLocaleDateString()
                                    : cell
                                  : cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Cleaning Actions */}
                  <Typography variant="subtitle1" mt={3} mb={1}>
                    Cleaning Actions
                  </Typography>

                  <Stack spacing={2}>
                    {opened.headers.map((col) => (
                      <Box
                        key={col}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          bgcolor: "#fafafa",
                        }}
                      >
                        <Typography fontWeight={600} mb={1}>
                          {col} ({opened.columnTypes[col]})
                        </Typography>

                        <Grid container spacing={2}>
                          {cleaningOptions
                            .filter((opt) =>
                              allowedActionsMap[opened.columnTypes[col]].includes(opt.value)
                            )
                            .map((opt) => (
                              <Grid item xs={12} sm={6} md={4} key={opt.value}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <Checkbox
                                    checked={(opened.columnActions[col] || []).includes(
                                      opt.value
                                    )}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      let current = opened.columnActions[col] || [];
                                      if (
                                        checked &&
                                        (opt.value === "lowercase" ||
                                          opt.value === "uppercase")
                                      ) {
                                        current = current.filter(
                                          (v) => v !== "lowercase" && v !== "uppercase"
                                        );
                                      }
                                      const newActions = checked
                                        ? [...current, opt.value]
                                        : current.filter((v) => v !== opt.value);
                                      handleActionChange(excel.id, col, newActions);
                                    }}
                                  />
                                  <Typography>{opt.label}</Typography>
                                </Box>
                              </Grid>
                            ))}
                        </Grid>

                        {/* Null handling */}
                        {(opened.columnActions[col] || []).includes("removeNull") && (
<Box
  sx={{
    mt: 2,
    p: { xs: 1, md: 2 },
    border: "1px dashed #ccc",
    borderRadius: 2,
  }}
>
  <Typography fontWeight={500} mb={1}>
    Handle NULL values
  </Typography>

  <Stack spacing={1}>
    {/* Remove entire row */}
    <Stack direction="row" alignItems="center" spacing={1}>
      <Radio
        checked={excelNullOptions[col]?.mode === "removeRow"}
        onChange={() =>
          setNullOptions((prev) => ({
            ...prev,
            [excel.id]: {
              ...(prev[excel.id] || {}),
              [col]: { mode: "removeRow", value: "" },
            },
          }))
        }
        size="small"
      />
      <Typography>Remove entire row</Typography>
    </Stack>

    {/* Replace NULL with */}
    <Stack direction="row" alignItems="flex-start" spacing={1} flexWrap="wrap">
      <Radio
        checked={excelNullOptions[col]?.mode === "replace"}
        onChange={() =>
          setNullOptions((prev) => ({
            ...prev,
            [excel.id]: {
              ...(prev[excel.id] || {}),
              [col]: { mode: "replace", value: excelNullOptions[col]?.value || "" },
            },
          }))
        }
        size="small"
      />
      <Typography sx={{ mt: 0.5 }}>Replace NULL with:</Typography>
      <input
        type="text"
        value={excelNullOptions[col]?.value || ""}
        onChange={(e) =>
          setNullOptions((prev) => ({
            ...prev,
            [excel.id]: {
              ...(prev[excel.id] || {}),
              [col]: { mode: "replace", value: e.target.value },
            },
          }))
        }
        style={{
          padding: 6,
          borderRadius: 4,
          border: "1px solid #ccc",
          width: "100%",
          maxWidth: 200,
          boxSizing: "border-box",
        }}
      />
    </Stack>
  </Stack>
</Box>


                        )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Action Buttons */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    mt={3}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleStartCleaning(excel.id)}
                      disabled={loadingExcels[excel.id]}
                      fullWidth={{ xs: true, sm: false }}
                    >
                      {loadingExcels[excel.id] ? <CircularProgress size={22} /> : "Start Cleaning"}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRevert(excel.id)}
                      fullWidth={{ xs: true, sm: false }}
                    >
                      Revert
                    </Button>
                  </Stack>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Stack>
      <CleanedExcelList refresh={refresh} />
    </Box>
  );
}
