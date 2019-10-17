const axios = require("axios")

const instance = axios.create({
  baseURL: "https://www.udemy.com/api-2.0/",
  auth: {
    username: process.env.UDEMY_CLIENT_ID,
    password: process.env.UDEMY_CLIENT_SECRET
  }
})

const getDetails = async id => {
  return await instance.get(`courses/${id}?fields[course]=discount,url,last_update_date`)
}

module.exports = {
  getDetails
}
