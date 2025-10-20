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
                        Use the search box in the sidebar to lookup a Twitter
                        username. If that username has been searched for before,
                        they will show up as a suggested result.
                    </p>
                    <p>
                        This site is open source. Check it out on{" "}
                        <a
                            href="https://github.com/Kangaroux/imgtweets"
                            target="_blank"
                        >
                            Github
                        </a>
                        .
                    </p>
                    <p className="disclaimer">
                        Disclaimer: imgtweets.com is not affiliated with or
                        endorsed by Twitter, Inc.
                    </p>
                </div>
            </div>
        </div>
    );
};
