import { config } from '../configurations';

var Bugsnag = require('@bugsnag/js')
var BugsnagPluginExpress = require('@bugsnag/plugin-express')

if(config.bugsnag.ENABLE_BUGSNAG_ERROR_LOGGING){
    Bugsnag.start({
        apiKey: config.bugsnag.BUGSNAG_APP_KEY,
        plugins: [BugsnagPluginExpress],
        releaseStage: config.NODE_ENV,
        enabledReleaseStages: ['staging','production'],
        autoDetectErrors: true
      })
}

export var bugsnagMiddleware = Bugsnag.getPlugin('express')
