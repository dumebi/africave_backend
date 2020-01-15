/**
 * Send a module message
 * @param {object} user
 * @param {string} module
 */
exports.sendUserModule = (subscription, courseModule) => {
  return `
  Your next module on ${subscription.course.title} is availablle at ${courseModule.link}
  `;
}