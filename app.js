const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const dotenv = require("dotenv");
const https = require("https");
const { response } = require("express");

const app = express();
app.use(bodyParser.json());
dotenv.config();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.post("/", (req, res) => {
  const email = req.body.email;
  const mailChimpAPIKey = process.env.API_KEY;
  const listID = process.env.LIST_ID;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const url = "https://us1.api.mailchimp.com/3.0/lists/" + listID + "/";
  const options = {
    method: "POST",
    auth: "mailchimp:" + mailChimpAPIKey,
  };

  const mailchimpRequest = https.request(url, options, (response) => {
    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });

    if (response.statusCode === 200) {
      res
        .status(200)
        .send({ message: "Successfully signed up to the newsletter!" });
    } else {
      res.status(404).send({
        message:
          "There was an error signing you up, please try again after sometime.",
      });
    }
  });

  mailchimpRequest.write(jsonData);
  mailchimpRequest.end();

  console.log(email);
});

app.get("/", async (req, res) => {
  const mailChimpAPIKey = process.env.API_KEY;
  const listID = process.env.LIST_ID;

  const url = "https://us1.api.mailchimp.com/3.0/lists/" + listID + "/members";

  const options = {
    method: "GET",
    auth: "mailchimp:" + mailChimpAPIKey,
    fields: "email_address",
    count: 100,
  };

  const mailchimpRequest = https.request(url, options, async (response) => {
    let data = "";
    try {
      await response.on("data", (d) => {
        data += d;
      });
    } catch (err) {
      console.log("err : " + err.message);
    }
    res.send({ message: "success", data : data});
  });

  mailchimpRequest.end();
});

app.listen(process.env.PORT || 8000, () => {
  console.log("The server is up and running.");
});
