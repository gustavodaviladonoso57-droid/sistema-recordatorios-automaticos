/******************* CONFIG *******************/
const SHEET_NAME = null;             // null = hoja activa; o pon "Recordatorio"
const TIMEZONE   = "America/Bogota";
/**********************************************/

function enviarRecordatoriosDesdeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getActiveSheet();
  if (!sh) throw new Error("No se encontró la hoja de cálculo.");

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 7) return;

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  const rows    = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const idx = (name) => {
    const i = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    if (i === -1) throw new Error(`Falta la columna "${name}" en la fila 1.`);
    return i;
  };
  const iDest = idx("Direccion destino");
  const iTit  = idx("Titulo");
  const iBody = idx("Cuerpo");
  const iDia  = idx("Dia del mes");
  const iHora = idx("Hora");
  const iMin  = idx("Minuto");
  const iAct  = idx("Activo");

  const now       = new Date();
  const diaHoy    = Number(Utilities.formatDate(now, TIMEZONE, "d"));
  const horaHoy   = Number(Utilities.formatDate(now, TIMEZONE, "H"));
  const minutoHoy = Number(Utilities.formatDate(now, TIMEZONE, "m"));

  rows.forEach((r, ix0) => {
    try {
      const activo = r[iAct] === true || String(r[iAct]).toUpperCase() === "TRUE";
      if (!activo) return;

      const dia = Number(r[iDia]);
      const hora = Number(r[iHora]);
      const minuto = Number(r[iMin]);
      if (!Number.isFinite(dia) || !Number.isFinite(hora) || !Number.isFinite(minuto)) return;

      if (diaHoy !== dia || horaHoy !== hora || minutoHoy !== minuto) return;

      const recipients = String(r[iDest] || "")
        .split(/[;,]/).map(x => x.trim()).filter(Boolean);
      if (recipients.length === 0) throw new Error("No hay destinatarios.");

      // Asunto SIN emojis: solo mayúsculas
      let subject = String(r[iTit] || "").trim().toUpperCase();
      if (!subject) throw new Error("Falta el Titulo.");

      const bodyText = String(r[iBody] || "").replace(/\r\n/g, "\n").trim();
      if (!bodyText) throw new Error("Falta el Cuerpo.");

      GmailApp.sendEmail(recipients.join(","), subject, bodyText, { name: "Recordatorio automático" });
      console.log(`✔️ Enviado a: ${recipients.join(", ")} | Asunto: ${subject}`);
    } catch (err) {
      console.warn(`⚠️ Error en fila ${ix0 + 2}: ${err}`);
    }
  });
}

function crearDisparadorCadaMinuto() {
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (tr.getHandlerFunction() === "enviarRecordatoriosDesdeSheet") {
      ScriptApp.deleteTrigger(tr);
    }
  });

  ScriptApp.newTrigger("enviarRecordatoriosDesdeSheet")
    .timeBased()
    .everyMinutes(1)
    .inTimezone(TIMEZONE)
    .create();

  Logger.log("⏱️ Disparador creado: cada 1 minuto.");
}

function pruebaEnvioPrimeraFilaActiva() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getActiveSheet();
  if (!sh) throw new Error("No se encontró la hoja de cálculo.");

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 7) throw new Error("No hay datos.");

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  const rows = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const iAct  = headers.findIndex(h => h.toLowerCase() === "activo");
  const iDest = headers.findIndex(h => h.toLowerCase() === "direccion destino");
  const iTit  = headers.findIndex(h => h.toLowerCase() === "titulo");
  const iBody = headers.findIndex(h => h.toLowerCase() === "cuerpo");

  const row = rows.find(r => r[iAct] === true || String(r[iAct]).toUpperCase() === "TRUE");
  if (!row) throw new Error("No hay filas activas.");

  const subject = String(row[iTit] || "").trim().toUpperCase();
  const recipients = String(row[iDest] || "").split(/[;,]/).map(x => x.trim()).filter(Boolean);
  const bodyText = String(row[iBody] || "").replace(/\r\n/g, "\n").trim();

  GmailApp.sendEmail(recipients.join(","), subject, bodyText, { name: "Recordatorio automático (PRUEBA)" });
  Logger.log(`Prueba enviada a: ${recipients.join(", ")} | Asunto: ${subject}`);
}
