// const controller = require('../controller/controller.js');
import controller from '../controller/controller.js'
// const {Router} = require('express')
import {Router} from 'express'


const router = new Router();


router.get('/login', controller.login);
router.post('/newToken', controller.newToken);
router.get('/info', controller.getUserInfo);



export default router;
// module.exports = router;