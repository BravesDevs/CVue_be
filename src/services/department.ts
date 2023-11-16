/**
 * All the service layer methods for the Department.
 */
const _ = require('lodash');
import { CreateAndUpdateDepartmentDTO, ErrorResponse } from "./../common";
import { createDepartment, updateDepartment, getDepartmentById, getDepartmentListWithPagination, getDepartmentByWhereClause } from "./../models";
import { MessageActions } from "./../common";


/**
 * create department.
 * @param  {CreateAndUpdateDepartmentDTO} payload
 */
export const createDepartmentService = async (payload: CreateAndUpdateDepartmentDTO, loggedInUser) => {
    let exisitingDepartment = await getDepartmentByWhereClause({ name: payload.name, clientId: payload.client_id });
    if (exisitingDepartment) {
        return [400, ErrorResponse.DepartmentAlreadyExists];
    }
    const departmentPayload = {
        name: payload.name,
        clientId: payload.client_id,
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
    }
    let department = await createDepartment(departmentPayload);
    return [201, {
        ok: true,
        message: MessageActions.CREATE_DEPARTMENT,
        department_id: department.id,
    }];
};

/**
 * update department.
 * @param  {id}
 * @param  {CreateAndUpdateDepartmentDTO} payload
 */
export const updateDepartmentService = async (id: string, payload: CreateAndUpdateDepartmentDTO, loggedInUser) => {
    let exisitingDepartment = await getDepartmentByWhereClause({ name: payload.name, clientId: payload.client_id });
    if (exisitingDepartment) {
        return [400, ErrorResponse.DepartmentAlreadyExists];
    }
    let departmentToUpdate = await getDepartmentById(id);
    if (!departmentToUpdate) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    const departmentPayload = {
        name: payload.name,
        updatedBy: loggedInUser.user_id,
    }
    let department = await updateDepartment(id, departmentPayload);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_DEPARTMENT,
        department_id: department.id
    }];
};

/**
 * get department list.
 */
export const getDepartmentListService = async (requestArgs, params) => {
    const { page, limit } = params;
    let whereClause = `departments.client_id = ${requestArgs.client_id} `;
    whereClause += requestArgs.site_id ? ` AND site_id = ${requestArgs.site_id}` : "";
    whereClause += requestArgs.region_id ? ` AND region_id = ${requestArgs.region_id}` : "";

    const { list, totalDepartment } = await getDepartmentListWithPagination(page, limit, whereClause);
    return [200, {
        ok: true,
        count: totalDepartment.count,
        department_list: list
    }];
};