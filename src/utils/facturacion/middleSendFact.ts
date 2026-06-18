import { NextFunction, Request, Response } from "express"
import { IFactura } from "interfaces/Itables"
import { sendInvoice } from "../sendEmails/sendInvoice"

const shouldSendEmail = (req: Request, newFact: IFactura) => {
    if (req.query.sendEmail) {
        return true;
    }

    return req.method !== "GET" && newFact.email_cliente !== "";
}

export const sendFactMiddle = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const newFact: IFactura = req.body.newFact
            if (shouldSendEmail(req, newFact)) {
                await sendInvoice(
                    String(req.body.filePath),
                    String(req.body.fileName),
                    newFact.nota_cred,
                    newFact.total_fact,
                    String(req.query.email || newFact.email_cliente),
                    req.body.formapagoStr,
                    newFact.raz_soc_cliente,
                    newFact.tipo_doc_cliente,
                    newFact.n_doc_cliente
                )
                next()
            } else {
                next()
            }
        } catch (error) {
            console.error(error)
            next()
        }
    }
    return middleware
}
