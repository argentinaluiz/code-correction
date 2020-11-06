// @flow 
import { gql, useQuery } from '@apollo/client';
import * as React from 'react';
type Props = {
    
};

const EXERCISES = gql`
query {
    exercises {
     name, params {name, defaultValue, description}
    }
}
`

export const Home = (props: Props) => {
    const { loading, error, data } = useQuery(EXERCISES);
    return (
        <div>
            
        </div>
    );
};