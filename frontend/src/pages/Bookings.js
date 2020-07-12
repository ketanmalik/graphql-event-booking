import React, { Component } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";
import BookingList from "../components/Bookings/BookingList/BookingList";

class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
                query {
                    bookings {
                        _id
                        createdAt
                        event {
                            _id
                            title
                            date
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
        Authorization: "Bearer " + this.context.token,
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
        let bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        throw err;
      });
  };

  cancelBookingHandler = (bookingId) => {
    this.setState({ isLoading: true });

    const requestBody = {
      query: `
              mutation {
                  cancelBooking(bookingId: "${bookingId}"){
                      _id
                      title
                      description
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
        this.setState((prevState) => {
          const updatedBookings = prevState.bookings.filter((booking) => {
            return booking._id !== bookingId;
          });
          return { bookings: updatedBookings, isLoading: false };
        });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        throw err;
      });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <BookingList
            bookings={this.state.bookings}
            onCancel={this.cancelBookingHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default BookingsPage;
