if (wx) {
  // 外面这层判断可以不要的
  // 实际使用按照 signalR官方参数使用就行,逻辑没动,就改了 socket,request 实现方式
  let connection = new signalR.HubConnectionBuilder().withUrl("http://192.168.123.155:21021/signalr-answer").build();
  connection.on("CallBack", function(data) {
    console.log(data);
  });
  connection.start().then(function() {
    connection.invoke("Sayhello").then(function(data) {
      console.log(data);
    });
  });
} else {
  console.log("这串代码要复制到微信中测试");
}
