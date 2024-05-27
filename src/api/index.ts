import { App } from './app';
import { config } from '../config';

export const app = new App(config.api.port, config.api.socketPort);

const main = () => {
    if (process.env.MACHINE === "LOCAL") {
        app.listenTest();
        app.listenSocketDev();
    } else {
        app.listenProd();
        app.listenSocketProd();
    }
}

main();