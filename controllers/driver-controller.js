const db = require("../models");
const DriverModel = db.DriverModel
const ProjectModel = db.ProjectModel
const exceljs = require('exceljs')
const Sequelize = require("sequelize");
const { Op, literal, query, fn, col } = require('sequelize');

//------- GET -------//
exports.driver_get_all_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("driver");
    sheet.columns = [
      { header: "DriverNumber", key: "driverNumber", width: 15 },
      { header: "PrefixName", key: "prefixName", width: 10 },
      { header: "Name", key: "name", width: 15 },
      { header: "SurName", key: "surName", width: 15 },
      { header: "FullName", key: "fullName", width: 25 },
      { header: "BirthDate", key: "birthDate", width: 15 },
      { header: "StartDate", key: "start_date", width: 15 },
      { header: "ResignationDate", key: "resignation_date", width: 15 },
      { header: "IDCard", key: "idCard", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataDriver = await DriverModel.findAll()

    dataDriver.map((item) => {
      sheet.addRow({
        driverNumber: item.driverNumber,
        prefixName: item.prefixName,
        name: item.name,
        surName: item.surName,
        fullName: item.fullName,
        birthDate: item.birthDate,
        start_date: item.start_date,
        resignation_date: item.resignation_date,
        idCard: item.idCard,
        phone: item.phone,
        status: item.status,
        role: item.role,
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
exports.driver_get_all_active_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("driver");
    sheet.columns = [
      { header: "DriverNumber", key: "driverNumber", width: 15 },
      { header: "PrefixName", key: "prefixName", width: 10 },
      { header: "Name", key: "name", width: 15 },
      { header: "SurName", key: "surName", width: 15 },
      { header: "FullName", key: "fullName", width: 25 },
      { header: "BirthDate", key: "birthDate", width: 15 },
      { header: "StartDate", key: "start_date", width: 15 },
      { header: "ResignationDate", key: "resignation_date", width: 15 },
      { header: "IDCard", key: "idCard", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataDriver = await DriverModel.findAll(
      { where: { status: 'ทำงาน' }}
    )

    dataDriver.map((item) => {
      sheet.addRow({
        driverNumber: item.driverNumber,
        prefixName: item.prefixName,
        name: item.name,
        surName: item.surName,
        fullName: item.fullName,
        birthDate: item.birthDate,
        start_date: item.start_date,
        resignation_date: item.resignation_date,
        idCard: item.idCard,
        phone: item.phone,
        status: item.status,
        role: item.role,
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
exports.driver_get_all_withoutnoinfo_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("driver");
    sheet.columns = [
      { header: "DriverNumber", key: "driverNumber", width: 15 },
      { header: "PrefixName", key: "prefixName", width: 10 },
      { header: "Name", key: "name", width: 15 },
      { header: "SurName", key: "surName", width: 15 },
      { header: "FullName", key: "fullName", width: 25 },
      { header: "BirthDate", key: "birthDate", width: 15 },
      { header: "StartDate", key: "start_date", width: 15 },
      { header: "ResignationDate", key: "resignation_date", width: 15 },
      { header: "IDCard", key: "idCard", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataDriver = await DriverModel.findAll(
      { where: { 
        status: {
          [Op.ne]: null // เลือกเฉพาะค่าที่ไม่ใช่ NULL
        },
      }}
    )

    dataDriver.map((item) => {
      sheet.addRow({
        driverNumber: item.driverNumber,
        prefixName: item.prefixName,
        name: item.name,
        surName: item.surName,
        fullName: item.fullName,
        birthDate: item.birthDate,
        start_date: item.start_date,
        resignation_date: item.resignation_date,
        idCard: item.idCard,
        phone: item.phone,
        status: item.status,
        role: item.role,
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
exports.driver_get_all_only_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("driver");
    sheet.columns = [
      { header: "DriverNumber", key: "driverNumber", width: 15 },
      { header: "PrefixName", key: "prefixName", width: 10 },
      { header: "Name", key: "name", width: 15 },
      { header: "SurName", key: "surName", width: 15 },
      { header: "FullName", key: "fullName", width: 25 },
      { header: "BirthDate", key: "birthDate", width: 15 },
      { header: "StartDate", key: "start_date", width: 15 },
      { header: "ResignationDate", key: "resignation_date", width: 15 },
      { header: "IDCard", key: "idCard", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataDriver = await DriverModel.findAll(
      { where: { role: 'พนักงานขับรถ' }}
    )

    dataDriver.map((item) => {
      sheet.addRow({
        driverNumber: item.driverNumber,
        prefixName: item.prefixName,
        name: item.name,
        surName: item.surName,
        fullName: item.fullName,
        birthDate: item.birthDate,
        start_date: item.start_date,
        resignation_date: item.resignation_date,
        idCard: item.idCard,
        phone: item.phone,
        status: item.status,
        role: item.role,
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
exports.driver_get_all_assistant_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("driver");
    sheet.columns = [
      { header: "DriverNumber", key: "driverNumber", width: 15 },
      { header: "PrefixName", key: "prefixName", width: 10 },
      { header: "Name", key: "name", width: 15 },
      { header: "SurName", key: "surName", width: 15 },
      { header: "FullName", key: "fullName", width: 25 },
      { header: "BirthDate", key: "birthDate", width: 15 },
      { header: "StartDate", key: "start_date", width: 15 },
      { header: "ResignationDate", key: "resignation_date", width: 15 },
      { header: "IDCard", key: "idCard", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataDriver = await DriverModel.findAll(
      { where: { role: 'ผู้ช่วยพนักงานขับรถ' }}
    )

    dataDriver.map((item) => {
      sheet.addRow({
        driverNumber: item.driverNumber,
        prefixName: item.prefixName,
        name: item.name,
        surName: item.surName,
        fullName: item.fullName,
        birthDate: item.birthDate,
        start_date: item.start_date,
        resignation_date: item.resignation_date,
        idCard: item.idCard,
        phone: item.phone,
        status: item.status,
        role: item.role,
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
    const dataDriver = await DriverModel.findAll()

    res.send(dataDriver);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}
exports.driver_get_all_active = async (req, res, next) => {
  try {
    const dataDriver = await DriverModel.findAll(
      { where: { status: 'ทำงาน' }}
    )

    res.send(dataDriver);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}
exports.driver_get_all_withoutnoinfo = async (req, res, next) => {
  try {
    const dataDriver = await DriverModel.findAll(
      { where: { 
        status: {
          [Op.ne]: null // เลือกเฉพาะค่าที่ไม่ใช่ NULL
        },
      }}
    )

    res.send(dataDriver);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}
exports.driver_get_all_only = async (req, res, next) => {
  try {
    const dataDriver = await DriverModel.findAll(
      { where: { role: 'พนักงานขับรถ' }}
    )

    res.send(dataDriver);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}
exports.driver_get_all_assistant = async (req, res, next) => {
  try {
    const dataDriver = await DriverModel.findAll(
      { where: { role: 'ผู้ช่วยพนักงานขับรถ' }}
    )

    res.send(dataDriver);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.driver_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const dataDriver = await DriverModel.findOne(
      { 
        where: {id: get_id},
      }
    )
    if (dataDriver == null) {
      return res.send({message: 'No Data Found'});
    }

    res.send(dataDriver);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- POST -------//
exports.driver_post = async (req, res, next) => {
  try {
    const { driverNumber, prefixName, name, surName, birthDate, start_date, resignation_date, idCard, phone, status, role } = req.body
    
    let driverNumber_tran = null
    let idCard_tran = null
    let phone_tran = null
    let status_tran = null
    let role_tran = null

    if (driverNumber == '' || driverNumber == ' ' || driverNumber == '-') {
      driverNumber_tran = null
    } else {
      driverNumber_tran = driverNumber
    }

    if (idCard == '' || idCard == ' ' || idCard == '-') {
      idCard_tran = null
    } else {
      idCard_tran = idCard
    }

    if (phone == '' || phone == ' ' || phone == '-') {
      phone_tran = null
    } else {
      phone_tran = phone
    }

    if (status == '' || status == ' ' || status == '-') {
      status_tran = null
    } else {
      status_tran = status
    }

    if (role == '' || role == ' ' || role == '-') {
      role_tran = null
    } else {
      role_tran = role
    }
    
    await DriverModel.create({
      driverNumber: driverNumber_tran,
      prefixName: prefixName,
      name: name,
      surName: surName,
      fullName: name + ' ' + surName,
      birthDate: birthDate,
      start_date: start_date,
      resignation_date: resignation_date,
      idCard: idCard_tran,
      phone: phone_tran,
      status: status_tran,
      role: role_tran,
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
    const { driverNumber, prefixName, name, surName, birthDate, start_date, resignation_date, idCard, phone, status, role } = req.body
    const edit_id = req.params.id

    let driverNumber_tran = null
    let idCard_tran = null
    let phone_tran = null
    let status_tran = null
    let role_tran = null

    if (driverNumber == '' || driverNumber == ' ' || driverNumber == '-') {
      driverNumber_tran = null
    } else {
      driverNumber_tran = driverNumber
    }

    if (idCard == '' || idCard == ' ' || idCard == '-') {
      idCard_tran = null
    } else {
      idCard_tran = idCard
    }

    if (phone == '' || phone == ' ' || phone == '-') {
      phone_tran = null
    } else {
      phone_tran = phone
    }

    if (status == '' || status == ' ' || status == '-') {
      status_tran = null
    } else {
      status_tran = status
    }

    if (role == '' || role == ' ' || role == '-') {
      role_tran = null
    } else {
      role_tran = role
    }

    const data = await DriverModel.update({
      driverNumber: driverNumber_tran,
      prefixName: prefixName,
      name: name,
      surName: surName,
      fullName: name + ' ' + surName,
      birthDate: birthDate,
      start_date: start_date,
      resignation_date: resignation_date,
      idCard: idCard_tran,
      phone: phone_tran,
      status: status_tran,
      role: role_tran,
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

exports.driver_put_byexcel = async (req, res, next) => {
  try {
    const allDriver = req.body

    for (const item of allDriver) {

      if (item.status == "-") {
        item.status = null
      }
      if (item.status !== null) {
        item.status = item.status.toString();
        item.status = item.status.replace(/\s/g, ''); // ลบทุกช่องว่างออก
      }

      if (item.driverNumber == "-") {
        item.driverNumber = null
      }
      if (item.driverNumber !== null) {
        item.driverNumber = item.driverNumber.toString();
        item.driverNumber = item.driverNumber.replace(/\s/g, ''); // ลบทุกช่องว่างออก
      }

      if (item.phone == "-") {
        item.phone = null
      }
      if (item.phone !== null) {
        item.phone = item.phone.replace(/\D/g, ''); // เอาทุกอย่างที่ไม่ใช่ตัวเลขออก
        item.phone = item.phone.replace(/\s/g, ''); // ลบทุกช่องว่างออก
      }

      let prefixName
      let splitName
      if (item.fullname == "-") {
        item.fullname = null
      }
      if (item.fullname !== null) {
        if (item.fullname.includes("นาย")) {
          prefixName = "นาย"
        } else if (item.fullname.includes("นางสาว")) {
          prefixName = "นางสาว"
        } else {
          prefixName = "นาง"
        }

        item.fullname = item.fullname.replace(/นาย|นางสาว|นาง/g, ''); // ลบคำที่กำหนด
        item.fullname = item.fullname.trim(); //ลบช่องว่างด้านหน้าและด้านหลัง
        item.fullname = item.fullname.replace(/\s+/g, ' '); // แทนที่ช่องว่างหลายตัวด้วยช่องว่างเดียว
        splitName = item.fullname.split(" ");

        console.log({
          driverNumber: item.driverNumber,
          prefixName: prefixName,
          name: splitName[0],
          surName: splitName[1],
          fullName: splitName[0] + ' ' + splitName[1],
          phone: item.phone,
          status: item.status,
          role: 'ผู้ช่วย',
        });
  
        const checkDriver = await DriverModel.findOne(
          { where: { fullName: splitName[0] + ' ' + splitName[1] } }
        )
        //console.log(checkDriver);
      
        if (checkDriver !== null) {
          await DriverModel.update(
            {
              driverNumber: item.driverNumber,
              prefixName: prefixName,
              name: splitName[0],
              surName: splitName[1],
              fullName: splitName[0] + ' ' + splitName[1],
              phone: item.phone,
              status: item.status,
              role: 'ผู้ช่วย',
            }, { where: { fullName: splitName[0] + ' ' + splitName[1] } }
          )
        } else {
          await DriverModel.create(
            {
              driverNumber: item.driverNumber,
              prefixName: prefixName,
              name: splitName[0],
              surName: splitName[1],
              fullName: splitName[0] + ' ' + splitName[1],
              phone: item.phone,
              status: item.status,
              role: 'ผู้ช่วย',
            }
          )
        }
      }
    }
  } catch (error) {
    console.log(error);
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