import api from "./axios";

export const cleanExcel = (data) => api.post("/excel-clean/clean-excel", data);
export const getCleanExcel = (data) => api.get("/excel-clean/get-clean-excel");
export const deleteCleanedExcel = (id) => api.delete(`/excel-clean/delete/${id}`);

