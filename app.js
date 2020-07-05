const express = require("express");
const bodyParser = require("body-parser");
const grapgQlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  grapgQlHttp({
    schema: buildSchema(`

      type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
      }
    
      input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String
      }

      type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }`),
    rootValue: {
      events: () => {
        return Event.find().then((resp) => resp);
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date().toISOString(),
        });
        return event
          .save()
          .then((res) => {
            console.log("res: ", res);
            return res;
          })
          .catch((err) => {
            console.log(err);
            // throw err;
          });
        return event;
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.9e3l4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("mongoose connected!!");
  })
  .catch((err) => console.log(err));
