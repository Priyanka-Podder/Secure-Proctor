const express = require("express");
const router = express.Router();
const Logs = require("../../models/Logs");

// Helper function to calculate Trust Score using Exponential Decay Model
const calculateTrustScore = (logData) => {
    // V_i: Frequencies of occurrences
    const V = {
        mobile: logData.mobile_detection_count || (logData.mobile_found ? 1 : 0),
        face_absent: logData.face_absence_count || (logData.face_not_visible ? 1 : 0),
        head_move: logData.head_movement_count || 0,
        tab_change: logData.tab_change_count || 0,
        key_press: logData.key_press_count || 0,
        prohibited: logData.prohibited_object_count || (logData.prohibited_object_found ? 1 : 0),
        multi_face: logData.multiple_faces_count || (logData.multiple_faces_found ? 1 : 0)
    };

    // W_i: Severity weights as defined in your paper
    const W = {
        mobile: 0.8,
        face_absent: 0.7,
        head_move: 0.2,
        tab_change: 0.3,
        key_press: 0.1,
        prohibited: 0.5,
        multi_face: 1.0
    };

    // Calculate sum of (W_i * V_i)
    const sum = (V.mobile * W.mobile) + 
                (V.face_absent * W.face_absent) + 
                (V.head_move * W.head_move) + 
                (V.tab_change * W.tab_change) + 
                (V.key_press * W.key_press) + 
                (V.prohibited * W.prohibited) + 
                (V.multi_face * W.multi_face);

    // Apply exponential decay formula: Ts = 100 * e^(-0.1 * sum)
    const trustScore = 100 * Math.exp(-0.1 * sum);
    
    return Math.round(trustScore);
};

// Route: Update logs (used by exam window every second)
router.post("/update", (req, res) => {
    Logs.findOneAndUpdate(
        { exam_code: req.body.exam_code, student_email: req.body.student_email }, 
        req.body, 
        { upsert: true, new: true }, 
        (err, doc) => {
            if (err) return res.status(400).json("Error Occurred");
            return res.status(200).json("Success");
        }
    );
});

// Route: Get log for specific student (start exam check)
router.get("/logByEmail", (req, res) => {
    const { exam_code, student_email } = req.query;
    
    Logs.findOne({ exam_code, student_email }).then(log => {
        if (!log) {
            return res.status(400).json("Student Taking exam for the first time");
        }
        const logObj = log.toObject();
        logObj.trust_score = calculateTrustScore(logObj);
        return res.status(200).json(logObj);
    });
});

// Route: Get all student data for the given exam (for dashboard)
router.post("/allData", (req, res) => {
    Logs.find({ exam_code: req.body.exam_code }, (err, docs) => {
        if (err) return res.status(400).json("Error Occurred");

        const docsWithScore = docs.map(doc => {
            const docObj = doc.toObject();
            docObj.trust_score = calculateTrustScore(docObj);
            return docObj;
        });

        return res.status(200).json(docsWithScore);
    });
});

module.exports = router;