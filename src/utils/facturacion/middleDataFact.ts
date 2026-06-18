import { IFormasPago } from './../../interfaces/Itables';
import { NextFunction, Request, Response } from 'express';
import { INewPV } from 'interfaces/Irequests';
import { IDetFactura, IFactura } from 'interfaces/Itables';
import errorSend from '../error';
import ControllerInvoices from '../../api/components/invoices';
import ControllerPtoVta from '../../api/components/ptosVta';
import moment from 'moment';

const isFiscalData = (
  data: unknown,
): data is
  | FactInscriptoProd
  | FactInscriptoServ
  | FactMonotribProd
  | FactMonotribServ => {
  return Boolean(data && typeof data === 'object' && 'FchVto' in data);
};

const hasStoredFiscalData = (factura: IFactura) => {
  return Boolean(
    factura.cae && factura.vto_cae && factura.cbte && factura.t_fact,
  );
};

const buildStoredFiscalData = (factura: IFactura) => {
  return {
    CbteDesde: factura.cbte,
    CbteHasta: factura.cbte,
    CbteTipo: factura.t_fact,
    CAE: factura.cae,
    CAEFchVto: moment(factura.vto_cae).format('YYYY-MM-DD'),
    FchVto: moment(factura.vto_cae).format('YYYYMMDD'),
  };
};

const dataFactMiddle = () => {
  const middleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const idFact = Number(req.params.id);
      const dataFact: Array<IFactura> = await ControllerInvoices.get(idFact);
      const detFact: Array<IDetFactura> = await ControllerInvoices.getDetails(
        idFact,
      );
      const pvData: Array<INewPV> = await ControllerPtoVta.get(
        dataFact[0].pv_id,
      );
      const variosPagos: Array<IFormasPago> =
        await ControllerInvoices.getFormasPago(idFact);

      const newFact = dataFact[0];

      if (newFact.fiscal) {
        if (hasStoredFiscalData(newFact)) {
          req.body.dataFiscal = buildStoredFiscalData(newFact);
        } else {
          const dataFiscal:
            | FactInscriptoProd
            | FactInscriptoServ
            | FactMonotribProd
            | FactMonotribServ = await ControllerInvoices.getFiscalDataInvoice(
            newFact.pv,
            newFact.pv_id,
            true,
            newFact.t_fact,
            false,
          );

          if (!isFiscalData(dataFiscal)) {
            throw new Error(
              `No se pudo obtener la informacion fiscal: ${dataFiscal}`,
            );
          }

          req.body.dataFiscal = dataFiscal;
          req.body.dataFiscal.CAEFchVto = moment(
            req.body.dataFiscal.FchVto,
            'YYYYMMDD',
          );
        }
      }

      req.body.pvData = pvData[0];
      req.body.newFact = newFact;
      req.body.productsList = detFact;
      req.body.variosPagos = variosPagos;

      next();
    } catch (error) {
      console.error(error);
      next(errorSend('Faltan datos o hay datos erroneos, controlelo!'));
    }
  };
  return middleware;
};

export = dataFactMiddle;
