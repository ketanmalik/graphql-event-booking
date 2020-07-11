import React, { Component } from "react";
import AuthContext from "../context/auth-context";
import "./Auth.css";

class AuthPage extends Component {
  state = {
    isLogin: true,
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailElem = React.createRef();
    this.passwordElem = React.createRef();
  }

  submitHandler = (event) => {
    event.preventDefault();
    const email = this.emailElem.current.value;
    const password = this.passwordElem.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
            query {
                login(email:"${email}", password:"${password}") {
                    userId
                    token
                    tokenExpiration
                }
            }
          `,
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
                mutation {
                  createUser(userInput: {email: "${email}", password: "${password}"}) {
                    _id
                    email
                  }
                }
              `,
      };
    }

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  switchModeHandler = () => {
    this.setState((prevState) => {
      return { isLogin: !prevState.isLogin };
    });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <div>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" ref={this.emailElem} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" ref={this.passwordElem} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
