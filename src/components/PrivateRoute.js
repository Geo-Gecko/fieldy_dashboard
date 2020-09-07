import React from 'react';

import { Route } from 'react-router-dom';

const PrivateRoute = ({ children, ...props }) => {

    // call from auth-service
    const urlParams = new URLSearchParams(window.location.search)
    const x_token = urlParams.get("x-token")
    if (x_token) {
        localStorage.setItem("x-token", x_token);
        window.history.pushState({}, document.title, "/")
        return <Route {...props}>{children}</Route>;
    }

    if (localStorage.getItem('x-token')) {
        window.history.pushState({}, document.title, "/")
        return <Route {...props}>{children}</Route>;
    }
    // there is going to be a vulnerability here because we don't confirm if it's the actual token
    // but we can confirm that once we check for it in the backend.
    if (!localStorage.getItem('x-token')) {
        return <Route exact path="/" render={() => {
            // window.location works on GAE but not on local
            window.location = process.env.REACT_APP_AUTH_SERVICE_URL
            return null
        }} />
    }
    window.history.pushState({}, document.title, "/")
    return <Route {...props}>{children}</Route>;

};

export default PrivateRoute;
