const db = require("../models");
const DriverModel = db.DriverModel
const ProjectModel = db.ProjectModel
const exceljs = require('exceljs')

//------- GET -------//
exports.driver_get_all_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("driver");
    sheet.columns = [
      { header: "DriverNumber", key: "driverNumber", width: 15 },
      { header: "PrefixName", key: "prefixName", width: 10 },
      { header: "FullName", key: "fullName", width: 25 },
      { header: "BirthDate", key: "birthDate", width: 15 },
      { header: "IDCard", key: "idCard", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "driverstatus", width: 15 },
      { header: "Project", key: "project", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataDriver = await DriverModel.findAll(
      {
        include: [{
          model: ProjectModel,
          attributes: ['project_name']
        }]
      }
    )

    dataDriver.map((item) => {
      sheet.addRow({
        driverNumber: item.driverNumber,
        prefixName: item.prefixName,
        fullName: item.fullName,
        birthDate: item.birthDate,
        idCard: item.idCard,
        phone: item.phone,
        driverstatus: item.status,
        project: item.project.project_name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    })

    const filename = `ข้อมูล driver`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataDriver.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }

  } catch (error) {
    console.log(error);
  }
}

exports.driver_get_all = async (req, res, next) => {
  try {
    const data = await DriverModel.findAll(
      {
        include: [{
          model: ProjectModel,
          attributes: ['project_name']
        }]
      }
    )

    const transformedData = []

    data.map((item) => {
      const dataindex = {
        "id": item.id,
        "driverNumber": item.driverNumber,
        "prefixName": item.prefixName,
        "name": item.name,
        "surName": item.surName,
        "fullName": item.fullName,
        "birthDate": item.birthDate,
        "idCard": item.idCard,
        "phone": item.phone,
        "status": item.status,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "projectId" : item.projectId,
        "project_name": item.project.project_name
      }
      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.driver_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await DriverModel.findOne(
      { 
        where: {id: get_id},
        include: [{
          model: ProjectModel,
          attributes: ['project_name']
        }]
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": data.id,
      "driverNumber": data.driverNumber,
      "prefixName": data.prefixName,
      "name": data.name,
      "surName": data.surName,
      "fullName": data.fullName,
      "birthDate": data.birthDate,
      "idCard": data.idCard,
      "phone": data.phone,
      "status": data.status,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,
      "projectId" : data.projectId,
      "project_name": data.project.project_name
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- POST -------//
exports.driver_post = async (req, res, next) => {
  try {
    const { driverNumber, prefixName, name, surName, fullName, birthDate, idCard, phone, status, projectId } = req.body
    await DriverModel.create({
      driverNumber: driverNumber,
      prefixName: prefixName,
      name: name,
      surName: surName,
      fullName: fullName,
      birthDate: birthDate,
      idCard: idCard,
      phone: phone,
      status: status,
      projectId: projectId
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.driver_put = async (req, res, next) => {
  try {
    const { driverNumber, prefixName, name, surName, fullName, birthDate, idCard, phone, status, projectId } = req.body
    const edit_id = req.params.id
    const data = await DriverModel.update({
      driverNumber: driverNumber,
      prefixName: prefixName,
      name: name,
      surName: surName,
      fullName: fullName,
      birthDate: birthDate,
      idCard: idCard,
      phone: phone,
      status: status,
      projectId: projectId
    }, { where: { id: edit_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- DELETE -------//
exports.driver_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await DriverModel.destroy(
      { where: { id: delete_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Delete Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}