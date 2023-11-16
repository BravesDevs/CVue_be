/**
 * All the DTO related interfaces.
 */

export interface LoginUserDTO {
  email: string;
  password: string;
};

export interface AddClientDTO {
  client_name: string;
  address_line_1: string;
  address_line_2: string | null;
  address_line_3: string | null;
  city: string;
  country: string;
  sector_id: number;
  post_code: string;
  user_id: number;
}
export interface UpdateClientDTO {
  client_name: string;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  city: string;
  country: string;
  sector_id: number;
  post_code: string;
  client_id: number;
  user_id: number;
}

export interface ForgotPasswordDTO {
  email: string;
  userId: number;
};

export interface AddAndUpdateRegionDTO {
  name: string;
  client_id: number;
}


export interface SendgridEmailTemplateDTO {
  toEmailId: any;
  templateId: string;
  dynamicTemplateData: object;
};


export interface ResetPasswordDTO {
  password: string;
  code: string;
};


export interface CreateAgencyDTO {
  name: string;
  address_line_1: string;
  address_line_2: string | null;
  address_line_3: string | null;
  city: string;
  country: string;
  postCode: string;
};

export interface UpdateAgencyDTO {
  name: string;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  city: string;
  country: string;
  post_code: string;
};

export interface CreateAgencyAssociationDTO {
  client_id: number;
  agency_id: number;
  margin: string;
  currency: string
};

export interface UpdateAgencyAssociationDTO {
  client_id: number;
  agency_id: number;
  margin: string;
  currency: string
};

export interface CreateAndUpdateDepartmentDTO {
  name: string;
  client_id: number;
};
export interface CreateAndUpdateSectorRequestDTO {
  key: string;
  value: string;
};
export interface AddAndUpdateSiteDTO {
  name: string;
  region_id: number;
  client_id: number;
  address_line_1: string;
  address_line_2: string | null;
  address_line_3: string | null;
  post_code: string;
  city: string;
  country: string;
}

export interface AddWorkerDTO {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  national_insurance_number: string;
  type: undefined | null | "TEMPORARY" | "PERMANENT";
  tax_code: string;
  post_code: string;
  nationality: string;
  orientation: string;
  email: string;
  mobile: string;
  country_code: string;
  payroll_ref: string;
  employee_id: string;
  job_id: string;
  department_id: number;
  client_id: any;
  start_date: string;
  agency_id: any;
  is_active: boolean;
};

export interface UpdateRateCardDTO {
  name: string,
  currency: string,
  pay_per_hour: string,
  insurance_rate: string,
  holiday_pay_rate: string,
  apprenticeship_rate: string,
  pension_rate: string,
  full_time_hours: string,
  overtime_pay: string,
  client_id: string,
  currency_dynamic: string,
  pay_per_hour_dynamic: string,
  insurance_rate_dynamic: string,
  holiday_pay_rate_dynamic: string,
  apprenticeship_rate_dynamic: string,
  pension_rate_dynamic: string,
  full_time_hours_dynamic: string,
  overtime_pay_dynamic: string,
}

export interface CreateAndUpdateJobDTO {
  name: string,
  clientId: string,
  siteId: string,
  departmentId: string,
  type: string,
  shiftId: string,
  hoursPerWeek: number,
};

export interface CreateUserDTO {
  user_type: number,
  id: number,
  name: string,
  email: string,
  country_code: string,
  phone: number
}
export interface UpdateWorkerDTO {
  client_id: number | null,
  agency_id: number | null,
  job_id: number | null,
  workers: number[],
  is_active: boolean | null
}
export interface GetWorkersDTO {
  client_id: number | null,
  agency_id: number | null,
  site_id: number | null,
  limit: number,
  page: number,
  sort_by: string,
  sort_type: string,
  type: undefined | null | "TEMPORARY" | "PERMANENT"
}
export interface GetPayrollDTO {
  client_id: number | null,
  agency_id: number | null,
}

export interface RevokeUserProfileAccessDTO {
  id: number,
}