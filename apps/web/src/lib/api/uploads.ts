import type { UploadImageResponse } from "@basebook/contracts";

import { fetchJson } from "./http";

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchJson<UploadImageResponse>("/uploads/image", {
    init: {
      method: "POST",
      body: formData,
    },
  });
}
