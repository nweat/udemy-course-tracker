"use strict"

const dotenv = require("dotenv")
dotenv.config()

const { getCourseData } = require("./helpers/api")

module.exports.udemyCourseTracker = (event, context, callback) => {
  callback(null, getCourseData(922484))
}
