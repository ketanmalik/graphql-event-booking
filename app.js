const express = require("express");
const bodyParser = require("body-parser");
const grapgQlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

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

      type User{
          _id: String!
          email: String!
          password: String
      }
    
      input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String
      }
      
      input UserInput {
      email: String!
      password: String!
      }

      type RootQuery {
            events: [Event!]!
            users: [User!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
          creator: "5f012a5addd4e5779ff215a1",
        });
        let createdEvent;
        return event
          .save()
          .then((res) => {
            createdEvent = res;
            return User.findById("5f012a5addd4e5779ff215a1");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User does not exist!");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            console.log("result: ", result);
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            // throw err;
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User exists already!!");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((res) => {
            const user = new User({
              email: args.userInput.email,
              password: res,
            });
            return user.save();
          })
          .then((resp) => {
            return { ...resp._doc, password: null };
          })
          .catch((err) => {
            throw err;
          });
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
