import moment from 'moment';
import { INewPV } from 'interfaces/Irequests';
import { IFactura } from 'interfaces/Itables';

const QR_URL = 'https://www.arca.gob.ar/fe/qr/';

const toNumber = (value: unknown) => {
  return Number(value || 0);
};

const toDecimal = (value: unknown, decimals: number) => {
  return Number(toNumber(value).toFixed(decimals));
};

export const buildFiscalQrUrl = (
  newFact: IFactura,
  pvData: INewPV,
  dataFiscal: any,
) => {
  const tipoDocRec = toNumber(newFact.tipo_doc_cliente);
  const nroDocRec = toNumber(newFact.n_doc_cliente);
  const receptorData: Record<string, number> = {};

  if (tipoDocRec > 0 && nroDocRec > 0) {
    receptorData.tipoDocRec = tipoDocRec;
    receptorData.nroDocRec = nroDocRec;
  }

  const factData: Record<string, string | number> = {
    ver: 1,
    fecha: moment(newFact.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'),
    cuit: toNumber(pvData.cuit),
    ptoVta: toNumber(pvData.pv),
    tipoCmp: toNumber(newFact.t_fact),
    nroCmp: toNumber(dataFiscal.CbteDesde || newFact.cbte),
    importe: toDecimal(newFact.total_fact, 2),
    moneda: 'PES',
    ctz: 1,
    ...receptorData,
    tipoCodAut: 'E',
    codAut: toNumber(dataFiscal.CAE || newFact.cae),
  };

  const encoded = Buffer.from(JSON.stringify(factData), 'utf8').toString(
    'base64',
  );

  return `${QR_URL}?p=${encoded}`;
};
