"use strict"

const { udemyUpdates } = require("./helpers/tracker")

module.exports.udemyCourseTracker = async (event, context, callback) => {
  callback(null, udemyUpdates())
}
