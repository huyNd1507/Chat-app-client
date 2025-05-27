import axios from "axios";

interface UploadResponse {
  success: boolean;
  files: {
    fileId: string;
    fileName: string;
    webViewLink: string;
    webContentLink: string;
  }[];
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("files", file);

  const response = await axios.post<UploadResponse>(
    "http://localhost:8000/api/upload/file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
