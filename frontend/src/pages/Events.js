import React, { Component } from "react";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";
import "./Events.css";

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElem = React.createRef();
    this.priceElem = React.createRef();
    this.dateElem = React.createRef();
    this.descriptionElem = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  fetchEvents = () => {
    const requestBody = {
      query: `
            query {
                events {
                    _id
                    title
                    description
                    date
                    price
                    creator{
                        email
                        password
                    }
                }
            }
        `,
    };
    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.data !== 201) {
          console.log("Failed!");
          return;
        }
        return res.json();
      })
      .then((resData) => {
        let events = resData.data.events;
        this.setState({ events: events });
      })
      .catch((err) => {
        throw err;
      });
  };

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfrimHandler = () => {
    const title = this.titleElem.current.value;
    const price = +this.priceElem.current.value;
    const date = this.dateElem.current.value;
    const description = this.descriptionElem.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const event = { title, price, date, description };

    const requestBody = {
      query: `
            mutation {
                createEvent(eventInput: {title:"${title}",description:"${description}",price:${price},date:"${date}"}){
                    _id
                    title
                    description
                    date
                    price
                    creator{
                        _id
                        email
                    }
                }
            }
          `,
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        this.fetchEvents();
      })
      .catch((err) => {
        console.log(err);
      });

    this.setState({ creating: false });
  };
  modalCancelHandler = () => {
    this.setState({ creating: false });
  };

  render() {
    let eventsList = this.state.events.map((event) => {
      return (
        <li key={event._id} className="events__list-item">
          {event.title}
        </li>
      );
    });
    return (
      <React.Fragment>
        {this.state.creating && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canConfirm
            canCancel
            onConfirm={this.modalConfrimHandler}
            onCancel={this.modalCancelHandler}
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElem} />
              </div>
              <div className="form-control">
                <label htmlFor="tprice">Price</label>
                <input type="number" id="price" ref={this.priceElem} />
              </div>
              <div className="form-control">
                <label htmlFor="datetime-local">Date</label>
                <input type="date" id="date" ref={this.dateElem} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  type="text"
                  id="description"
                  rows="4"
                  ref={this.descriptionElem}
                ></textarea>
              </div>
            </form>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share your own Events!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Create Event
            </button>
          </div>
        )}
        <section className="events__list">{eventsList}</section>
      </React.Fragment>
    );
  }
}

export default EventsPage;
