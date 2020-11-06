// @flow
import { gql, useQuery } from "@apollo/client";
import * as React from "react";
type Props = {};



export const Home = (props: Props) => {
  const { loading, error, data } = useQuery(EXERCISES);
  console.log(data);
  return <div></div>;
};
