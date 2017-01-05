/*var app = require('http').createServer()
var io = require('socket.io').listen(app)
app.listen(9000)*/
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 9000;

server.listen(port, () => {
  console.log(__dirname)
  console.log('Server listening at port %d', port);
});
// Routing
app.use(express.static('../dist'));
var mapping = {};
io.sockets.on('connection',(socket) => {
	console.log('---------------' + socket.id + ' connected');
	socket.on('link', (data) => {
		if(mapping[data.source] && mapping[data.target]){
			socket.emit('linkFail',{
				msg: data.source + ' or ' + data.target + ' has been linked'
			});
			return;
		}
		if(data.source === data.target){
			socket.emit('linkFail',{
				msg: ' can not linke yourselft'
			});
			return;			
		}
		mapping[data.source] = data.target;
		mapping[data.target] = data.source;
		socket.emit('linkSuccess',() => {
			console.log(data.source + '=>' + data.target + ' success!');
		})
		io.sockets.sockets[data.target].emit('linked',() => {

		})
	})
	socket.on('tick', (data) => {
		if(mapping[socket.id]){
			io.sockets.sockets[mapping[socket.id]].emit('other-tick',data);
		}
	})
	socket.on('other-lose', (data) => {
		if(mapping[socket.id]){
			io.sockets.sockets[mapping[socket.id]].emit('lose',data);
		}
	})
})