const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator),
      };
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = Event.find();
      return events.map((event) => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (err) {
      throw err;
    }
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
        createdEvent = {
          ...res._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, res._doc.creator),
        };
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
        return createdEvent;
      })
      .catch((err) => {
        throw err;
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
};
