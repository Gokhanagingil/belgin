const BACKUP_FORMAT = "kus-koyu-backup";
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 250_000;

export function createBackup(save, settings, exportedAt = new Date()) {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    save: structuredClone(save),
    settings: structuredClone(settings)
  };
}

export function stringifyBackup(save, settings, exportedAt = new Date()) {
  return JSON.stringify(createBackup(save, settings, exportedAt), null, 2);
}

export function parseBackup(source, maxLevel) {
  if (typeof source !== "string" || source.length > MAX_BACKUP_BYTES) {
    throw new Error("Kayıt dosyası okunamayacak kadar büyük.");
  }
  let value;
  try {
    value = JSON.parse(source);
  } catch {
    throw new Error("Bu dosya geçerli bir Kuş Köyü kaydı değil.");
  }
  if (value?.format !== BACKUP_FORMAT || value?.version !== BACKUP_VERSION) {
    throw new Error("Bu kayıt dosyasının biçimi desteklenmiyor.");
  }
  if (!value.save || typeof value.save !== "object" || !value.settings || typeof value.settings !== "object") {
    throw new Error("Kayıt dosyasında ilerleme bilgisi bulunamadı.");
  }
  if (!Number.isInteger(value.save.level) || value.save.level < 1 || value.save.level > maxLevel) {
    throw new Error("Kayıt dosyasındaki bölüm bilgisi geçersiz.");
  }
  for (const field of ["completed", "skipped", "discovered", "dailyCompleted"]) {
    if (value.save[field] !== undefined && !Array.isArray(value.save[field])) {
      throw new Error("Kayıt dosyasındaki ilerleme bilgisi bozuk.");
    }
  }
  return value;
}

export function backupFilename(date = new Date()) {
  return `kus-koyu-kayit-${date.toISOString().slice(0, 10)}.json`;
}
