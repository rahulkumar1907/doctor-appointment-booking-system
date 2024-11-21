import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/user.mjs";

const registerUser = async (req, res) => {
  try {
    // destructuring and trimming input values
    let { firstName, lastName, email, password } = req.body;

    // trim whitespace from all input fields
    firstName = firstName ? firstName.trim() : "";
    lastName = lastName ? lastName.trim() : "";
    email = email ? email.trim().toLowerCase() : "";
    password = password ? password.trim() : "";

    // validation checks
    if (!firstName) {
      return res.status(400).send({
        status: false,
        message: "first name is required",
      });
    }

    if (!lastName) {
      return res.status(400).send({
        status: false,
        message: "last name is required",
      });
    }

    if (!email) {
      return res.status(400).send({
        status: false,
        message: "email is required",
      });
    }

    // email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: false,
        message: "invalid email format",
      });
    }

    if (!password) {
      return res.status(400).send({
        status: false,
        message: "password is required",
      });
    }
    // password validation regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        status: false,
        message:
          "password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one special character, and one digit.",
      });
    }

    // check if the user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).send({
        status: false,
        message: "user already exists",
      });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the new user object
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    // save the new user to the database
    const createdUser = await userModel.create(newUser);

    // return success response
    return res.status(201).send({
      status: true,
      message: "user created successfully",
      data: createdUser,
    });
  } catch (error) {
    // handle any errors during the process
    console.log(error);
    return res.status(500).send({
      status: false,
      message: "internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email ? email.trim().toLowerCase() : "";
    password = password ? password.trim() : "";

    // validation checks

    if (!email) {
      return res.status(400).send({
        status: false,
        message: "email is required",
      });
    }

    // email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: false,
        message: "invalid email format",
      });
    }

    if (!password) {
      return res.status(400).send({
        status: false,
        message: "password is required",
      });
    }
    // password validation regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        status: false,
        message:
          "password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one special character, and one digit.",
      });
    }
    const user = await userModel.findOne({ email: email });
    if (!user)
      return res.status(400).send({ status: false, message: "user not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .send({ status: false, message: "invalid password" });
    // console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.setHeader("Authorization", `Bearer ${accessToken}`);
    // console.log(
    //   "process.env.JWT_REFRESH_SECRET",
    //   process.env.JWT_REFRESH_SECRET
    // );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.send({
      status: true,
      message: "user logged in successfully",
      access_token: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "internal server error" });
  }
};

const regenerateAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res
        .status(401)
        .send({ status: false, message: "no refresh token provided" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .send({ status: false, message: "invalid refresh token" });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).send({
        status: true,
        message: "access token generated successfully",
        access_token: newAccessToken,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser, regenerateAccessToken };
