require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const LoggerMiddleware = require('./src/middlewares/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const { validateUser } = require('./src/utils/validation');
const authenticateToken = require('./src/middlewares/auth');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, 'users.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(LoggerMiddleware);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1> Curso Express.js</h1>
        <p>Esto es un aplicacion node.js con express.js</p>
        <p>Corre en el puerto:${PORT}</p>
        `);
}
);

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`
        <h1> Usuario con ID: ${userId}</h1
        `);
}
);

app.get('/search', (req, res) => {
    const terms = req.query.termino || 'No es especificado';
    const category = req.query.categoria || 'Todas';

    res.send(`
        <h1> Busqueda de productos</h1>
        <p>Termino: ${terms}</p>
        <p>Categoria: ${category}</p>
        `);
})

app.post('/form', (req, res) => {
    const name = req.body.nombre || 'No es especificado';
    const email = req.body.email || 'No es especificado';
    res.json({
        message: 'Datos recibidos',
        data: {
            name,
            email
        }
    })
});

app.post('/api/data', (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No data provided' });
    }
    res.status(201).json({
        message: 'Data received successfully',
        data
    });
})

app.get('/users', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const users = JSON.parse(data);
        res.json(users);
    });
}
);

app.post('/users', (req, res) => {
    const newUser = req.body;
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const users = JSON.parse(data);

        const validation = validateUser(newUser, users);

        if (!validation.isValid) {
            return res.status(400).json({ error: validation.errors });
        }

        users.push(newUser);
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json(newUser);
        });
    });
});

app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const updatedUser = req.body;


    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        let users = JSON.parse(data);

        const validation = validateUser(updatedUser, users, true);

        if (!validation.isValid) {
            return res.status(400).json({ error: validation.errors });
        }

        users = users.map(user => user.id === userId ? { ...user, ...updatedUser } : user);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el usuario' })
            }
            res.json(updatedUser);
        })
    });
}
);

app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        let users = JSON.parse(data);
        users = users.filter(user => user.id !== userId);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar el usuario' })
            }
            res.status(204).send();
        })
    })
}
);

app.get('/error', (req, res, next) => {
    next(new Error('Error intenciional'));
})

app.get('/db-users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users from database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);

app.get('/protected-route', authenticateToken, (req, res) => {
    res.send('Acceso permitido a la ruta protegida');
});

app.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: { email, password: hashedPassword, name, role: 'USER' }
    });
    res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}, aplicacion funcionando`);
}
);