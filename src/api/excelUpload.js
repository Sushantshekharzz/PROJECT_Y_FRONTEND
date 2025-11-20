import api from "./axios";

export const uploadExcel = (data) => api.post("/excel-upload/upload-excel", data);
export const getAllExcels = () => api.get("/excel-upload/all");
export const updateExcel = (id, data) => api.put(`/excel-upload/update/${id}`, data);
export const deleteExcel = (id) => api.delete(`/excel-upload/delete/${id}`);

