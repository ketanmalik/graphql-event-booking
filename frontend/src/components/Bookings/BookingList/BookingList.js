import React from "react";
import "./BookingList.css";

const bookingList = (props) => {
  console.log(props);
  return (
    <ul className="bookings__list">
      {props.bookings.map((booking) => {
        return (
          <li key={booking._id} className="bookings__item" key={booking._id}>
            <div className="bookings__item-data">
              {booking.event.title} -
              {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            <div className="bookings__item-control">
              <button
                className="btn"
                onClick={props.onCancel.bind(this, booking._id)}
              >
                Cancel
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default bookingList;
