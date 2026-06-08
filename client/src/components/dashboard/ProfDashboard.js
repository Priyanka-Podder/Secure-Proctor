import React, { useState } from "react";
import PropTypes from "prop-types";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import swal from 'sweetalert';
import { logoutUser } from "../../actions/authActions";
import LogsTable from "./LogsTable.js";
import { connect } from "react-redux";
import axios from "axios";
import ExamHistoryTable from "./ExamHistoryTable.js";
import ExamHistoryModal from "./ExamHistoryModal.js";

function ProfDashboard(props) {
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [exam_link, setExamLink] = useState("");
  const [date_time_start, setDateTimeStart] = useState(new Date());
  const [duration, setDuration] = useState(0);
  const [exam_code, setExamCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [exam_code_search, setExamCodeSearch] = useState("");
  
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedExamCode, setSelectedExamCode] = useState("");

  const toLocalISOString = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  function openExamDialog(){ setExamDialogOpen(true); }

  function closeExamDialog(){
      setName(""); setExamLink(""); setDateTimeStart(new Date());
      setDuration(0); setExamCode(""); setErrorText(""); setExamDialogOpen(false);
  }

  function handleViewLogs(exam_code, exam_id){
      setSelectedExamCode(exam_code);
      setLogsModalOpen(true);
  }

  function closeLogsModal(){
      setLogsModalOpen(false);
      setSelectedExamCode("");
  }

  function isUrl(s) {
      var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
  }
  
  function createExam(){
      if(name===""){ setErrorText("Name of Exam cannot be empty"); return; }
      if(exam_link===""){ setErrorText("Exam Link cannot be empty"); return; }
      if(!isUrl(exam_link)){ setErrorText("Exam Link must be a valid url"); return; }
      if(Number(duration) <= 0){ setErrorText("Duration must be greater than 0 minutes"); return; }
      if(exam_code===""){ setErrorText("Click Generate exam code first"); return; }
      
      var current_date_time = new Date();
      if(date_time_start < current_date_time){
        setErrorText("Please select a date and time of the future");
        return;
      }

      axios.post('/api/exams/createExam', {
          name: name,
          exam_link: exam_link,
          date_time_start: date_time_start,
          duration: duration,
          exam_code: exam_code,
          prof_email: props.auth.user.email,
        })
        .then(() => {
          swal("Exam has been created. Please share access code with students.");
          closeExamDialog();
        })
        .catch(() => swal("Some error occurred in creating the exam"));
  }

  function generateCode(){
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for ( var i = 0; i < 5; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setExamCode(result);
      navigator.clipboard.writeText(result);
  }
  
  return (
      <div style={{ height: "100%"}} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Hey there,</b> {props.auth.user.name ? props.auth.user.name.split(" ")[0] : "Professor"}
            </h4>
            
            {/* <Button variant="contained" color="primary" onClick={openExamDialog} style={{marginRight: "10px"}}>Create Exam</Button>
            <Button variant="contained" color="secondary" onClick={props.logoutUser}>Logout</Button>
            
            <br/><br/> */}

             <button
              style={{
                width: "200px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem"
              }}
              onClick={openExamDialog}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Create Exam
            </button>
            <button
              style={{
                width: "200px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginLeft:"10px",
                marginTop: "1rem"
              }}
              onClick={props.logoutUser}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>
            <br/>
            <br/>
            
            <ExamHistoryTable 
              prof_email={props.auth.user.email} 
              onViewLogs={handleViewLogs} 
            />

            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid #ccc" }}>
              <h5>Alternative: Search Exam by Code</h5>
              <LogsTable exam_code={exam_code_search} prof_email={props.auth.user.email}/>
            </div>
            
            <ExamHistoryModal
              open={logsModalOpen}
              exam_code={selectedExamCode}
              prof_email={props.auth.user.email}
              onClose={closeLogsModal}
            />
            
            <Dialog open={examDialogOpen} onClose={closeExamDialog} aria-labelledby="form-dialog-title" style={{ padding: '10px' }}>
              <DialogTitle id="form-dialog-title">Create Exam</DialogTitle>
              <DialogContent style={{ padding: "30px" }}>
                <DialogContentText>Enter details for the exam. Press Generate to get an exam code.</DialogContentText>
                <TextField autoFocus margin="dense" variant="standard" label="Exam Name" fullWidth value={name} onChange={(e)=>setName(e.target.value)} />
                <TextField label="Exam Link" margin="dense" variant="standard" fullWidth value={exam_link} onChange={(e)=> setExamLink(e.target.value)} />
                <TextField label="Start Date and Time" type="datetime-local" fullWidth variant="standard" margin="dense" value={toLocalISOString(date_time_start)} onChange={(e) => setDateTimeStart(e.target.value ? new Date(e.target.value) : "")} InputLabelProps={{ shrink: true }} />
                <TextField label="Exam duration (minutes)" type="number" margin="dense" variant="standard" value={duration} onChange={(e)=> setDuration(e.target.value)} inputProps={{ min: 1 }} />
                <TextField label="Exam Code" margin="dense" variant="standard" fullWidth value={exam_code} disabled={true} />
                <p style={{ color: "red" }}>{errorText}</p>
                <Button onClick={generateCode}>Generate Exam Code</Button>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeExamDialog} color="secondary">Close</Button>
                <Button onClick={createExam} color="primary">Save</Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </div>
    );
}

ProfDashboard.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, { logoutUser })(ProfDashboard);