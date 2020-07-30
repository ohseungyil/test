// 클라이언트 소켓 

// socket.io 서버에 접속한다
var socket = io();

// 서버로 메시지 송신
// socket.emit("event_name", msg);

// 서버로부터 메시지 수신
// socket.on("event_name", function(data) {
//   ...
// })
console.log(socket.io.readyState);
// console.log(socket.connected);
console.log(socket.disconnected);
socket.on('connect', function() {
    $("#chatLogs").append("<div>websocket connected!</div>");
})

// 서버로부터의 메시지가 수신되면
socket.on("chat", function(data) {
  $("#chatLogs").append("<div>message: " + data.msg + "</div>");
});

// Send 버튼이 클릭되면
$("form").submit(function(e) {
  e.preventDefault();
  var $msgForm = $("#msgForm");

  // 서버로 메시지를 전송한다.
  socket.emit("chat", { msg: $msgForm.val() });
  $msgForm.val("");
});
