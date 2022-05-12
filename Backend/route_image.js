const express = require('express');
const router = express.Router();
const myRepository = require('./myRepository');
const app = express();

router.get("/", async (req, res) => {
    try {
        const x = await myRepository.GetAllImages();
        res.send(x);
    } catch (e) {
        console.log(e);

    }
});

router.get("/:categoreName", async (req, res) => {
    try {
        const x = await myRepository.GetImgByCategoreName(req.params.categoreName);
        res.send(x);
    } catch (e) {
        console.log(e);

    }
});

router.get("/Gallery", async (req, res) => {
    try {
        const x = await myRepository.GetGallery();
        res.send(x);
    } catch (e) {
        console.log(e);

    }
});

module.exports = router;