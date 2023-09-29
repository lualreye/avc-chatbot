const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");

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
  getRequest = async (numberRequest, email) => {
    try {
      const list = [];
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0]; // the first sheet
      await sheet.loadCells("A1:H10");
      const rows = await sheet.getRows();
      for (const a of Array.from(Array(rows.length).keys())) {
        const cellA1 = sheet.getCell(a + 1, dayNumber - 1);
        list.push(cellA1.value);
      }

      return list;
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
    });
    return order

  };
}

module.exports = GoogleSheetService ;