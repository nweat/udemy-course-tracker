const axios = require("axios")

const instance = axios.create({
  baseURL: "https://www.udemy.commm/api-2.0/",
  auth: {
    username: process.env.UDEMY_CLIENT_ID,
    password: process.env.UDEMY_CLIENT_SECRET
  }
})

const getCourseData = async id => {
  try {
    const response = await instance.get(
      `courses/${id}?fields[course]=discount,url`
    )
    return response.data
  } catch {
    console.log("Error contacting Udemy API")
  }
}

module.exports = {
  getCourseData
}
