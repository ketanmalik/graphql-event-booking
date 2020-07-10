import React from "react";
import { NavLink } from "react-router-dom";
import "./MainNavigation.css";

const mainNavigation = (props) => {
  return (
    <header className="main-navigation">
      <div className="main-navigation__logo">
        <h1>EasyEvents</h1>
      </div>
      <nav className="main-navigation__item">
        <ul>
          <li>
            <NavLink to="/events">Events</NavLink>
          </li>
          <li>
            <NavLink to="/Bookings">Bookings</NavLink>
          </li>
          <li>
            <NavLink to="/auth">Authenticate</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default mainNavigation;
