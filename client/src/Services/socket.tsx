import io from "socket.io-client";
import rootURL from '../utils/utils';

export default io(rootURL);