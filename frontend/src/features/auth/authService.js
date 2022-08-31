import axios from 'axios';

const API_URL = 'api/auth/';

// register user
const register = async (userData) => {
    const res = await axios.post(API_URL, userData);

    if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
    }

    return res.data;
};

// login user
const login = async (userData) => {
    const res = await axios.post(API_URL + 'login', userData);

    if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
    }

    return res.data;
};

// google login
const google = async () => {
    return await axios.get(API_URL + 'google');
};

// logout user
const logout = () => {
    localStorage.removeItem('user');
};

const authService = { register, login, logout, google };
export default authService;
