export const importInitiationQueue = "import-initiation";

export const processImportChunkQueue = "process-import-chunk";

export interface ImportJob {
  tempFilePath: string;
  site: string;
  importId: string;
  source: "umami";
}

export interface ImportMapping {
  transform(row: any, headers: string[]): any;
}
