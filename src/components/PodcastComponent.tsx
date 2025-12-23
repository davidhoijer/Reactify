import React from 'react';
import Box from "@mui/material/Box";

interface PodcastComponentProps { }

const PodcastComponent: React.FC<PodcastComponentProps> = () => {
    return (
        <Box>
            <Box className="podcast-info">
                <h2 className="podcast-title">A Podcast is Currently Playing</h2>
                <p className="podcast-message">
                    Enjoy your podcast! Details will be displayed here once available.
                </p>
            </Box>
        </Box>
    );
};

export default PodcastComponent;
