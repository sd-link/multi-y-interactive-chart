import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import LineChart from "../../Components/LineChart";
import dummyData from "../../Data/dummy_data.json";

const Conatiner = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1``;

const HomePresenter = ({ something, loading, error, contents }) => (
  <Conatiner>
    <Title>{contents}</Title>
    <LineChart
      data={dummyData}
      onRangeChanged={e => {
        /* NOTE: update data by range (start, end) */
        // const {start, end} = e;
        console.log("onRangeChanged", e);
      }}
    />
  </Conatiner>
);

HomePresenter.prototype = {
  something: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  contents: PropTypes.string
};

export default HomePresenter;
