import useAuthStore from '../store/useAuthStore';

/**
 * Custom hook to check if the current user has specific permissions.
 * @returns {Object} { hasPermission: (permission) => boolean }
 */
export const usePermissions = () => {
  const { permissions } = useAuthStore();

  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true;
    return permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(p => permissions.includes(p));
  };

  return { hasPermission, hasAnyPermission };
};

/**
 * PermissionGate component to conditionally render children based on permissions.
 */
export const PermissionGate = ({ 
  children, 
  requiredPermission, 
  requiredPermissions, 
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return fallback;
  }

  return children;
};
