const app = require('./app');
const { seedDemo } = require('./seed');

if (process.env.SEED_DEMO !== '0') {
  const n = seedDemo();
  if (n) console.log(`Добавени са ${n} демо профила (SEED_DEMO=0 за изключване).`);
}

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`Spark слуша на http://localhost:${PORT}`));
