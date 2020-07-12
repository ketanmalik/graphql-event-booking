import React, { Component } from "react";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";
import EventList from "../components/Events/EventList/EventList";
import Spinner from "../components/Spinner/Spinner";
import "./Events.css";

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
  };

  isActive = true;

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
    this.setState({ isLoading: true });
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
                        _id
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
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      })
      .catch((err) => {
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
        throw err;
      });
  };

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfrimHandler = () => {
    if (!this.state.token) {
      this.setState({ selectedEvent: null });
      return;
    }
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
        this.setState(
          (prevState) => {
            let singleEvent = resData.data.createEvent;
            singleEvent["creator"] = { _id: this.context.userId };
            return { events: [...prevState.events, singleEvent] };
          },
          () => console.log(this.state.events)
        );
      })
      .catch((err) => {
        console.log(err);
      });

    this.setState({ creating: false });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  showDetailHandler = (eventId) => {
    this.setState((prevState) => {
      const selectedEvent = prevState.events.find((e) => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };

  bookEventHandler = () => {
    const requestBody = {
      query: `
        mutation {
            bookEvent(eventId: "${this.state.selectedEvent._id}"){
                _id
                createdAt
                updatedAt
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
        if (res.status !== 200 && res.data !== 201) {
          console.log("Failed!");
          return;
        }
        return res.json();
      })
      .then((resData) => {
        this.setState({ selectedEvent: null });
        console.log(resData);
      })
      .catch((err) => {
        this.setState({ selectedEvent: null });
        throw err;
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canConfirm
            canCancel
            onConfirm={this.modalConfrimHandler}
            onCancel={this.modalCancelHandler}
            confirmText="Confirm"
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
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canConfirm
            canCancel
            onConfirm={this.bookEventHandler}
            onCancel={this.modalCancelHandler}
            confirmText={this.context.token ? "Book Event" : "Confirm"}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>
              ${this.state.selectedEvent.price} -{" "}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
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
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default EventsPage;
