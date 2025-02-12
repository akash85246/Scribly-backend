import pool from "./connection.js";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

// Markdown conversion function
const convertMarkdown = (text) => {
  return purify.sanitize(marked(text));
};

// Create Tables if not exists
const createUserTable = async () => {
  const query = `
   CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    profile_picture TEXT DEFAULT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    sid INTEGER, -- Foreign key referencing settings
    last_online TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_settings FOREIGN KEY (sid) REFERENCES settings(id) ON DELETE SET NULL
);
  `;
  await pool.query(query);
  console.log("✅ User table is ready");
};

const addUser = async (username, profile_picture, email, password) => {
  const settings = await createSetting();
  const sid = settings[0].id;
  const query =
    "INSERT INTO users (username,profile_picture,email,password,sid) VALUES ($1, $2,$3,$4,$5) RETURNING *";
  const values = [username, profile_picture, email, password,sid];
  const { rows } = await pool.query(query, values);
  
  return rows;
};

const getUser = async (email) => {
  const query =
    "SELECT username,profile_picture,email FROM users WHERE email=$1";
  const values = [email];
  const { rows } = await pool.query(query, values);
  return rows;
};

const deleteUser = async (id) => {
  const query = "DELETE FROM users WHERE id = $1 RETURNING *;";
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

const updateLogin = async (id) => {
  const date = new Date();
  const query = `
      UPDATE users
      SET last_online = $1
      WHERE id = $2
      RETURNING *;
    `;
  const values = [date, id];
  const { rows } = await pool.query(query, values);
  return rows;
};

const createSettingTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY, 
    darkmode BOOLEAN DEFAULT FALSE,
    bg TEXT,
    drag BOOLEAN DEFAULT TRUE,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification BOOLEAN DEFAULT TRUE
)
  `;
  await pool.query(query);
  console.log("✅ Setting table is ready");
};

const createSetting = async () => {
  const darkmode = false,
    bg = null,
    drag = true,
    notification = true,
    last_updated_at = new Date();
  const query =
    "INSERT INTO settings (darkmode,bg,drag,notification,last_updated_at) VALUES ($1, $2,$3,$4,$5) RETURNING *";
  const values = [darkmode,bg,drag,notification,last_updated_at];
  const { rows } = await pool.query(query, values);
  return rows;
};

const changeSetting = async (
  id,
  sid,
  darkmode,
  bg,
  drag,
  notification,
  last_updated_at
) => {
  const userQuery = "SELECT * FROM settings WHERE uid = $1;";
  const userResult = await pool.query(userQuery, [id]);

  let query;
  let values;
  const userFound = userResult.rows.length > 0;
  if (userFound) {
    const prevSettings = userResult.rows[0];

    darkmode = darkmode !== undefined ? darkmode : prevSettings.darkmode;
    bg = bg !== undefined ? bg : prevSettings.bg;
    drag = drag !== undefined ? drag : prevSettings.drag;
    notification =
      notification !== undefined ? notification : prevSettings.notification;
    last_updated_at = new Date();
    query = `
        UPDATE settings
        SET darkmode = $1,
            bg = $2,
            drag = $3,
            notification = $4,
            last_updated_at = $5
        WHERE id = $6
        RETURNING *;
      `;
    values = [darkmode, bg, drag, notification, last_updated_at, sid];
  } else {
    query = `
        INSERT INTO settings (darkmode, bg, drag, notification, last_updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
    values = [
      darkmode ?? false,
      bg ?? null,
      drag ?? true,
      notification ?? true,
      new Date(),
      userFound ? id : null,
    ];
  }

  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

const getSetting =async (id)=>{
  const query = "SELECT * FROM settings WHERE uid=$1";
  const value=[id];
  const { rows } = await pool.query(query,value);
  return rows;
}

const createNoteTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL, 
    sid INTEGER,
    title TEXT CHECK (LENGTH(title) <= 100),
    content TEXT CHECK (LENGTH(content) <= 10000), 
    content_markdown TEXT, 
    title_markdown TEXT, 
    alert TIMESTAMP, 
    star BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER, 
    CONSTRAINT fk_notes_users FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_settings FOREIGN KEY (sid) REFERENCES settings(id) ON DELETE SET NULL
);
  `;
  await pool.query(query);
  console.log("✅ Note table is ready");
};

// Function to add a new note
const addNote = async (id, sid, title, content, alert, position) => {
  const convertMarkdown = (text) => {
    const rawHtml = marked(text); // Convert Markdown to HTML
    return purify.sanitize(rawHtml); // Sanitize the converted HTML
  };

  const title_markdown = convertMarkdown(title);
  const content_markdown = convertMarkdown(content);

  const query =
    "INSERT INTO notes (uid ,sid,title, content,content_markdown,title_markdown, alert,position) VALUES ($1, $2,$3,$4,$5$,$6,$7,$8) RETURNING *";
  const values = [
    id,
    sid,
    title,
    content,
    content_markdown,
    title_markdown,
    alert,
    position,
  ];
  const { rows } = await pool.query(query, values);
  return rows;
};

const updateNote = async (id, title, content, alert, position, star) => {
  const convertMarkdown = (text) => {
    const rawHtml = marked(text); // Convert Markdown to HTML
    return purify.sanitize(rawHtml); // Sanitize the converted HTML
  };

  const title_markdown = convertMarkdown(title);
  const content_markdown = convertMarkdown(content);

  const noteQuery = "SELECT * FROM notes WHERE uid = $1;";
  const noteResult = await pool.query(noteQuery, [id]);

  //rention of old values
  title = title !== undefined ? title : noteResult.title;
  title_markdown =
    title !== undefined ? title_markdown : noteResult.title_markdown;
  content = content !== undefined ? content : noteResult.content;
  content_markdown =
    content !== undefined ? content_markdown : noteResult.content_markdown;
  alert = alert !== undefined ? alert : noteResult.alert;
  position = position !== undefined ? position : noteResult.position;
  star = star !== undefined ? star : noteResult.star;

  const query =
    " UPDATE notes SET title = $1, content = $2,content_markdown = $3,title_markdown = $4, alert = $5,position = $6,star=$7 WHERE  id= $8 RETURNING *;";
  const values = [
    title,
    content,
    content_markdown,
    title_markdown,
    alert,
    position,
    star,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Function to get all notes
const getNotes = async (id) => {
  const query = "SELECT * FROM notes WHERE uid=$1 ORDER BY star DESC, created_at DESC;";
  const value=[id];
  const { rows } = await pool.query(query,value);
  return rows;
};

const getNoteById = async (id) => {
  const query = "SELECT * FROM notes WHERE id=$1";
  const value=[id];
  const { rows } = await pool.query(query,value);
  return rows;
};

// Function to sort all notes
const sortNote = async (id,type) => {
  let query = "SELECT * FROM notes WHERE uid=$1 ORDER BY star DESC, created_at DESC;";
  if (type == "title") {
    query = "SELECT * FROM notes WHERE uid=$1 ORDER BY title DESC, created_at DESC;";
  } else if (type == "date") {
    query = "SELECT * FROM notes WHERE uid=$1 ORDER BY created_at DESC;";
  } else if (type == "size") {
    query =
      "SELECT * FROM notes WHERE uid=$1 ORDER BY content_markdown DESC, created_at DESC;";
  } else if (type == "alert") {
    query = "SELECT * FROM notes WHERE uid=$1 ORDER BY alert DESC, created_at DESC;";
  }
  const value=[id]
  const { rows } = await pool.query(query,value);
  return rows;
};


//Function to delete note
const deleteNote = async (id) => {
  const query = "DELETE FROM notes WHERE id = $1 RETURNING *;";
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

// Function to delete all notes for a given user ID
const deleteAllNotes = async (uid) => {
  const query = "DELETE FROM notes WHERE uid = $1 RETURNING *;";
  const values = [uid];
  const { rows } = await pool.query(query, values);
  return rows;
};

// Initialize the table when the app starts
createSettingTable();
createUserTable();
createNoteTable();

export {
  addUser,
  updateLogin,
  getUser,
  deleteUser,
  getSetting,
  changeSetting,
  addNote,
  updateNote,
  sortNote,
  getNotes,
  getNoteById,
  deleteNote,
  deleteAllNotes,
};
