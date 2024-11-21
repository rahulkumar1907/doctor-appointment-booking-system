import doctorModel from "../model/doctor.mjs";

const createDoctor = async (req, res) => {
  try {
    // destructuring and trimming input values
    let { name, specialization } = req.body;

    // Trim whitespace from all input fields
    name = name ? name.trim() : "";
    specialization = specialization ? specialization.trim() : "";

    // validation checks
    if (!name) {
      return res.status(400).send({
        status: false,
        message: "name is required",
      });
    }

    if (!specialization) {
      return res.status(400).send({
        status: false,
        message: "specialization is required",
      });
    }

    // check if doctor with the same name already exists
    const doctorExists = await doctorModel.findOne({ name });
    if (doctorExists) {
      return res.status(400).send({
        status: false,
        message: `doctor with name ${name} already exists`,
      });
    }

    // create the new doctor object
    const newDoctor = {
      name,
      specialization,
    };

    // save the new doctor
    const createdDoctor = await doctorModel.create(newDoctor);

    // return success response
    return res.status(201).send({
      status: true,
      message: "doctor created successfully",
      data: createdDoctor,
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

export { createDoctor };
