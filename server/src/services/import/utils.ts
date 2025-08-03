import fs from "fs";
import { r2Storage } from "../storage/r2StorageService.js";

export const deleteImportFile = async (storageLocation: string, isR2Storage: boolean) => {
  try {
    if (isR2Storage) {
      await r2Storage.deleteImportFile(storageLocation);
      console.log(`Deleted R2 import file: ${storageLocation}`);
    } else {
      await fs.promises.unlink(storageLocation);
      console.log(`Deleted local import file: ${storageLocation}`);
    }
  } catch (error) {
    console.error(`Failed to delete import file ${storageLocation}:`, error);
    throw error;
  }
}
