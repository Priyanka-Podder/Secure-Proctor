import React from "react";
import swal from 'sweetalert';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./Detections.css";

/**
 * This is the object detection class which uses webcam input 
 * feed and runs coco-ssd model for object detection
 */
export default class Detection extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      lastCellPhoneAlertTime: 0, // NEW: Debounce cell phone detection
      lastProhibitedAlertTime: 0, // NEW: Debounce prohibited object detection
      personDetected: false, // NEW: Track if person visible
    };
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: 800,
            height: 400
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });

      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      if (this.canvasRef.current) {
        this.renderPredictions(predictions);
        requestAnimationFrame(() => {
          this.detectFrame(video, model);
        });
      } else {
        return false;
      }
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";

    // Draw bounding boxes
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt("16px sans-serif", 10);
      ctx.fillRect(x, y, textWidth + 8, textHeight + 8);
    });

    // Draw labels
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      ctx.fillStyle = "#000000";

      if (
        prediction.class === "person" ||
        prediction.class === "cell phone" ||
        prediction.class === "book" ||
        prediction.class === "laptop"
      ) {
        ctx.fillText(prediction.class, x, y);
      }
    });

    // NEW: Process detections with debouncing and face presence check
    let personFound = false;
    let cellPhoneFound = false;
    let prohibitedObjectFound = false;
    const now = Date.now();
    const ALERT_DEBOUNCE_MS = 3000; // Wait 3 seconds before next alert of same type

    for (let i = 0; i < predictions.length; i++) {
      const prediction = predictions[i];

      if (prediction.class === "person") {
        personFound = true;
        this.setState({ count: 0, personDetected: true });
      }

      // NEW: Only alert if person is present AND confidence is high
      if (prediction.class === "cell phone" && personFound && prediction.score > 0.5) {
        cellPhoneFound = true;

        // NEW: Debounce - don't alert if we alerted in last 3 seconds
        if (now - this.state.lastCellPhoneAlertTime > ALERT_DEBOUNCE_MS) {
          this.props.MobilePhone();
          swal("Cell Phone Detected", "Action has been Recorded", "error");
          this.setState({ lastCellPhoneAlertTime: now });
        }
      }

      if (
        (prediction.class === "book" || prediction.class === "laptop") &&
        personFound &&
        prediction.score > 0.6
      ) {
        prohibitedObjectFound = true;

        // NEW: Debounce - don't alert if we alerted in last 3 seconds
        if (now - this.state.lastProhibitedAlertTime > ALERT_DEBOUNCE_MS) {
          this.props.ProhibitedObject();
          swal("Prohibited Object Detected", "Action has been Recorded", "error");
          this.setState({ lastProhibitedAlertTime: now });
        }
      }
    }

    // Face not visible logic
    if (predictions.length === 0) {
      if (this.state.count < 50) {
        this.setState(prevState => ({ count: prevState.count + 1 }));
      } else {
        this.setState({ count: 0, personDetected: false });
        swal("Face Not Visible", "Action has been Recorded", "error");
        this.props.FaceNotVisible();
      }
    }

    // NEW: Multiple people detection (face count)
    let faceCount = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class === "person") {
        faceCount += 1;
      }
    }

    if (faceCount > 1) {
      this.props.MultipleFacesVisible();
      swal(faceCount.toString() + " people detected", "Action has been recorded", "error");
    }
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="800"
          height="400"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="800"
          height="400"
        />
      </div>
    );
  }
} 

