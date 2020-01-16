const cron = require('node-cron');
const CourseController = require('../controllers/course')

cron.schedule("00 00 */1 * * * *", async () => {
  console.log("Hourly ", new Date());
  try {
    await CourseController.subscriptions()
  } catch (error) {
    console.log(error)
  }
}, {
  scheduled: true,
});

// cron.schedule("* * * * *", async () => {
//   console.log("per minute ", new Date());
//   await CourseController.subscriptions()
// }, {
//   scheduled: true,
// });