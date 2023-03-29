import './App.css';
import React, { useEffect, useCallback, useState } from "react";
import { useAuth } from "oidc-react";

function App() {
  const auth = useAuth();
  const isAuthenticated = auth.userData?.id_token ? true : false;
  const [message, setMessage] = useState(false);

  const accessSensitiveInformation = useCallback(async () => {
    try {
      if (!auth.isLoading) {
        const accessToken = auth.userData?.id_token;
        const sensitiveInformationURL = `${process.env.REACT_APP_API_ORIGIN}/api/protected`;
        const sensitiveDataResponse = await fetch(sensitiveInformationURL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        try {
          const res = await sensitiveDataResponse.json();
          setMessage(res.secretMessage);
        } catch (e) {
          //In case no access is given, the response will return 403 and not return a JSON response
          setMessage(sensitiveDataResponse.status);
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  }, [auth.isLoading, auth.userData?.id_token]);

  //If the user logs out, redirect them to the login page
  useEffect(() => {
    if (!auth.isLoading && !isAuthenticated) {
      auth.signIn();
    }
  });

  return (
    <div className="container">
      <div className="header">
        <div className="logo-container">
          <div className="logo"></div>
          <div className="brand-name"></div>
        </div>
      </div>

      <div className="user-controls">
        {isAuthenticated && (
          <>
            <div className="user-info">{auth.userData?.profile?.email}</div>
            <div className="seperator"></div>
            <div className="auth-button">
              <div onClick={() => auth.signOut("/")}>Log Out</div>
            </div>
          </>
        )}
        {!isAuthenticated && (
          <div className="auth-button">
            <div onClick={() => auth.signIn("/")}>Login</div>
          </div>
        )}
      </div>

      <div className="main">
        {isAuthenticated && (
          <>
            <div className="top-main">
              <div className="welcome-message">
                Welcome {auth.userData?.profile?.email}!
              </div>
              <div>
                {!message && (
                  <button
                    className="primary-button"
                    onClick={() => accessSensitiveInformation()}
                  >
                    Get Sensitive Resource
                  </button>
                )}
                <div className="message-container">
                  {message && message !== 403 && message !== 401 && (
                    <>
                      <div className="lottie"></div>
                      <div className="message">{message}</div>
                    </>
                  )}
                  {message && message === 401 && (
                    <>
                      <div className="sad-lottie"></div>
                      <div className="message">
                        No access to sensitive information
                      </div>
                    </>
                  )}
                  {message && message === 403 && (
                    <>
                      <div className="sad-lottie"></div>
                      <div className="message">
                        No access to sensitive information
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
