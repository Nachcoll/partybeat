// const controller = require('../controller/controller.js');
import controller from '../controller/controller.js'
// const {Router} = require('express')
import {Router} from 'express'


const router = new Router();


router.get('/login', controller.login);
router.post('/newToken', controller.newToken);

// router.get('/info', controller.getUserInfo);
router.get('/infoPL/:userID', controller.getPlayLists);
router.get('/search/:userID/:string', controller.searchItem);

router.post('/setPass/:userID', controller.setPassword)
router.get('/checkPass/:userID', controller.checkPassword)

router.post('/createPlaylist/:userID', controller.createNewPlaylist)
router.post('/useExistingPlaylist/:userID', controller.useExistingPlaylist)

router.post('/addSong/:userID', controller.addSong)


export default router;
// module.exports = router;