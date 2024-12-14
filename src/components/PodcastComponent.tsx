import React from 'react';

interface PodcastComponentProps { }

const PodcastComponent: React.FC<PodcastComponentProps> = () => {
    return (
        <div>
            <div className="podcast-info">
                <h2 className="podcast-title">A Podcast is Currently Playing</h2>
                <p className="podcast-message">
                    Enjoy your podcast! Details will be displayed here once available.
                </p>
            </div>
            <div className="podcast-placeholder">
                <img
                    src="/placeholder-podcast.png" // Replace with your placeholder image URL
                    alt="Podcast Placeholder"
                    className="podcast-image"
                />
            </div>
        </div>
    );
};

export default PodcastComponent;
