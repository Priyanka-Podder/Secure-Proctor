import axios from "axios";

/**
 * Action to fetch all exams created by a specific professor
 * @param {string} profEmail - Professor's email
 */
export const fetchAllExamsByProf = (profEmail) => (dispatch) => {
    return axios
        .get(`/api/exams/allExamsByProf?prof_email=${profEmail}`)
        .then(response => {
            dispatch({
                type: "FETCH_EXAMS_SUCCESS",
                payload: response.data
            });
            return response.data;
        })
        .catch(error => {
            dispatch({
                type: "FETCH_EXAMS_ERROR",
                payload: error.response?.data || "Error fetching exams"
            });
            throw error;
        });
};