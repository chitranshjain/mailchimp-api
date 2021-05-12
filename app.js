const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const dotenv = require("dotenv");
const https = require("https");

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

app.listen(process.env.PORT || 8000, () => {
  console.log("The server is up and running.");
});
