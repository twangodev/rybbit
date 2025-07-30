import { r2Storage } from "../storage/r2StorageService.js";
import fs from "fs";

export const deleteImportFile = async (storageLocation: string, isR2Storage: boolean) => {
  if (isR2Storage) {
    await r2Storage.deleteImportFile(storageLocation);
    console.log(`Deleted R2 import file: ${storageLocation}`);
  } else {
    await fs.promises.unlink(storageLocation);
    console.log(`Deleted local import file: ${storageLocation}`);
  }
}
