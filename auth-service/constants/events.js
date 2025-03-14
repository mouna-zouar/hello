const EVENTS = {
    USER_CREATED: 'user-created',
    USER_UPDATED: 'user-updated',
    ROLE_CREATED: 'role-created',
    ROLE_UPDATED: 'role-updated',
    ROLE_DELETED: 'role-deleted',
    DEPARTMENT_CREATED: 'department-created',
    DEPARTMENT_UPDATED: 'department-updated',
    DEPARTMENT_DELETED: 'department-deleted',
    ROLE_PERMISSION_ADDED: 'role-permission-added',
    ROLE_PERMISSION_REMOVED: 'role-permission-removed',
    PERMISSION_CREATED: 'permission-created',
    PERMISSION_UPDATED: 'permission-updated',
    PERMISSION_DELETED: 'permission-deleted',
    USER_INVITATION_SENT: 'user-invitation-sent',
    USER_INVITATION_VALIDATED: 'user-invitation-validated',
    USER_INVITATION_ACCEPTED: 'user-invitation-accepted',
};

module.exports = EVENTS;
