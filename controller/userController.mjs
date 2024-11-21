import bcrypt from "bcryptjs";
import userModel from "../model/User.mjs";

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
          "Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one special character, and one digit.",
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
    console.error(error);
    return res.status(500).send({
      status: false,
      message: "internal server error",
    });
  }
};

export { registerUser };
