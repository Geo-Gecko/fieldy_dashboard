import axios from 'axios';

const baseURL = process.env.REACT_APP_SH_BACKEND_URL;
const timeout = 60000;
let token = localStorage.getItem('x-token');

// this accounts for missing storage item on first login
// const urlParams = new URLSearchParams(window.location.search)
// let url_token = urlParams.get("x-token")
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MTE2NDMxOGVhZWY5MTAwMGFkY2ZlYWMiLCJ1c2VyVHlwZSI6IlZJRVdFUiIsIm1lbWJlck9mIjoiNjExNjQyMDdlYWVmOTEwMDBhZGNmZWFiIiwiYXBpVXNlciI6ZmFsc2UsInBheW1lbnRMZXZlbHMiOiJTRUNPTkQgTEVWRUwiLCJpYXQiOjE2NDgwMzg3MTJ9.Q3-8YIiR69u7FoZ4q40EBb8F5mdYoHNlICyOuyHIYTA"
const headers = token
  ? {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  } : {
    'Content-Type': 'application/json',
  };

const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers,
});

export default axiosInstance;
