import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import http from 'http';
dotenv.config({
  path: path.join(__dirname, '..', '..', '.env'),
});
import { errorTrhow } from '../network/errors';
import user from './components/user/network';
import auth from './components/auth/network';
import views from './components/views/network';
import test from './components/test';
import permissions from './components/permissions/network';
import routesApp from './components/routes/network';
import ptosVta from './components/ptosVta/network';
import products from './components/products/network';
import proveedores from './components/proveedores/network';
import clientes from './components/clientes/network';
import stock from './components/stock/network';
import invoices from './components/invoices/network';
import reports from './components/reports/network';
import { WebSocketServer } from '../socket/web-socket';
import { decodedToken } from '../auth/decodeToken';

export class App {
  app: Application;
  socketApp: Application;
  server?: http.Server | https.Server;
  webSocketServer?: WebSocketServer;
  constructor(
    private port: number | string,
    private socketPort: number | string,
  ) {
    this.app = express();
    this.socketApp = express();
    this.settings();
    this.middlewares();
    this.routes();
  }

  private settings() {
    this.app.set('port', this.port);
    this.socketApp.set('port', this.socketPort);
    this.app.set('views', path.join('views'));
    this.app.set('view engine', 'ejs');
  }

  private middlewares() {
    this.app.use(
      cors({
        exposedHeaders: ['Content-Disposition'],
      }),
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes() {
    this.app.use(
      '/static',
      express.static(path.join(__dirname, '..', '..', 'public')),
    );
    this.app.use('/api', test);
    this.app.use('/api/user', user);
    this.app.use('/api/auth', auth);
    this.app.use('/api/views', views);
    this.app.use('/api/permissions', permissions);
    this.app.use('/api/routes', routesApp);
    this.app.use('/api/ptosVta', ptosVta);
    this.app.use('/api/products', products);
    this.app.use('/api/proveedores', proveedores);
    this.app.use('/api/clientes', clientes);
    this.app.use('/api/stock', stock);
    this.app.use('/api/invoices', invoices);
    this.app.use('/api/reports', reports);
    this.app.use(errorTrhow);
  }

  listenTest(): void {
    this.app.listen(this.app.get('port'));
    console.log(`Conectado al puerto ${this.app.get('port')}`);
  }

  listenProd(): void {
    var options = {
      key: fs.readFileSync(path.join('nekoadmin.key'), 'utf8'),
      cert: fs.readFileSync(path.join('nekoadmin.crt'), 'utf8'),
    };
    console.log(' ruta cert', path.join('nekoadmin.crt'));
    https.createServer(options, this.app).listen(this.app.get('port'), () => {
      console.log(`Conectado al puerto ${this.app.get('port')}`);
    });
  }

  listenSocketDev(): void {
    this.server = http.createServer(this.socketApp);
    this.webSocketServer = new WebSocketServer(this.server, decodedToken);
    this.server.listen(this.socketApp.get('port'));
    console.log(
      `Socket conectado al puerto ${this.socketApp.get('port')} - Desarrollo`,
    );
  }

  listenSocketProd(): void {
    const options = {
      key: fs.readFileSync(path.join('nekoadmin.key'), 'utf8'),
      cert: fs.readFileSync(path.join('nekoadmin.crt'), 'utf8'),
    };
    this.server = https.createServer(options, this.socketApp);
    this.webSocketServer = new WebSocketServer(this.server, decodedToken);
    this.server.listen(this.socketApp.get('port'));
    console.log(
      `Socket conectado al puerto ${this.socketApp.get('port')} - Producción`,
    );
  }
}
