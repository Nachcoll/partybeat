import io from "socket.io-client";
const url = 'http://localhost:8000';
export default io(url);