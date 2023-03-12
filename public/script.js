const chatForm = document.getElementById("chat-form");
const chats = document.querySelector(".chats");
const chatInput = document.getElementById("chat");

const socket = io();

socket.on("message", (message) => {
  outputMessage(message);
  chats.scrollTop = chats.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = chatInput.value;

  if (!msg) {
    chatInput.classList.add("error");
    setTimeout(() => {
      chatInput.classList.remove("error");
    }, 2000);

    return;
  } else {
    socket.emit("chat", msg);
    e.target.elements.chat.value = "";
    e.target.elements.chat.focus();
  }
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.message}</p>
    `;
  chats.appendChild(div);
}
