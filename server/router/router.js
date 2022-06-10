// const controller = require('../controller/controller.js');
import controller from '../controller/controller.js'
// const {Router} = require('express')
import {Router} from 'express'


const router = new Router();

//starting API use:
router.get('/login', controller.login);
router.post('/newToken', controller.newToken);

//Things that should only happen once:
router.get('/infoPL/:userID', controller.getPlayLists);
router.post('/setPass/:userID', controller.setPassword)
router.post('/checkPass/:userID', controller.checkPassword)
router.post('/createPlaylist/:userID', controller.createNewPlaylist)
router.post('/useExistingPlaylist/:userID', controller.useExistingPlaylist)
router.post('/setNewRoom/:userID', controller.setRoomForHost)
router.post('/getUserByRoom', controller.getHostidByRoom)
router.post('/logout', controller.logout)
router.post('/getCurrentList', controller.getCurrentList)
//search + adding songs
router.get('/search/:userID/:string', controller.searchItem);
router.post('/addSong/:userID', controller.addSong)
router.post('/deleteSong/:userID', controller.deleteSong)

export default router;
// module.exports = router;