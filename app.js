require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}, aplicacion funcionando`);
}
);