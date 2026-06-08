import React, { useRef, useEffect } from 'react';
import swal from 'sweetalert';
import * as posenet from '@tensorflow-models/posenet';

const HEAD_TURN_THRESHOLD_MS = 3000; // FIXED: 5 seconds
const MIN_CONFIDENCE = 0.70;

const LOOKING_DOWN_MS = 2000;
const LOOKING_DOWN_BUFFER = 40;

const ALERT_COOLDOWN_MS = 10000; // 10 seconds between alerts

const Posenet = ({ onHeadMovement, faceDetected }) => {
  const canvasRef = useRef(null);

  const leftTurnStartRef = useRef(null);
  const rightTurnStartRef = useRef(null);
  const leftWarningShownRef = useRef(null);
  const rightWarningShownRef = useRef(null);
  const lookingDownStartRef = useRef(null);
  const lookingDownWarningShownRef = useRef(null);
  const lastAlertTimeRef = useRef(0); // Added for cooldown

  useEffect(() => {
    let posenetInterval = null;

    const runPosenet = async () => {
      const net = await posenet.load({
        architecture: 'ResNet50',
        quantBytes: 2,
        inputResolution: { width: 640, height: 480 },
        scale: 0.6,
      });

      posenetInterval = setInterval(() => {
        detect(net);
      }, 1000);
    };

    runPosenet();
    return () => {
      if (posenetInterval) clearInterval(posenetInterval);
    };
  }, []);

  const detect = async (net) => {
    const sharedVideoElement = document.querySelector(".detect video");
    if (sharedVideoElement && sharedVideoElement.readyState === 4) {
      try {
        const pose = await net.estimateSinglePose(sharedVideoElement);
        checkHeadTurn(pose['keypoints']);
      } catch (error) {
        console.error("PoseNet detection error:", error);
      }
    }
  };

  const checkHeadTurn = (keypoints) => {
    const nose = keypoints[0];
    const leftEar = keypoints[3];
    const rightEar = keypoints[4];
    const now = Date.now();

    const leftEye = keypoints[1];
    const rightEye = keypoints[2];

    // Gatekeeper: Reset timers if face is not detected
    if (!faceDetected || nose.score < MIN_CONFIDENCE) {
      leftTurnStartRef.current = null;
      rightTurnStartRef.current = null;
      leftWarningShownRef.current = false;
      rightWarningShownRef.current = false;
      return;
    }

    // // Looking Down Detection
    // if (leftEye.score > MIN_CONFIDENCE && rightEye.score > MIN_CONFIDENCE) {
    //   const avgEyeY = (leftEye.position.y + rightEye.position.y) / 2;
    //   if (nose.position.y > avgEyeY + LOOKING_DOWN_BUFFER) {
    //     if (!lookingDownStartRef.current) lookingDownStartRef.current = now;
    //     const elapsedDown = now - lookingDownStartRef.current;
    //     if (!lookingDownWarningShownRef.current && elapsedDown >= LOOKING_DOWN_MS) {
    //       lookingDownWarningShownRef.current = true;
    //       if (onHeadMovement) onHeadMovement();
    //       swal("Proctoring Violation!", "Looking down detected!", "warning");
    //     }
    //   } else {
    //     lookingDownStartRef.current = null;
    //     lookingDownWarningShownRef.current = false;
    //   }
    // }


    // FIXED: Lost Left Ear -> Turned LEFT
    if (leftEar.score < MIN_CONFIDENCE) {
      if (!leftTurnStartRef.current) leftTurnStartRef.current = now;
      const elapsedLeft = now - leftTurnStartRef.current;

      if (!leftWarningShownRef.current && elapsedLeft >= HEAD_TURN_THRESHOLD_MS) {
        leftWarningShownRef.current = true;
        if (onHeadMovement) onHeadMovement();
        swal({
          title: "Proctoring Violation!",
          text: "Head movement detected: You have been looking to your left for over 5 seconds!",
          icon: "warning",
          button: "Resume Exam",
          dangerMode: true,
        });
      }
    } else {
      leftTurnStartRef.current = null;
      leftWarningShownRef.current = false;
    }

    // FIXED: Lost Right Ear -> Turned RIGHT
    if (rightEar.score < MIN_CONFIDENCE) {
      if (!rightTurnStartRef.current) rightTurnStartRef.current = now;
      const elapsedRight = now - rightTurnStartRef.current;

      if (!rightWarningShownRef.current && elapsedRight >= HEAD_TURN_THRESHOLD_MS) {
        rightWarningShownRef.current = true;
        if (onHeadMovement) onHeadMovement();
        swal({
          title: "Proctoring Violation!",
          text: "Head movement detected: You have been looking to your right for over 5 seconds!",
          icon: "warning",
          button: "Resume Exam",
          dangerMode: true,
        });
      }
    } else {
      rightTurnStartRef.current = null;
      rightWarningShownRef.current = false;
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
          pointerEvents: "none"
        }}
      />
    </div>
  );
};

export default Posenet; 