import { Router, NextFunction, Response, Request } from 'express';
import { success } from '../../../network/response';
const router = Router();
import Controller from './index';
import secure from '../../../auth/secure';

const fiscal = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.fiscalReport(String(req.query.fromDate), String(req.query.toDate))
        .then((lista: any) => {
            success({ req, res, message: lista });
        })
        .catch(next)
};


router
    .get("/fiscal", secure(), fiscal)

export = router;