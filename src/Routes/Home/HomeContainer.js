import React, { Component } from "react";
import HomePresenter from "./HomePresenter";

class HomeContainer extends Component {
  state = {
    something: null,
    loading: false,
    error: null,
    contents: ""
  };
  render() {
    const { something, loading, error, contents } = this.state;
    return (
      <HomePresenter
        something={something}
        loading={loading}
        error={error}
        contents={contents}
      />
    );
  }
}

export default HomeContainer;
