import React from 'react';
import {useGithubUser} from "../api/github.api";
import Box from "@mui/material/Box";

const ReactQueryExample = () => {
    const { isLoading, error, data } = useGithubUser();

    if (isLoading) return (
        <Box>
            Loading...
        </Box>
    );
    if (error) console.log('An error occurred while fetching the user data ', error);

    return (
        <div>
            Loaded
            <h1>{data?.name}</h1>
        </div>
    );
};

export default ReactQueryExample;
