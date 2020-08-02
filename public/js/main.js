const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join ChatRoom
socket.emit("joinRoom", { username, room });

socket.on("roomUsers", (values) => {
  displayRoomName(values.room);
  displayUsers(values.users);
});

socket.on("message", (message) => {
  displayMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function displayMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">${message.user} <span>${message.time}</span></p>
    <p class="text">
        ${message.message}
    </p>
  `;

  chatMessages.appendChild(div);
}

function displayRoomName(roomname) {
  roomName.innerHTML = roomname;
}

function displayUsers(users) {
  usersList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}
