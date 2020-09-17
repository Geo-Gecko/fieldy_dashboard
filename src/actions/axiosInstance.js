import axios from 'axios';

const baseURL = process.env.REACT_APP_SH_BACKEND_URL;
const timeout = 60000;
let token = localStorage.getItem('x-token');

// this accounts for missing storage item on first login
const urlParams = new URLSearchParams(window.location.search)
let url_token = urlParams.get("x-token")
token = token ? token : url_token
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
