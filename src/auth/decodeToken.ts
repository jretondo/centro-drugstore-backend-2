import jwt from 'jsonwebtoken';
import { config } from "../config";
import Store from '../store/mysql';
import { Tables } from '../enums/EtablesDB';

const getToken = (auth: string): { error: boolean, message: string } => {
    if (!auth) {
        return {
            error: true,
            message: "No tiene los token envíado"
        }
    }

    if (auth.indexOf('Bearer ') === -1) {
        return {
            error: true,
            message: "Formato invalido"
        }
    }

    return {
        error: false,
        message: auth.replace('Bearer ', "")
    }
};

const verify = (token: string) => {
    const verifi = jwt.verify(token, config.jwt.secret)
    if (verifi) {
        return {
            error: false,
            message: verifi
        }
    } else {
        return {
            error: true,
            message: "Token invalido"
        }
    }
};

export const decodedToken = async (tokenReq: string) => {
    try {
        const token = getToken(tokenReq)
        const decoded: any = verify(token.message)
        if (decoded.error) {
            return false
        }
        const user = await Store.getAnyCol(Tables.AUTH_ADMIN, { pass: decoded.message.pass })
        const userName = user[0].usuario
        if (!userName || userName !== decoded.message.usuario) {
            return false
        }
        return decoded.message
    } catch (error) {
        return false
    }
};