"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorRoundsController = exports.NursingCareController = exports.AdmissionController = exports.BedController = exports.RoomController = exports.WardController = void 0;
// Inpatient Management Controllers
var ward_controller_1 = require("./ward.controller");
Object.defineProperty(exports, "WardController", { enumerable: true, get: function () { return ward_controller_1.WardController; } });
var room_controller_1 = require("./room.controller");
Object.defineProperty(exports, "RoomController", { enumerable: true, get: function () { return room_controller_1.RoomController; } });
var bed_controller_1 = require("./bed.controller");
Object.defineProperty(exports, "BedController", { enumerable: true, get: function () { return bed_controller_1.BedController; } });
var admission_controller_1 = require("./admission.controller");
Object.defineProperty(exports, "AdmissionController", { enumerable: true, get: function () { return admission_controller_1.AdmissionController; } });
var nursing_care_controller_1 = require("./nursing-care.controller");
Object.defineProperty(exports, "NursingCareController", { enumerable: true, get: function () { return nursing_care_controller_1.NursingCareController; } });
var doctor_rounds_controller_1 = require("./doctor-rounds.controller");
Object.defineProperty(exports, "DoctorRoundsController", { enumerable: true, get: function () { return doctor_rounds_controller_1.DoctorRoundsController; } });
