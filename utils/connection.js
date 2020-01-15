const mongoose = require('mongoose');
const utils = require('../utils/utils');
const RabbitMQ = require('./rabbitmq')
const subscriber = require('./rabbitmq')

const { addOrUpdateCache } = require('../controllers/user');
const { sendUserModule } = require('../utils/texts');
const { sendText } = require('../utils/utils');
require('dotenv').config();

// Socket config
module.exports = {
  mongo() {
    mongoose.promise = global.promise;
    mongoose
      .connect(utils.config.mongo, {
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500
      })
      .then(() => {
        console.log('MongoDB is connected')
      })
      .catch((err) => {
        console.log(err)
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(this.mongo, 5000)
      })
  },
  async rabbitmq() {
    RabbitMQ.init(utils.config.amqp_url);
  },
  async subscribe() {
    await subscriber.init(utils.config.amqp_url);
    // Add to redis cache
    subscriber.consume('ADD_OR_UPDATE_USER_STACKOVERFLOW_CACHE', (msg) => {
      const data = JSON.parse(msg.content.toString());
      addOrUpdateCache(data.newUser, 'africave__users')
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Send User Signup Mail
    // subscriber.consume('SEND_USER_STACKOVERFLOW_SIGNUP_EMAIL', (msg) => {
    //   const data = JSON.parse(msg.content.toString());
    //   const userTokenMailBody = sendUserSignupEmail(data.user)
    //   const mailparams = {
    //     email: data.user.email,
    //     body: userTokenMailBody,
    //     subject: 'Activate your account'
    //   };
    //   sendMail(mailparams, (error, result) => {
    //     console.log(error)
    //     console.log(result)
    //   });
    //   subscriber.acknowledgeMessage(msg);
    // }, 3);

    // // Send User Token Mail
    // subscriber.consume('SEND_USER_STACKOVERFLOW_TOKEN_EMAIL', (msg) => {
    //   const data = JSON.parse(msg.content.toString());
    //   const userTokenMailBody = sendUserToken(data.user, data.token)
    //   const mailparams = {
    //     email: data.user.email,
    //     body: userTokenMailBody,
    //     subject: 'Recover your password'
    //   };
    //   sendMail(mailparams, (error, result) => {
    //     console.log(error)
    //     console.log(result)
    //   });
    //   subscriber.acknowledgeMessage(msg);
    // }, 3);

    // Send Subscribers Subscription text
    subscriber.consume('SEND_MODULE_SUBSCRIPTION', async (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        const userSubscriptionText = sendUserModule(data.subscription, data.courseModule)
        const text = await sendText(userSubscriptionText, '+15005550006', data.subscription.user.phone)
        subscriber.acknowledgeMessage(msg);
      } catch (error) {
        console.log(error)
        subscriber.acknowledgeMessage(msg);
      }
    }, 3);
  },
}
