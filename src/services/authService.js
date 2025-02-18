import users from '../config/users.json';
import md5 from 'md5';

export const authService = {
    login: (username, password) => {
        const hashedPassword = md5(password);
        const user = users.users.find(
            u => u.username === username && u.password === hashedPassword
        );
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            return userWithoutPassword;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    hasAccess: (requiredLevel) => {
        const user = authService.getCurrentUser();
        if (!user) return false;
        
        if (requiredLevel === 'admin') {
            return user.accessLevel === 'admin';
        }
        return true;
    }
};
