// @flow 
import { gql } from '@apollo/client';
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
    return (
        <div>
            
        </div>
    );
};