const express = require('express');
const router = express.Router();
const myRepository = require('./myRepository');
const connectionhelper = require('./connetToDB')
const app = express();

router.post("/Login", myRepository.signIn);

// router.post("/Login", async (req, res) => {
//     try {
//         let x = await myRepository.signIn;
//         res.send(x)
//     } catch (error) {
//         console.log(error);
//     }

// });


//----------------------------------------

router.get("/:userName", async (req, res) => {
    try {
        const x = await myRepository.CheckAccountByUserName(req.params.userName);
        res.send(x);
    } catch (e) {
        console.log(e);

    }
});

router.post("/AddOne", async (req, res) => {
    try {
        const x = await myRepository.AddNewUser(req.body);
        res.send(x);
    } catch (e) {
        console.log(e);

    }
});
router.delete("/:userName", async (req, res) => {
    try {
        const x = await myRepository.deletAccountByuserName(req.params.userName);
        res.send(x);
    } catch (e) {
        console.log(e);

    }
});

module.exports = router;