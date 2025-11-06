import api from "./axios";

export const uploadExcel = (data) => api.post("/excel/upload-excel", data);
export const getAllExcels = () => api.get("/excel/all");
export const updateExcel = (id, data) => api.put(`/excel/update/${id}`, data);
export const deleteExcel = (id) => api.delete(`/excel/delete/${id}`);
