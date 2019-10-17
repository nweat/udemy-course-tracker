const { format, isAfter } = require("date-fns")
const MongoClient = require("mongodb").MongoClient

//const dotenv = require("dotenv")
//dotenv.config()

const { getDetails } = require("./udemy")

const getCourseDetails = async collection => {
  const cursor = await collection.find({}).toArray()
  return Promise.all(
    cursor.map(async course => {
      let api_response = await getDetails(course.course_ID)
      return { ...api_response.data, ...course }
    })
  )
}

const udemyUpdates = async () => {
  const dateFormat = "do MMMM yyyy"
  let message = ""
  const client = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  const collection = client.db("data").collection("courses")

  await getCourseDetails(collection)
    .then(data => {
      data.forEach(async d => {
        if (!d.bought) {
          message += `Course: ${d.course_title} not bot yet \n`
          if (d.discount != null && d.discount.has_discount_saving) {
            if (d.discount.price.price_string != d.discount_price) {
              await collection.updateOne({ course_ID: d.course_ID }, { $set: { discount_price: d.discount.price.price_string } }, (err, item) => {
                if (item) {
                  message += `Course: ${d.course_title} \n`
                  message += `URL: https://www.udemy.com${d.url} \n`
                  message += `Original price:  ${d.discount.list_price.price_string} \n`
                  message += `Discount was:  ${d.discount_price} \n`
                  message += `And Now is:  ${d.discount.price.price_string} \n\n`
                }
              })
            }
          } else {
            await collection.updateOne({ course_ID: d.course_ID }, { $set: { discount_price: null } }, (err, item) => {
              console.log(`${d.course_ID} updated with discount_price: null`)
            })
          }
        } else {
          if (d.last_updated == null) {
            await collection.updateOne({ course_ID: d.course_ID }, { $set: { last_updated: d.last_update_date } }, (err, item) => {
              if (item) {
                let result = format(new Date(d.last_update_date), dateFormat)
                message += `Course: ${d.course_title} \n`
                message += `URL: https://www.udemy.com${d.url} \n`
                message += `Last updated on ${result}\n\n`
              }
            })
          } else {
            let fromAPI = new Date(d.last_update_date)
            let fromDB = new Date(d.last_updated)
            if (isAfter(fromAPI, fromDB)) {
              await collection.updateOne({ course_ID: d.course_ID }, { $set: { last_updated: d.last_update_date } }, (err, item) => {
                if (item) {
                  message += `Course: ${d.course_title} \n`
                  message += `URL: https://www.udemy.com${d.url} \n`
                  message += `Looks like new content was added on ${format(fromAPI, dateFormat)}\n\n`
                }
              })
            }
          }
        }
      })
    })
    .then(() => client.close())

  return message
}

module.exports = {
  udemyUpdates
}
