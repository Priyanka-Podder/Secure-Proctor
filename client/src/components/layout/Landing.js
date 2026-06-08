import React, { Component } from "react";
import { Link } from "react-router-dom";


class Landing extends Component {
  render() {
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Maintain academic integrity</b> during your online assessments.
            </h4>
            <p className="flow-text grey-text text-darken-1">
              Create an exam, share a unique code with your students and 
              monitor their progress in real-time. It's that simple!
            </p>
            <br />
            
            {/* Button Container */}
            <div className="row">
              <div className="col s12">
                <Link
                  to="/register"
                  style={{
                    width: "160px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginRight: "10px"
                  }}
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Register
                </Link>
                
                <Link
                  to="/login"
                  style={{
                    width: "160px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginLeft: "10px"
                  }}
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;