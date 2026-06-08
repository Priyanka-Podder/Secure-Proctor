import React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchBar from "material-ui-search-bar";
import Chip from '@mui/material/Chip';
import axios from 'axios';

// Color logic for Exponential Decay Model
const getTrustScoreColor = (score) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 75) return '#8BC34A';
  if (score >= 60) return '#FFC107';
  if (score >= 45) return '#FF9800';
  return '#F44336';
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 's_no', numeric: false, label: 'S. No.' },
  { id: 'student_name', numeric: false, label: 'Name' },
  { id: 'student_email', numeric: false, label: 'Email' },
  { id: 'tab_change_count', numeric: true, label: 'Tab Moves' },
  { id: 'key_press_count', numeric: true, label: 'Keys Presses' },
  { id: 'head_movement_count', numeric: true, label: 'Head Moves' },
  { id: 'face_not_visible', numeric: false, label: 'Face Absence' },
  { id: 'multiple_faces_found', numeric: false, label: 'Multi-Face' },
  { id: 'mobile_found', numeric: false, label: 'Mobile' },
  { id: 'prohibited_object_found', numeric: false, label: 'Prohibited Objects' },
  { id: 'trust_score', numeric: true, label: 'Trust Score' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={(e) => onRequestSort(e, headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function LogsTable(props) {
  const [exam_code, setExamCode] = React.useState("");
  const [visibility, setVisibility] = React.useState(false);
  const [error_text, setErrorText] = React.useState("");
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('s_no');
  const [rows, setRows] = React.useState([]);
  const [TableData, setTableData] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searched, setSearched] = React.useState("");

  const getData = async () => {
    try {
      const response = await axios.post('/api/logs/allData', { exam_code: exam_code });
      const formatted = response.data.map((item, i) => ({
        s_no: i + 1,
        student_name: item.student_name,
        student_email: item.student_email,
        tab_change_count: item.tab_change_count || 0,
        key_press_count: item.key_press_count || 0,
        head_movement_count: item.head_movement_count || 0,
        face_not_visible: item.face_not_visible,
        multiple_faces_found: item.multiple_faces_found,
        mobile_found: item.mobile_found,
        prohibited_object_found: item.prohibited_object_found,
        trust_score: item.trust_score || 100
      }));
      setTableData(formatted);
      setRows(formatted);
      setVisibility(true);
      setErrorText("");
    } catch (err) {
      setErrorText("Invalid exam code or permission denied.");
      setVisibility(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <TextField label="Exam Code" value={exam_code} onChange={(e) => setExamCode(e.target.value)} />
      <button onClick={getData} className="btn blue" style={{ marginLeft: '10px' }}>Check Logs</button>
      <p style={{color:"red", textAlign:"center"}}>{error_text}</p>

      {visibility && (
        <Paper sx={{ width: '100%', mt: 3 }}>
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={(e, p) => { setOrder(order === 'asc' ? 'desc' : 'asc'); setOrderBy(p); }} />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.s_no}>
                    <TableCell>{row.s_no}</TableCell>
                    <TableCell>{row.student_name}</TableCell>
                    <TableCell>{row.student_email}</TableCell>
                    <TableCell align="right">{row.tab_change_count}</TableCell>
                    <TableCell align="right">{row.key_press_count}</TableCell>
                    <TableCell align="right">{row.head_movement_count}</TableCell>
                    <TableCell>{row.face_not_visible ? "Yes" : "No"}</TableCell>
                    <TableCell>{row.multiple_faces_found ? "Yes" : "No"}</TableCell>
                    <TableCell>{row.mobile_found ? "Yes" : "No"}</TableCell>
                    <TableCell>{row.prohibited_object_found ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Chip label={`${Math.round(row.trust_score)}%`} sx={{ backgroundColor: getTrustScoreColor(row.trust_score), color: 'white', fontWeight: 'bold' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[5, 10]} component="div" count={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} />
        </Paper>
      )}
    </Box>
  );
}