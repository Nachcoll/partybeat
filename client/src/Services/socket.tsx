import io from "socket.io-client";
import rootURL from "../utils/utils.js";

export default io(rootURL.rootURL);
