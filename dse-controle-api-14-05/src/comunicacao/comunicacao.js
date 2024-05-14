const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("../../config");
const con = require("../../data_base");
const FirebaseNotification = require("../../firebase-notification");
const Processo = require("../processo/processo/processo.js");
const querystring = require("querystring");
const https = require("https");

class Comunicacao {
  /**
   * Realiza o match do pedido com o instalador
   * @param {object} data contem os pares de campo e valor
   * @returns {Promise}  que vai resolver em rows e fields
   **/
  static sms(cel, msg) {
    const link =
      "http://sms.painelmarktel.com.br/index.php?app=api&u=webarcondicionado&p=490594f79b542b32e442f1b7801d2682&o=enviar&f=" +
      cel +
      "&m=" +
      msg;
    console.log("link do sms:", link);
    return link;
  }

  static async push(data) {
    for (const id of data.ids) {
      const topic = `user_${id}`;
      const result = await FirebaseNotification.push(
        data.title,
        data.body,
        `/topics/${topic}`
      );
    }
  }

  static async manyPush(data) {
    const messages = [];
    for (const message of data) {
      const topic = `user_${message.id}`;
      messages.push(
        FirebaseNotification.push(
          message.title,
          message.body,
          `/topics/${topic}`
        )
      );
    }
    return Promise.all(messages);
  }

  static async usersToNotificate(processo_id, papel_id) {
    return new Promise(async function (resolve, reject) {
      try {
        if (processo_id && papel_id && papel_id != "undefined") {
          const sql =
            `select u.id, u.email from usuario u
                                    where u.id in (
                                        select up.usuario_id from usuario_papel up where up.papel_id = ` +
            papel_id +
            `
                                    )`;
          // Do async job
          con.query(sql, async function (err, rows, fields) {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * TODO: TESTAR O ENVIO DE EMAIL
   * @param {String} title
   * @param {String} message
   * @param {Array<String>} emails
   * @returns {String}
   */
  static async sendMail(title, message, emails) {
    return new Promise(function (resolve, reject) {
      try {
        const postData = querystring.stringify({
          username: EMAIL.USER,
          api_key: EMAIL.KEY,
          from: EMAIL.USER,
          from_name: '"Dolphin - Soluções em Engenharia" <dev@roxcode.io>',
          to: emails,
          subject: title,
          body_html: message,
        });

        // Object of options.
        var postOptions = {
          host: "api.elasticemail.com",
          path: "/mailer/send",
          port: "443",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": postData.length,
          },
        };

        var result = "";

        const postRequest = https.request(postOptions, function (res) {
          res.setEncoding("utf8");
          res.on("data", function (chunk) {
            result = chunk;
            resolve(result);
          });
          res.on("error", function (e) {
            result = "Error: " + e.message;
            resolve(null);
          });
        });

        // Post to Elastic Email
        postRequest.write(postData);
        postRequest.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  static async sendNodemailerEmail(to, subject, bodyHtml, fromName) {
    return new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport(NODEMAILERTRANSPORT);
      const mailOptions = {
        from: `${fromName} <${NODEMAILERTRANSPORT.auth.user}>`,
        to: to,
        subject: subject,
        html: bodyHtml,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(error);
          reject({
            response: error,
            wasSent: false,
          });
        } else {
          console.log("Email sent: " + info.response);
          resolve({
            response: info.response,
            wasSent: true,
          });
        }
      });
    });
  }
}
module.exports = Comunicacao;
