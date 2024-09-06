const mysql = require('mysql2');

// Configure sua conexão com o banco de dados
const connection = mysql.createConnection({
  host: '',
  user: 'root',
  password: '',
  database: '',
  port: 19855
});

connection.connect();

// Dados para inserção
const games = [
  {
    "id": 339,
    "title": "Tibia",
    "thumbnail": "https://www.freetogame.com/g/339/thumbnail.jpg",
    "short_description": "A old-school free-to-play massively multiplayer online role-playing game.",
    "game_url": "https://www.freetogame.com/open/tibia",
    "genre": "MMORPG",
    "platform": "PC (Windows)",
    "publisher": "CipSoft",
    "developer": "CipSoft",
    "release_date": "1997-01-07",
    "freetogame_profile_url": "https://www.freetogame.com/tibia"
  }
];

async function insertData() {
  try {
    // Inserir categorias de jogos
    const categories = [...new Set(games.map(game => game.genre))]; // Extrair gêneros únicos

    // Usar Promise.all para inserir categorias em paralelo
    await Promise.all(categories.map(category => {
      return new Promise((resolve, reject) => {
        connection.query(
          'INSERT IGNORE INTO TB_GAMES_CATEGORY (game_category_name) VALUES (?)',
          [category],
          (error) => {
            if (error) return reject(error);
            resolve();
          }
        );
      });
    }));

    // Obter IDs das categorias
    const categoryIds = {};
    for (const category of categories) {
      const [rows] = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT game_category_id FROM TB_GAMES_CATEGORY WHERE game_category_name = ?',
          [category],
          (error, results) => {
            if (error) return reject(error);
            resolve([results]);
          }
        );
      });
      categoryIds[category] = rows[0].game_category_id;
    }

    // Inserir jogos
    const gameValues = games.map(game => [
      game.id,
      game.title,
      game.thumbnail,
      categoryIds[game.genre],
      null, // Assuming game_secondary_category is optional and not provided
      game.game_url
    ]);

    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO TB_GAMES (game_id, game_name, game_image, game_main_category, game_secondary_category, game_url) VALUES ?',
        [gameValues],
        (error) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });

    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    connection.end();
  }
}

insertData();
