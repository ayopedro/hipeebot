const moment = require("moment");

const formatMessage = (username, msg) => {
  return {
    username,
    message: msg,
    time: moment().format("h:mm a"),
  };
};

module.exports = {
  formatMessage,
};
