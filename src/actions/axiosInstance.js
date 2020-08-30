import axios from 'axios';

const baseURL = process.env.REACT_APP_SH_BACKEND_URL;
const timeout = 60000;
const headers = {
    'Content-Type': 'application/json',
  };

const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers,
});

export default axiosInstance;
