import "./Help.scss";

export const Help = () => {
    return (
        <div className="help-container">
            <div className="help-content-outer">
                <div className="help-content">
                    <h1>imgtweets</h1>
                    <p>
                        <strong>imgtweets</strong> lets you easily view images
                        that a user has posted to their timeline.
                    </p>
                    <p>
                        Start by opening the sidebar to the left and entering a
                        Twitter username in the search box. If someone has
                        searched for that user already, they will show up as a
                        suggestion.
                    </p>
                    <p>
                        This site is open source. Check it out on{" "}
                        <a
                            href="https://github.com/Kangaroux/twitter-image-viewer"
                            target="_blank"
                        >
                            Github
                        </a>
                        .
                    </p>
                    <p className="disclaimer">
                        <strong>Disclaimer:</strong> imgtweets.com is not
                        affiliated with or endorsed by Twitter, Inc.
                    </p>
                </div>
            </div>
        </div>
    );
};
