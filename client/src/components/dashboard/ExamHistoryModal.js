import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import LogsTable from './LogsTable';

function ExamHistoryModal(props) {
  const { open, exam_code, prof_email, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Student Logs - Exam Code: {exam_code}</DialogTitle>
      <DialogContent>
        {exam_code && prof_email ? (
          <LogsTable 
            exam_code={exam_code} 
            prof_email={prof_email}
          />
        ) : (
          <Box p={3} textAlign="center">Loading logs...</Box>
        )}
      </DialogContent>
      <Box p={2} display="flex" justifyContent="flex-end">
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

export default ExamHistoryModal;