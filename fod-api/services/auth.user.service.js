const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createAndSaveOtp, verifyOtpAndGenerateResetToken } = require("../utils/otpHandling");
const User = require("../models/users.model");
const Store = require("../models/stores.model");
const sendEmail = require("../utils/sendEmail");
const ErrorCode = require("../constants/errorCodes.enum");

// 🔑 Token generators
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
};

// 📌 Register a new user
const registerUser = async ({ name, email, phonenumber, gender, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ErrorCode.ACCOUNT_ALREADY_EXISTED;

  const newUser = await User.create({
    name,
    email,
    phonenumber,
    gender,
    password,
    isGoogleLogin: false,
  });

  return { response: newUser };
};

// 📌 Login user
const loginUser = async ({ email, password, getRole = false, getStore = false }) => {
  if (!email || !password) throw ErrorCode.VALIDATION_ERROR;

  const user = await User.findOne({ email });
  if (!user) throw ErrorCode.ACCOUNT_NOT_FOUND;

  const account = await Account.findById(user.accountId)
  const isMatch = await account.isPasswordMatched(oldPassword);
  if (!isMatch) throw ErrorCode.INVALID_CREDENTIALS;

  // Generate tokens
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  const store = await Store.findOne({
    $or: [{ owner: user._id }, { staff: user._id }],
  }).select("_id name owner");

  const response = {
    _id: user._id,
    token: generateAccessToken(user._id),
    ...(getRole && { role: user.role }),
    ...(getStore && store && { storeId: store._id, ownerId: store.owner }),
  };

  return { response, refreshToken };
};

// 📌 Refresh token
const refreshTokenService = async ({ refreshToken }) => {
  if (!refreshToken) throw ErrorCode.ACCESS_TOKEN_NOT_FOUND;

  const user = await User.findOne({ refreshToken });
  if (!user) throw ErrorCode.INVALID_REFRESH_TOKEN;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded || decoded.id !== user.id) throw ErrorCode.REFRESH_TOKEN_EXPIRE;

    const accessToken = generateAccessToken(user._id);
    return { response: { accessToken } };
  } catch (err) {
    throw ErrorCode.REFRESH_TOKEN_EXPIRE;
  }
};

// 📌 Logout user
const logoutUser = async ({ refreshToken }) => {
  if (!refreshToken) throw ErrorCode.ACCESS_TOKEN_NOT_FOUND;

  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  return { response: { success: true } };
};

// 📌 Forgot password (OTP via email)
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email, isGoogleLogin: false });
  if (!user) throw ErrorCode.ACCOUNT_NOT_FOUND;

  const otp = await createAndSaveOtp(email, "user");

  const mailBody = `
    <p>Mã OTP của bạn là: ${otp}</p>
    <p>Vui lòng nhập mã này để đặt lại mật khẩu. OTP sẽ hết hạn trong 2 phút.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Forgot Password OTP",
    html: mailBody,
  });

  return { response: { success: true, message: "OTP sent successfully" } };
};

// 📌 Verify OTP
const verifyOtp = async ({ email, otp }) => {
  if (!email || !otp) throw ErrorCode.MISSING_REQUIRED_FIELDS;
  return await verifyOtpAndGenerateResetToken(email, otp, "user");
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenService,
  logoutUser,
  forgotPassword,
  verifyOtp,
};
