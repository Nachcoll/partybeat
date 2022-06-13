// const controller = require('../controller/controller.js');
import controller from "../controller/controller.js";
import loginController from "../controller/login.controller.js";
import hostController from "../controller/host.controller.js";
import clientController from "../controller/client.controller.js";
// const {Router} = require('express')
import { Router } from "express";

const router = new Router();
//starting API use:
router.get("/login", loginController.login);
router.post("/newToken", loginController.newToken);

//Things that should only happen once for the HOST:
router.get("/infoPL/:userID", hostController.getPlayLists);
router.post("/setPass/:userID", hostController.setPassword);
router.post("/createPlaylist/:userID", hostController.createNewPlaylist);
router.post("/useExistingPlaylist/:userID", hostController.useExistingPlaylist);
router.post("/logout", hostController.logout);
router.post("/setNewRoom/:userID", hostController.setRoomForHost);

//this that should only happen once for the CLIENTS:
router.post("/checkPass/:userID", clientController.checkPassword);
router.post("/getUserByRoom", clientController.getHostidByRoom);
router.post("/getCurrentList", clientController.getCurrentList);

//search + adding songs. This should happen more than once.
router.get("/search/:userID/:string", controller.searchItem);
router.post("/addSong/:userID", controller.addSong);
router.post("/deleteSong/:userID", controller.deleteSong);

export default router;
// module.exports = router;
