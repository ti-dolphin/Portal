const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const Comunicacao = require("./comunicacao");

// **********************************************************
// Parâmetros GET: ?cel=21212121212&msg=123
// **********************************************************
router.get("/sms", function (req, res) {
    var link = Comunicacao.sms(req.query.cel, req.query.msg)
    // const link = "http://sms.painelmarktel.com.br/index.php?app=api&u=webarcondicionado&p=490594f79b542b32e442f1b7801d2682&o=enviar&f=" + req.query.cel + "&m=" + req.query.msg
    // console.log("link do sms:", link)
    res.redirect(link)
});


// **********************************************************
// Parâmetros GET: ?title=titulo&body=corpo&ids[]=32&ids[]=32
// **********************************************************

router.post("/push", async function (req, res) {
    var res1 = await Comunicacao.push(req.body)
    if(res1 == 'sucesso') {
        res.send('Sucesso')
    } else {
        res.send('Falha')
    }
});

router.post("/sendMail", async function (req, res) {
    // const registrationToken = "cot0zo_RmBE:APA91bGESU-bYUC_Q9DBBHD8XIqzGtidTpO6SVYo6Uhcf8BeJ480TtbJW-zK6ZvrV52Oh7MIdn_R4-Kr7jrIfD0NCWodeUvdBJbbhwIqMGpGkN36jnK1bEpZIWYd6QLrqEykloOSjnF2";
    var res1 = await Comunicacao.sendMail(req.body.title, req.body.body, req.body.emails)
    if(res1) {
        res.send('Sucesso')
    } else {
        res.send('Falha')
    }
});

router.get("/usersToNotificate/:processo_id/:papel_id", function (req, res) {
    Comunicacao.usersToNotificate(req.params.processo_id,req.params.papel_id).then((rows, fields) => {
        res.status(200).json(rows);
    }).catch((err) => {
        console.log("ERRO: linha 70 comunicacao_routes" + err);
        res.status(500).send({
            message: String(err)
        });
    });
});


module.exports = router