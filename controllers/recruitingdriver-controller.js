const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const exceljs = require('exceljs')

const path = require('path');
const fs = require('fs').promises;

const RecruitingDriverModel = db.RecruitingDriverModel
const ResigningDriverModel = db.ResigningDriverModel
const VehicleModel = db.VehicleModel

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const choose_database_fromyear_vbk = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = VehicleBookingStatus2023Model
    } else if (selectYear == '2024') {
      vbkDB = VehicleBookingStatus2024Model
    } else if (selectYear == '2025') {
      vbkDB = VehicleBookingStatus2025Model
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_vbk_sql = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = `vehiclebookingstatus2023s`
    } else if (selectYear == '2024') {
      vbkDB = `vehiclebookingstatus2024s`
    } else if (selectYear == '2025') {
      vbkDB = `vehiclebookingstatus2025s`
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}

//------- GET -------//
exports.recruitingdriver_get_from_resigning = async (req, res, next) => {
  try {
    let selectResigningdriverId	 = req.params.resigningdriverId
    
    const dataResigningDriver = await ResigningDriverModel.findOne({
      where: {id: selectResigningdriverId}
    })
    const findYear = moment(dataResigningDriver.resign_date).year();

    const chooseVbkDB = await choose_database_fromyear_vbk_sql(findYear)
    const dataVbk = await db.sequelize.query(`
      WITH grouped_data AS (
          SELECT id, date, status, approve,
                date - INTERVAL ROW_NUMBER() OVER (ORDER BY date) DAY AS grp
          FROM ${chooseVbkDB}
          WHERE status = 'No Driver' AND vehicleId = ${dataResigningDriver.resign_plateNumber}
      )
      SELECT MIN(date) AS earliest_no_driver_date, approve
      FROM grouped_data
      WHERE grp = (SELECT MAX(grp) FROM grouped_data)
      GROUP BY approve
      ORDER BY earliest_no_driver_date;
    `) 
    console.log(dataVbk);

    const dataRecruitingDriver = await RecruitingDriverModel.findAll(
      {
        include: [{
          model: ResigningDriverModel,
          attributes: ['recruit_plateNumber'],
          include: [
            {
              model: VehicleModel,
              as: "RecruitPlateNumber",
              attributes: ['plateNumber']
            }
          ]
        }],
        where: {
          resigningdriverId: selectResigningdriverId	
        },
      }
    )

    const transformedData = []
    for (const item of dataRecruitingDriver) {
      const dataindex = {
        "id": item.id,
        "appointment_date": item.appointment_date,
        "fullName": item.fullName,
        "phone": item.phone,
        "reason": item.reason,
        "note": item.note,
        "driver_file": item.driver_file,
        "recruit_status": item.recruit_status,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "resigningdriverId": item.resigningdriverId,
        "recruit_plateNumber": item.resigningdriver.recruit_plateNumber,
        "recruit_plateNumber_name": item.resigningdriver.RecruitPlateNumber.plateNumber,
      }
      transformedData.push(dataindex)
    }

    res.send({
      status: 'success',
      message: 'Get All Recruiting Driver Success',
      length: dataRecruitingDriver.length,
      data: transformedData
    });
  } catch (error) {
    console.log();
  }
}

//------- POST -------//
exports.recruitingdriverwithfile_post = async (req, res, next) => {
  try {
    // ข้อมูลที่ไม่ใช่ไฟล์
    const formData = req.body;
    // ข้อมูลไฟล์ที่ถูกอัพโหลด
    const file = req.files;
    // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
    const driver_file_array = []
    file.map((item) => {
      let new_name = Date.now() + '_' + item.originalname;

      let old_path = path.join( __dirname, `../uploads/recruitings/${item.originalname}`); // ไฟล์ต้นทาง
      let new_path = path.join( __dirname, `../uploads/recruitings/${new_name}` ); // ไฟล์ปลายทาง

      fs.rename(old_path, new_path);
      driver_file_array.push(new_name);
    })

    const checkDataRecruitingDriver = await RecruitingDriverModel.findOne(
      {
        where: {
          resigningdriverId: formData.resigningdriverId,
          recruit_status: formData.recruit_status
        },
      }
    )
    if (formData.recruit_status == 'รอสรรหา') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเพิ่มข้อมูลสถานะเป็น รอสรรหา ได้ ต้องให้ระบบทำการเพิ่มแบบ auto',
        data: checkDataRecruitingDriver
      })
    }
    if (formData.recruit_status == 'รอสรรหาใหม่') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเพิ่มข้อมูลสถานะเป็น รอสรรหาใหม่ ได้ ต้องให้ระบบทำการเพิ่มแบบ auto',
        data: checkDataRecruitingDriver
      })
    }
    if (checkDataRecruitingDriver) {
      return res.send({
        status: 'fail',
        message: `สถานะ ${checkDataRecruitingDriver.recruit_status} มีอยู่ในระบบอยู่แล้ว ไม่สามารถเพิ่มสถานะซ้ำได้`,
        data: checkDataRecruitingDriver
      })
    }
    // ถ้า status เป็น นัดหมาย และไม่มีไฟล์ถูก upload เข้ามาด้วย
    if (formData.recruit_status == 'นัดหมาย' && driver_file_array.length == 0) {
      return res.send({
        status: 'fail',
        message: `ถ้าสถานะเป็น นัดหมาย จำเป็นต้องแนบไฟล์เข้ามาด้วย`,
      })
    }

    const dataResigningDriver = await ResigningDriverModel.findOne({
      where: {id: formData.resigningdriverId}
    })
    if (dataResigningDriver == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: dataResigningDriver
      })
    }

    // แปลงค่า 'null', '', ' ', '-' เป็น null
    Object.keys(formData).forEach(key => {
      if (formData[key] === 'null' || formData[key] === '' || formData[key] === '-' || formData[key] === ' ') {
        formData[key] = null;
      }
    });

    const createRecruitingDriver = await RecruitingDriverModel.create({
      appointment_date: formData.appointment_date,
      fullName: formData.fullName,
      phone: formData.phone,
      reason: formData.reason,
      note: formData.note,
      driver_file: driver_file_array,
      recruit_status: formData.recruit_status,
      approve: formData.approve,
      resigningdriverId: formData.resigningdriverId,
    })

    if (formData.recruit_status == 'ไม่ผ่าน SIC' || formData.recruit_status == 'นัดหมายไม่สำเร็จ') {
      let detail_file_tr = []
      for (const detail_file_name of dataResigningDriver.detail_file) {
        let detail_file_name_tr

        // ตรวจสอบว่าในชื่อไฟล์มีคำว่า copy_resign มั้ย
        if (detail_file_name.includes("copy_resign")) {
          const match = detail_file_name.match(/(copy_resign)(\d+)_(.*)/);

          if (match) {
            // console.log(match[1]); // "copy_resign"
            // console.log(match[2]); // "ตัวเลข"
            // console.log(match[3]); // "ชื่อไฟล์"

            const count = parseInt(match[2], 10) + 1;

            detail_file_name_tr = match[1] + String(count) + "_" + match[3]
        }
        } else {
          detail_file_name_tr = `copy_resign1_${detail_file_name}`
        }

        const sourcePath = path.join( __dirname, `../uploads/resignings/${detail_file_name}`); // ไฟล์ต้นทาง
        const destinationPath = path.join( __dirname, `../uploads/resignings/${detail_file_name_tr}` ); // ไฟล์ปลายทาง

        // copy ไฟล์ที่มีอยู่แล้ว
        fs.copyFile(sourcePath, destinationPath, fs.constants.COPYFILE_EXCL, (err) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการคัดลอกไฟล์:', err);
          } else {
            console.log('คัดลอกไฟล์เสร็จสิ้น');
          }
        });

        detail_file_tr.push(detail_file_name_tr)
      }
      
      const createResigningDriver = await ResigningDriverModel.create({
        resign_date: dataResigningDriver.resign_date,
        resign_driver: dataResigningDriver.resign_driver,
        resign_reason: dataResigningDriver.resign_reason,
        resign_specialCase: dataResigningDriver.resign_specialCase,
        recruit_date: dataResigningDriver.recruit_date,
        recruit_reason: dataResigningDriver.recruit_reason,
        recruit_specialCase: dataResigningDriver.recruit_specialCase,
        detail: dataResigningDriver.detail,
        detail_file: detail_file_tr,
        approve: formData.approve,
        resign_unit: dataResigningDriver.resign_unit,
        resign_network: dataResigningDriver.resign_network,
        resign_customer: dataResigningDriver.resign_customer,
        resign_plateNumber: dataResigningDriver.resign_plateNumber,
        resign_plateNumber_special: dataResigningDriver.resign_plateNumber_special,
        recruit_unit: dataResigningDriver.recruit_unit,
        recruit_network: dataResigningDriver.recruit_network,
        recruit_customer: dataResigningDriver.recruit_customer,
        recruit_plateNumber: dataResigningDriver.recruit_plateNumber,
        recruit_plateNumber_special: dataResigningDriver.recruit_plateNumber_special,
      })

      // เมื่อสร้างข้อมูล resigning เสด ให้สร้างข้อมูล recruiting โดยค่่าเริ่มต้นเป็นรอสรรหา
      const createRecruitingDriver = await RecruitingDriverModel.create({
        recruit_status: 'รอสรรหาใหม่',
        driver_file: [],
        approve: formData.approve,
        resigningdriverId: createResigningDriver.id,
      })
    }

    res.send({
      status: 'success',
      message: 'Add Recruiting Driver With File Success',
      data: createRecruitingDriver,
    })

  } catch (error) {
    console.log(error);
  }
}

exports.recruitingdriverwithfile_put = async (req, res, next) => {
  try {
    const edit_id = req.params.id

    // ข้อมูลที่ไม่ใช่ไฟล์
    const formData = req.body;
    // ข้อมูลไฟล์ที่ถูกอัพโหลด
    const file = req.files;

    // ดึงข้อมูล RecruitingDriver ที่ต้องการจะเเก้ไขเพื่อหา resigningdriverId
    const editDataRecruitingDriver = await RecruitingDriverModel.findOne(
      { 
        where: { id: edit_id } 
      }
    )
    if (editDataRecruitingDriver == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: editDataRecruitingDriver
      })
    }
    if (formData.recruit_status == 'รอสรรหา') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขข้อมูลสถานะเป็น รอสรรหา ได้ เนื่องจากเป็นสถานะตั้งต้นอยู่แล้ว',
        data: editDataRecruitingDriver
      })
    }
    if (editDataRecruitingDriver.recruit_status == 'รอสรรหา' && formData.recruit_status !== 'รอสรรหา') {
      return res.send({
        status: 'fail',
        message: 'สถานะที่เป็น รอสรรหา ไม่สามารถถูกเเก้ไขข้อมูลสถานะได้',
        data: editDataRecruitingDriver
      })
    }
    if (formData.recruit_status == 'รอสรรหาใหม่') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขข้อมูลสถานะเป็น รอสรรหาใหม่ ได้ เนื่องจากเป็นสถานะตั้งต้นอยู่แล้ว',
        data: editDataRecruitingDriver
      })
    }
    if (editDataRecruitingDriver.recruit_status == 'รอสรรหาใหม่' && formData.recruit_status !== 'รอสรรหาใหม่') {
      return res.send({
        status: 'fail',
        message: 'สถานะที่เป็น รอสรรหาใหม่ ไม่สามารถถูกเเก้ไขข้อมูลสถานะได้',
        data: editDataRecruitingDriver
      })
    }
    if (formData.recruit_status == 'ไม่ผ่าน SIC') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขข้อมูลสถานะเป็น ไม่ผ่าน SIC ได้ ให้เพิ่มได้อย่างเดียว',
        data: editDataRecruitingDriver
      })
    }
    if (editDataRecruitingDriver.recruit_status == 'ไม่ผ่าน SIC' && formData.recruit_status !== 'ไม่ผ่าน SIC') {
      return res.send({
        status: 'fail',
        message: 'สถานะที่เป็น ไม่ผ่าน SIC ไม่สามารถถูกเเก้ไขข้อมูลสถานะได้',
        data: editDataRecruitingDriver
      })
    }
    if (formData.recruit_status == 'นัดหมายไม่สำเร็จ') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขข้อมูลสถานะเป็น นัดหมายไม่สำเร็จ ได้ ให้เพิ่มได้อย่างเดียว',
        data: editDataRecruitingDriver
      })
    }
    if (editDataRecruitingDriver.recruit_status == 'นัดหมายไม่สำเร็จ' && formData.recruit_status !== 'นัดหมายไม่สำเร็จ') {
      return res.send({
        status: 'fail',
        message: 'สถานะที่เป็น นัดหมายไม่สำเร็จ ไม่สามารถถูกเเก้ไขข้อมูลสถานะได้',
        data: editDataRecruitingDriver
      })
    }
    if (editDataRecruitingDriver.recruit_status == formData.recruit_status) {
      return res.send({
        status: 'fail',
        message: `สถานะ ${editDataRecruitingDriver.recruit_status} มีอยู่ในระบบอยู่แล้ว ไม่สามารถเเก้ไขสถานะซ้ำได้`,
        data: editDataRecruitingDriver
      })
    }
    // ถ้า status เป็น นัดหมาย และไม่มีไฟล์ถูก upload เข้ามาด้วย
    if (formData.recruit_status == 'นัดหมาย' && file.length == 0 && formData.driver_file_indb == null) {
      return res.send({
        status: 'fail',
        message: `ถ้าสถานะเป็น นัดหมาย จำเป็นต้องแนบไฟล์เข้ามาด้วย`,
      })
    }
  
    // แปลงค่า 'null', '', ' ', '-' เป็น null
    Object.keys(formData).forEach(key => {
      if (formData[key] === 'null' || formData[key] === '' || formData[key] === '-' || formData[key] === ' ') {
        formData[key] = null;
      }
    });

    //console.log("file", file.length);
    //console.log("formData.driver_file_indb", formData.driver_file_indb);

    // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
    let driver_file_array = []
    // ใน db ไม่มีไฟล์และไม่มีการอัพไฟล์เข้ามา 
    if (file.length == 0 && formData.driver_file_indb == null) {
      // วนลูปเพื่อลบทุกไฟล์
      for (const file_name of editDataRecruitingDriver.driver_file) {
        // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
        const filePath = path.join(__dirname, '../uploads/recruitings', file_name);
        try {
          // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
          await fs.unlink(filePath);
        } catch (err) {
          return res.send({ message: 'Error deleting file', error: err.message });
        }
      }
    // ใน db ไม่มีไฟล์และมีการอัพไฟล์เข้ามา 
    } else if (file.length !== 0 && formData.driver_file_indb == null) {
      file.map((item) => {
        let new_name = Date.now() + '_' + item.originalname;

        let old_path = path.join( __dirname, `../uploads/recruitings/${item.originalname}`); // ไฟล์ต้นทาง
        let new_path = path.join( __dirname, `../uploads/recruitings/${new_name}` ); // ไฟล์ปลายทาง

        fs.rename(old_path, new_path);
        driver_file_array.push(new_name);
      })
    // ใน db มีไฟล์และมีการอัพไฟล์เข้ามา 
    } else if (file.length !== 0 && formData.driver_file_indb !== null) {
      // แปลงสตริงให้เป็นอาร์เรย์ 
      driver_file_array = formData.driver_file_indb.split(',');

      // ถ้ามีการลบไฟล์ที่มีอยู่แล้วใน db ออก
      if (driver_file_array.length !== editDataRecruitingDriver.driver_file.length) {
        // กรองเอาชื่อของไฟล์ที่ถูกลบ
        const delete_driver_file_array = editDataRecruitingDriver.driver_file.filter(item => !driver_file_array.includes(item));

        //console.log(delete_driver_file_array);
        // วนลูปเพื่อลบทุกไฟล์
        for (const file_name of delete_driver_file_array) {
          // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
          const filePath = path.join(__dirname, '../uploads/recruitings', file_name);
          try {
            // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
            await fs.unlink(filePath);
          } catch (err) {
            return res.send({ message: 'Error deleting file', error: err.message });
          }
        }
      }

      file.map((item) => {
        let new_name = Date.now() + '_' + item.originalname;

        let old_path = path.join( __dirname, `../uploads/recruitings/${item.originalname}`); // ไฟล์ต้นทาง
        let new_path = path.join( __dirname, `../uploads/recruitings/${new_name}` ); // ไฟล์ปลายทาง

        fs.rename(old_path, new_path);
        driver_file_array.push(new_name);
      })
    // ใน db มีไฟล์และไม่มีการอัพไฟล์เข้ามา 
    } else if (file.length == 0 && formData.driver_file_indb !== null) {
      // แปลงสตริงให้เป็นอาร์เรย์ 
      driver_file_array = formData.driver_file_indb.split(',');

      // ถ้ามีการลบไฟล์ที่มีอยู่แล้วใน db ออก
      if (driver_file_array.length !== editDataRecruitingDriver.driver_file.length) {
        // กรองเอาชื่อของไฟล์ที่ถูกลบ
        const delete_driver_file_array = editDataRecruitingDriver.driver_file.filter(item => !driver_file_array.includes(item));

        //console.log(delete_driver_file_array);
        // วนลูปเพื่อลบทุกไฟล์
        for (const file_name of delete_driver_file_array) {
          // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
          const filePath = path.join(__dirname, '../uploads/recruitings', file_name);
          try {
            // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
            await fs.unlink(filePath);
          } catch (err) {
            return res.send({ message: 'Error deleting file', error: err.message });
          }
        }
      }
    }

    //console.log("driver_file_array", driver_file_array);
    //console.log("driver_file_db", editDataRecruitingDriver.driver_file);

    const editRecruitingDriver = await RecruitingDriverModel.update({
      appointment_date: formData.appointment_date,
      fullName: formData.fullName,
      phone: formData.phone,
      reason: formData.reason,
      note: formData.note,
      driver_file: driver_file_array,
      recruit_status: formData.recruit_status,
      approve: formData.approve,
    }, { where: { id: edit_id } })
    if (editRecruitingDriver == 0) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: editRecruitingDriver
      })
    }

    res.send({
      status: 'success',
      message: 'Edit Recruiting Driver With File Success',
      data: editRecruitingDriver,
    })

  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//


//------- DELETE -------// 
exports.recruitingdriver_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id

    // ดึงข้อมูล RecruitingDriver ที่ต้องการจะลบจาก id
    const deleteDataRecruitingDriver = await RecruitingDriverModel.findOne(
      { 
        where: { id: delete_id } 
      }
    )
    if (deleteDataRecruitingDriver == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: deleteDataRecruitingDriver
      })
    }
    if (deleteDataRecruitingDriver.recruit_status == 'รอสรรหา') {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถลบ Recruiting Driver ที่สถานะเป็น รอสรรหา ได้',
        data: deleteDataRecruitingDriver
      })
    }

    // ส่วนของการลบไฟล์ที่อยู่ใน RecruitingDriver
    const array_driver_file = deleteDataRecruitingDriver.driver_file
    // วนลูปเพื่อลบทุกไฟล์
    for (const file_name of array_driver_file) {
      // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
      const filePath = path.join(__dirname, '../uploads/recruitings', file_name);
      try {
        // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
        await fs.unlink(filePath);
      } catch (err) {
        return res.send({ message: 'Error deleting file', error: err.message });
      }
    }

    // ลบข้อมูล RecruitingDriver ใน db
    const deleteRecruitingDriver = await RecruitingDriverModel.destroy(
      { where: { id: delete_id } }
    )
    if (deleteRecruitingDriver == 0) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: deleteRecruitingDriver
      })
    }

    res.send({
      status: 'success',
      message: 'Delete Recruiting Driver Success',
      data: deleteRecruitingDriver,
    })
  } catch (error) {
    console.log(error);
  }
}