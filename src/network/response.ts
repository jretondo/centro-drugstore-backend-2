import fs from 'fs';
import { json, Request, Response } from 'express';
import { stringify } from 'querystring';

interface propRes {
    req: Request,
    res: Response,
    status?: number,
    message?: any
}

export const success = (props: propRes) => {
    props.res.status(props.status || 200).send({
        error: false,
        status: props.status || 200,
        body: props.message || ""
    });
};

export const error = (props: propRes) => {
    props.res.status(props.status || 500).send({
        error: true,
        status: props.status || 500,
        body: props.message || ""
    });
};

export const file = (
    req: Request,
    res: Response,
    filePath: string,
    contentType: string,
    fileName: string,
    data?: object
) => {
    if (!fs.existsSync(filePath)) {
        res.status(404).send({
            error: true,
            status: 404,
            body: "Archivo no encontrado"
        });
        return;
    }

    let file = fs.createReadStream(filePath);
    let stat = fs.statSync(filePath);

    res.setHeader('dataJson', JSON.stringify(data));
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    file.on('error', (error) => {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send({
                error: true,
                status: 500,
                body: "No se pudo leer el archivo"
            });
        }
    });
    file.pipe(res);
};
