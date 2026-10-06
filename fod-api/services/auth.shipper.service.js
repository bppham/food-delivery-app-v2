const Shipper = require("../models/shippers.model");
const Account = require("../models/accounts.model");
const Vehicle = require("../models/vehicles.model");
const ErrorCode = require("../constants/errorCodes.enum");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { createAndSaveOtp, verifyOtpAndGenerateResetToken } = require("../utils/otpHandling");
const mongoose = require("mongoose");
/**
 * 1️⃣ Đăng ký tài khoản Shipper mới
 */
const registerShipperService = async (payload) => {
  const {
    name,
    email,
    password,
    phonenumber,
    gender,
    vehicleNumber,
    vehicleType,
  } = payload;

  if (
    !name ||
    !email ||
    !password ||
    !phonenumber ||
    !gender ||
    !vehicleNumber ||
    !vehicleType
  ) {
    throw ErrorCode.MISSING_REQUIRED_FIELDS;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔍 Kiểm tra email trùng
    const existedEmail = await Shipper.findOne({ email }).session(session);
    if (existedEmail) throw ErrorCode.EMAIL_EXISTS;

    // 🧩 Tạo account
    const account = await Account.create([{ password }], { session });
    const accountId = account[0]._id;

    // 🚗 Tạo vehicle
    const vehicle = await Vehicle.create(
      [
        {
          vehicleNumber,
          vehicleType,
        },
      ],
      { session }
    );
    const vehicleId = vehicle[0]._id;

    // 👤 Tạo shipper
    const shipper = await Shipper.create(
      [
        {
          accountId,
          vehicleId,
          name,
          email,
          phonenumber,
          gender,
        },
      ],
      { session }
    );
    const shipperId = shipper[0]._id;

    await session.commitTransaction();
    session.endSession();

    // 🔁 Populate sau khi commit (ngoài transaction)
    return await Shipper.findById(shipperId)
      .populate("accountId")
      .populate("vehicleId")
      .populate("avatarImage");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Transaction failed:", error);
    throw error;
  }
};

/**
 * 2️⃣ Lấy thông tin profile Shipper
 */
const getProfileService = async (shipperId) => {
  if (!shipperId) throw ErrorCode.MISSING_REQUIRED_FIELDS;

  const shipper = await Shipper.findById(shipperId)
    .populate("accountId")
    .populate("vehicleId")
    .populate("avatarImage");

  if (!shipper) throw ErrorCode.SHIPPER_NOT_FOUND;

  return shipper;
};

/**
 * 3️⃣ Cập nhật profile Shipper
 */
const updateProfileService = async (shipperId, payload) => {
  if (!shipperId) throw ErrorCode.MISSING_REQUIRED_FIELDS;

  const shipper = await Shipper.findById(shipperId);
  if (!shipper) throw ErrorCode.SHIPPER_NOT_FOUND;

  // ❌ Không cho cập nhật email
  if (payload.email && payload.email !== shipper.email) {
    throw ErrorCode.EMAIL_UPDATE_NOT_ALLOWED;
  }

  // Cập nhật các field cơ bản từ payload
  if (payload.name) shipper.name = payload.name;
  if (payload.phonenumber) shipper.phonenumber = payload.phonenumber;
  if (payload.gender) shipper.gender = payload.gender;
  if (payload.avatarImage) shipper.avatarImage = payload.avatarImage;

  // Nếu có thông tin vehicle mới
  if (payload.vehicleNumber || payload.vehicleType || payload.vehicleColor) {
    let vehicle = null;

    // Nếu đã có vehicle → update
    if (shipper.vehicleId) {
      vehicle = await Vehicle.findById(shipper.vehicleId);
      if (!vehicle) throw ErrorCode.VEHICLE_NOT_FOUND;

      if (payload.vehicleNumber) vehicle.vehicleNumber = payload.vehicleNumber;
      if (payload.vehicleType) vehicle.vehicleType = payload.vehicleType;
      if (payload.vehicleColor) vehicle.vehicleColor = payload.vehicleColor;
      await vehicle.save();
    } else {
      // Nếu chưa có vehicle → tạo mới
      vehicle = await Vehicle.create({
        vehicleNumber: payload.vehicleNumber,
        vehicleType: payload.vehicleType,
        vehicleColor: payload.vehicleColor,
      });
      shipper.vehicleId = vehicle._id;
    }
  }

  await shipper.save();

  // Trả về shipper đầy đủ
  return await Shipper.findById(shipper._id)
    .populate("accountId")
    .populate("vehicleId")
    .populate("avatarImage");
};

/**
 * 4️⃣ Kiểm tra mật khẩu hiện tại
 */
const checkCurrentPasswordService = async (shipperId, currentPassword) => {
  if (!shipperId || !currentPassword) throw ErrorCode.MISSING_REQUIRED_FIELDS;

  const shipper = await Shipper.findById(shipperId).populate("accountId");
  if (!shipper) throw ErrorCode.SHIPPER_NOT_FOUND;

  const account = await Account.findById(shipper.accountId).select("+password");
  if (!account) throw ErrorCode.ACCOUNT_NOT_FOUND;

  const isMatch =
    typeof account.isPasswordMatched === "function"
      ? await account.isPasswordMatched(currentPassword)
      : false;

  return isMatch;
};

/**
 * 5️⃣ Cập nhật mật khẩu
 */
const updatePasswordService = async (
  shipperId,
  { currentPassword, newPassword }
) => {
  if (!shipperId || !currentPassword || !newPassword)
    throw ErrorCode.MISSING_REQUIRED_FIELDS;

  // Lấy shipper
  const shipper = await Shipper.findById(shipperId).populate("accountId");
  if (!shipper) throw ErrorCode.SHIPPER_NOT_FOUND;

  // Lấy account kèm password
  const account = await Account.findById(shipper.accountId).select("+password");
  if (!account) throw ErrorCode.ACCOUNT_NOT_FOUND;

  // Kiểm tra mật khẩu hiện tại
  const isMatch =
    typeof account.isPasswordMatched === "function"
      ? await account.isPasswordMatched(currentPassword)
      : false;

  if (!isMatch) throw ErrorCode.CURRENT_PASSWORD_INCORRECT;

  // Cập nhật mật khẩu mới
  account.password = newPassword;
  await account.save();

  return { success: true, message: "Cập nhật mật khẩu thành công" };
};
/**
 * 6️⃣ Quên mật khẩu (gửi OTP)
 */
const forgotPasswordService = async ({ email }) => {
  const shipper = await Shipper.findOne({ email });
  if (!shipper) throw ErrorCode.ACCOUNT_NOT_FOUND;

  const otp = await createAndSaveOtp(email, "shipper");

  const mailBody = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 10px;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Đặt lại mật khẩu</h2>
        </div>
        <div style="padding: 25px;">
          <p>Xin chào ${shipper.name},</p>
          <p>Mã OTP để đặt lại mật khẩu:</p>
          <h2 style="text-align:center; letter-spacing:4px;">${otp}</h2>
          <p>Mã này có hiệu lực trong <strong>2 phút</strong>.</p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Quên mật khẩu (Shipper)",
    html: mailBody,
  });

  return { success: true, message: "OTP đã được gửi đến email của bạn" };
};

/**
 * 7️⃣ Xác minh OTP
 */
const verifyOtpService = async ({ email, otp }) => {
  if (!email || !otp) throw ErrorCode.MISSING_REQUIRED_FIELDS;
  return await verifyOtpAndGenerateResetToken(email, otp, "shipper");
};

/**
 * 8️⃣ Reset mật khẩu bằng email (sau khi OTP hợp lệ)
 */
const resetPasswordWithEmailService = async ({ email, newPassword }) => {
  if (!email || !newPassword) throw ErrorCode.MISSING_REQUIRED_FIELDS;

  const shipper = await Shipper.findOne({ email });
  if (!shipper) throw ErrorCode.ACCOUNT_NOT_FOUND;

  const account = await Account.findById(shipper.accountId);
  if (!account) throw ErrorCode.ACCOUNT_NOT_FOUND;

  account.password = newPassword;
  await account.save();

  shipper.otp = null;
  shipper.otpExpires = null;
  await shipper.save();

  return { success: true, message: "Mật khẩu đã được đặt lại thành công" };
};


module.exports = {
  registerShipperService,
  getProfileService,
  updateProfileService,
  checkCurrentPasswordService,
  updatePasswordService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordWithEmailService,
};
