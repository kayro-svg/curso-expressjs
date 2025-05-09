const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const newUser = await registerUser(email, password, name);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await loginUser(email, password);

        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

module.exports = {
    register,
    login
};
