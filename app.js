const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { conectarBD, sequelize } = require('./config/db');
const usuarioRutas = require('./routes/usuarioRutas');
const productoRutas = require('./routes/productoRutas');
const categoriaRutas = require('./routes/categoriaRutas');
const authRutas = require('./routes/authrutas'); // Importar las rutas de autenticación
const tiendaRutas = require('./routes/tiendaRutas');

dotenv.config();

const app = express();

// Conectar a la base de datos
conectarBD();

// Sincronizar modelos
sequelize.sync().then(() => {
  console.log('Modelos sincronizados con la base de datos.');
});

// Configura la sesión antes de las rutas
app.use(session({
    secret: 'tuSecreto', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sirviendo archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configurar Pug como motor de vistas
app.set('view engine', 'pug');
app.set('views', './views');

// Rutas
app.get('/', (req, res) => {
  res.render('index', { titulo: 'Bienvenido a la Tienda' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard/index');
});

app.get('/auth', (req, res) => {
  res.render('auth/index');
});

app.get('/tienda', (req, res) => {
  res.render('tienda/index');
});

// Rutas de usuarios, productos y categorías
app.use('/usuarios', usuarioRutas);
app.use('/productos', productoRutas);
app.use('/categorias', categoriaRutas);
app.use('/', authRutas); // Rutas de autenticación

// Rutas de la API
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await sequelize.query('SELECT * FROM productos', { type: sequelize.QueryTypes.SELECT });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta para manejar el inicio de sesión (debes crear el controlador adecuado)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Aquí iría la lógica de autenticación
  // Simulación de autenticación exitosa
  if (email === 'test@example.com' && password === 'password') {
    req.session.user = { email };
    return res.json({ success: true, userEmail: email });
  }
  res.status(401).json({ success: false, message: 'Credenciales inválidas' });
});

const PUERTO = process.env.PUERTO || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor ejecutándose en el puerto ${PUERTO}`);
});
