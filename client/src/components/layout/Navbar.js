import React from "react";
import { Link } from "react-router-dom";

import LiveIcon from "../../image.png";

/**
 * Creates the navbar that sticks to the top and is present on
 * all pages
 */
export default function Navbar() {
  return (
    <div className="navbar-fixed" >
    <nav className="z-depth-0" >
      <div className="nav-wrapper white" >

        <Link
            to="/"
            style={{
              fontFamily: "lora, serif",
            }}
            className="col s5 brand-logo center black-text"
          >
            {/* 2. Use the imported image instead of the material-icon */}
            <img 
              src={LiveIcon} 
              alt="Live Monitor" 
              style={{ 
                width: '32px', 
                height: '32px', 
                marginRight: '10px', 
                verticalAlign: 'middle' 
              }} 
            />
            Online Exam Monitoring System
          </Link>

       
      </div>
    </nav>
  </div>
  );
}
