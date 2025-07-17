export class ImportValidator {
  static validateDataIntegrity(row: any, rowIndex: number): void {
    if (!row.created_at || !row.session_id) {
      throw new ImportError(
        `Required fields missing at row ${rowIndex}`,
        "",
        false
      );
    }

    // Validate timestamp format
    const timestamp = new Date(row.created_at);
    if (isNaN(timestamp.getTime())) {
      throw new ImportError(
        `Invalid timestamp format at row ${rowIndex}: ${row.created_at}`,
        "",
        false
      );
    }

    // Validate timestamp is not in the future
    if (timestamp > new Date()) {
      throw new ImportError(
        `Future timestamp at row ${rowIndex}: ${row.created_at}`,
        "",
        false
      );
    }
  }
}
