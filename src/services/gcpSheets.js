const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { calculateDaysUntilDate } = require("../utils/calculateUntilDate");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

class GoogleSheetService {
  jwtFromEnv = undefined;
  doc = undefined;

  constructor(id = undefined) {
    if (!id) {
      throw new Error("ID_UNDEFINED");
    }

    this.jwtFromEnv = new JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });
    this.doc = new GoogleSpreadsheet(id, this.jwtFromEnv);
  }

  /**
   * Recuperar el menu del dia
   * @param {*} dayNumber
   * @returns
   */
  getRequest = async (codeRequest) => {
    try {
      const list = [];
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0];
      const rows = await sheet.getRows();

      const rowDataArray = rows
        .filter((row) => row.get('codigo') === codeRequest)
        .map((row) => ({
          code: row.get('codigo'),
          user: row.get('usuario'),
          timeLeft: calculateDaysUntilDate(row.get('fecha_de_baja')),
          status: row.get('status')
        }));

      const rowData = rowDataArray.length > 0 ? rowDataArray[0] : null;

      return rowData;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  /**
   * Guardar pedido
   * @param {*} data
   */
  saveRequest = async (data = {}) => {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[0]; // the first sheet

    const order = await sheet.addRow({
      codigo: data.code,
      usuario: data.user,
      motivo: data.reason,
      fecha_solicitud: data.requestDate,
      fecha_de_baja: data.unsubscribeDate,
      status: data.status
    });
    return order

  };
}

module.exports = GoogleSheetService ;