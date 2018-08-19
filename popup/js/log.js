/**
 * Logging method - based on config setting
 * Update via console (APP.Config.verbose = true)
 *  then save settings page to cache locally
 */
APP.log = function (data) {
    if (APP.Config.verbose) {
        console.log(data);
    }
}

APP.logLine = function () {
    APP.log('--------------------------------------------------');
}
