const db = require("../models");
const DepartmentModel = db.DepartmentModel;

//------- GET -------//
exports.department_get_all = async (req, res) => {
  try {
    const dataDepartment = await DepartmentModel.findAll();

    res.send(dataDepartment);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//


//------- DELETE -------//
