export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  HR_MANAGER: "Quản lý nhân sự",
  CUSTOMER_MANAGER: "Quản lý khách hàng",
  STORE_MANAGER: "Quản lý cửa hàng",
  SYSTEM_MANAGER: "Quản lý hệ thống",
  SHIPPER_MANAGER: "Quản lý shipper",
  CHIEF_MANAGER: "Trưởng bộ phận",
};

export const getRoleNames = (roles = []) => {
  if (!roles) return "";
  if (!Array.isArray(roles)) roles = [roles];
  return roles.map((r) => ROLE_LABELS[r] || r).join(", ");
};

export const RoleOptions = [
  { value: "HR_MANAGER", label: ROLE_LABELS.HR_MANAGER },
  { value: "CUSTOMER_MANAGER", label: ROLE_LABELS.CUSTOMER_MANAGER },
  { value: "STORE_MANAGER", label: ROLE_LABELS.STORE_MANAGER },
  { value: "SHIPPER_MANAGER", label: ROLE_LABELS.SHIPPER_MANAGER },
  { value: "CHIEF_MANAGER", label: ROLE_LABELS.CHIEF_MANAGER },
];
