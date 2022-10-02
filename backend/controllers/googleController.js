const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const googleService = require('../lib/googleService');
const User = require('../models/User');

const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const urlGoogle = (req, res) => {
    res.send(googleService.getGoogleAuthURL());
};

const loginGoogle = asyncHandler(async (req, res) => {
    const { code } = req.body;

    // eslint-disable-next-line camelcase
    const { id_token, access_token } = await googleService.getTokens(code);
    const data = await googleService.fetchUser(id_token, access_token);

    if (data && !data.verified_email) {
        res.status(401);
        throw new Error('User not verified');
    }

    const userExists = await User.findOne({ email: data.email });

    if (userExists) {
        return res.status(201).json({
            token: generateJWT(userExists._id),
            name: userExists.name,
            image_url: userExists.image_url
        });
    }

    const user = await User.create({
        email: data.email,
        name: data.name,
        image_url: data.picture,
        verified_email: data.verified_email
    });

    if (user) {
        return res.status(201).json({
            token: generateJWT(user._id),
            name: user.name,
            image_url: user.image_url
        });
    }

    res.status(500);
    throw new Error('Error creating user');
});

module.exports = { loginGoogle, urlGoogle };
