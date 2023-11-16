import 'reflect-metadata';

import { default as express } from "express";
import { createConnection } from 'typeorm';
import { default as cors } from 'cors';

import { config, ormConfig } from './configurations';
import { requestLogger, handleErrors, bugsnagMiddleware } from './middlewares';
import { logger, expressWinstonRequestErrorLogger } from './utils';
import {
    userAuthenticationRouter, serviceStatusRoutes, swaggerRoutes, clientDetails, agencyRoute,
    regionRoute, departmentRoute, siteRoute, workerRoutes, jobRoutes, rateCardRoute, sectorRoutes,
    agencyClientAssociationRoute, userRoutes, timeAndAttendanceRoutes, shiftRoutes, bookingRoutes,
    payrollRouters, masterAdminDadhboardRouter, dashboardRouter, messageRouter, surveyRouter,
    automatedMessagesRouter, faqRouter, mobileVersionRouter
} from './routes';
class App {
    private port: number;
    private app: express.Application;

    constructor(port: number) {
        this.port = port;

        this.app = express();

        // Initialize all the middleware of the service.
        this.initializeMiddlewares();

        // Logs request start and end details
        this.app.use(requestLogger);

        /**
         * Create Database connection. 
         * So database operations can be done from anywhere in the service.
        */
        this.createDBConnections();

        // Initialize all the routes.
        this.initializeRoutes();

        // Initialize request error logger to log all the generated error logs.
        this.initializeRequestErrorLogger();

        // Initialize error handler to provide custom and system generated error response.
        this.initializeErrorHandling();
    }

    private createDBConnections() {
        // Create MySQL Connection
        createConnection(ormConfig);
    }

    private initializeMiddlewares() {
        this.app.use(cors({
            origin: config.API_HOSTS,
            methods: "GET,POST,PUT,DELETE,PATCH"
        }));

        this.app.use(express.urlencoded({
            extended: true,
            limit: '100KB'
        }))
        this.app.use(express.json({
            limit: '200KB',
            strict: false
        }));

        if (config.bugsnag.ENABLE_BUGSNAG_ERROR_LOGGING) {
            this.app.use(bugsnagMiddleware.requestHandler);
        }
    }

    private initializeRequestErrorLogger() {
        this.app.use(expressWinstonRequestErrorLogger);
    }

    private initializeRoutes() {
        // All the service provided routes.
        this.app.use('/api', userAuthenticationRouter);
        this.app.use('/api', clientDetails);
        this.app.use('/api', regionRoute);
        this.app.use('/api', agencyRoute);
        this.app.use('/api', departmentRoute);
        this.app.use('/api', siteRoute)
        this.app.use('/api', workerRoutes);
        this.app.use('/api', timeAndAttendanceRoutes);
        this.app.use('/api', rateCardRoute);
        this.app.use('/api', jobRoutes);
        this.app.use('/api', sectorRoutes);
        this.app.use('/api', agencyClientAssociationRoute);
        this.app.use('/api', userRoutes);
        this.app.use('/api', swaggerRoutes);
        this.app.use('/api', shiftRoutes);
        this.app.use('/k8', serviceStatusRoutes);
        this.app.use('/api', bookingRoutes)
        this.app.use('/api', payrollRouters);
        this.app.use('/api', masterAdminDadhboardRouter);
        this.app.use('/api', dashboardRouter);
        this.app.use('/api', messageRouter);
        this.app.use('/api', surveyRouter);
        this.app.use('/api', automatedMessagesRouter);
        this.app.use('/api', faqRouter);
        this.app.use('/api', mobileVersionRouter);
    }

    private initializeErrorHandling() {
        this.app.use(handleErrors);
        if (config.bugsnag.ENABLE_BUGSNAG_ERROR_LOGGING) {
            this.app.use(bugsnagMiddleware.errorHandler);
        }
    }

    public Start() {
        this.app.listen(this.port, () => {
            logger.info(`${config.APP_NAME} Server: Express server is listening on port ${this.port}!`);
        });
    }
}

new App(parseInt(config.SERVICE_PORT)).Start();
