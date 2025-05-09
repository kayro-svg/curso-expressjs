const { Router } = require('express');
const { register, login } = require('../controllers/authController');
const authenticateToken = require('../middlewares/auth');

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/protected-route', authenticateToken, (req, res) => {
    res.send('Acceso permitido a la ruta protegida');
});

module.exports = router;