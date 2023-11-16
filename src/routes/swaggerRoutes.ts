/**
 * All the swagger routes.
 */

const express = require('express');
export const router = express.Router();
const swaggerUi = require('swagger-ui-express');

const { config } = require('../configurations')
import swaggerDocument  from './../common/swagger.json'

if(config.swagger.ENABLE_API_DOCS) {
    router.use('/v1/docs', swaggerUi.serve);
    router.get('/v1/docs', swaggerUi.setup(swaggerDocument));
}
