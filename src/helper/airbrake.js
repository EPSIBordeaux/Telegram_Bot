const AirbrakeClient = require('airbrake-js')

module.exports.run = () => {
  if (process.env.PROJECT_KEY !== undefined && process.env.PROJECT_ID !== undefined) {
    var airbrake = new AirbrakeClient({
      projectId: process.env.PROJECT_ID,
      projectKey: process.env.PROJECT_KEY
    })

    airbrake.addFilter(function (notice) {
      notice.context.environment = process.env.NODE_ENV
      return notice
    })
  }
}
