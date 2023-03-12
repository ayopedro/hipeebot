require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const sessionMiddleware = require("./middlewares/sessionMiddleware");
const { formatMessage } = require("./utils/formatMessage");
const menuItems = require("./utils/menuItems.json")

const botName = "HipeeBot";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

app.use(sessionMiddleware);

const orderHistory = [];

io.use((socket, next) => {
  return sessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", (socket) => {
  console.log("New WS connection", socket.id);

  const botMessage = (message) => {
    setTimeout(
      () => socket.emit("message", formatMessage(botName, message)),
      1500
    );
  };

  botMessage("Hi there, I'm HipeeBot. What is your name?");

  socket.request.session.currentOrder = [];
  let user = "";

  socket.on("chat", (message) => {
    if (!user) {
      user = message;
      io.emit("message", formatMessage(user, message));
      botMessage(
        `Welcome, ${user}. <br /><br />
        
        To place an order, press 1.
        <br />To see your current order, press 97. 
        <br />To see your order history, press 98. 
        <br />To checkout your order, press 99. 
        <br />Press 0 to cancel.`
      );
    } else {
      io.emit("message", formatMessage(user, message));
      switch (message) {
        case "1":
          const options = menuItems
            .map((item) => `<li>Press ${item.id} for ${item.food}</li>`)
            .join("\n");
          botMessage(`
            Here's a list of items you can order:
            <ul>
            ${options}
            </ul>
            
            Kindly respond with a corresponding number`);
          break;
        case "11":
        case "12":
        case "13":
        case "14":
        case "15":
        case "16":
        case "17":
        case "18":
        case "19":
        case "20":
          const userOption = Number(message);
          const foundItem = menuItems.find(item  => item.id  ===  userOption);

          if (foundItem) {
            socket.request.session.currentOrder.push(foundItem);
            botMessage(
              `${foundItem.food} has been added to your cart.
              <br /><br />
              Would you like to add to your cart? if yes, kindly reply with corresponding number
              <br /><br />
              Otherwise, type 99 to checkout or 97 to see the items in your cart`
            );
          } else {
            botMessage(`Invalid input.`);
          }
          break;
        case "97":
          if (socket.request.session.currentOrder.length === 0) {
            botMessage("Cart empty!. Kindly add an order to cart");
          } else {
            const currentOrderString =
              socket.request.session.currentOrder.join(", ");
            botMessage(`Your current order(s):<br/><br/> ${currentOrderString}`);
          }
          break;
        case "98":
          if (!orderHistory.length) {
            botMessage(
              "Your order history is empty. Kindly place an order now"
            );
          } else {
            const orderHistoryString = orderHistory
              .map((order, index) => `Order ${index + 1}: ${order.join(", ")}<br/>`)
              .join("\n");
            botMessage(`Your order history: <br/><br/>${orderHistoryString}`);
          }
          break;
        case "99":
          if (socket.request.session.currentOrder.length === 0) {
            botMessage(
              "Cannot place order on empty cart. Kindly add to your cart"
            );
          } else {
            orderHistory.push(socket.request.session.currentOrder);
            botMessage("Order placed!");
            socket.request.session.currentOrder = [];
          }
          break;
        case "0":
          if (socket.request.session.currentOrder.length === 0) {
            botMessage("Cart empty! No order to cancel");
          } else {
            socket.request.session.currentOrder = [];
            botMessage(
              "Order cancelled! You can still place an order.<br /><br /> Press 1 to see menu"
            );
          }
          break;
        default:
          botMessage("Invalid selection. Please try again");
      }
    }
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
