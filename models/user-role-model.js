var _ = require('lodash');

function UserRoleModel() {
    this.roles = {
        'admin': 0,
        'user': 1
    }
};

UserRoleModel.prototype.getRoleById = function(id) {
    
};

module.exports = new UserRoleModel();