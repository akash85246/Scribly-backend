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
   CREATE TABLE IF NOT EXISTS scribly_users (
    id SERIAL PRIMARY KEY,
    profile_picture TEXT DEFAULT NULL,
    username VARCHAR(50) NOT NULL ,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    sid INTEGER, -- Foreign key referencing scribly_settings
    last_online TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_settings FOREIGN KEY (sid) REFERENCES scribly_settings(id) ON DELETE SET NULL
)
  `;
  await pool.query(query);
  console.log("✅ User table is ready");
};

const addUser = async (username, profile_picture, email, password) => {
  const settings = await createSetting();
  const sid = settings[0].id;
  const query =
    "INSERT INTO scribly_users (username,profile_picture,email,password,sid) VALUES ($1, $2,$3,$4,$5) RETURNING *";
  const values = [username, profile_picture, email, password, sid];

  const { rows } = await pool.query(query, values);
  return rows;
};

const getUser = async (email) => {
  const query =
    "SELECT username,profile_picture,email,sid,id,last_online FROM scribly_users WHERE email=$1";
  const values = [email];
  const { rows } = await pool.query(query, values);
  return rows;
};

const deleteUser = async (id) => {
  const query = "DELETE FROM scribly_users WHERE id = $1 RETURNING *;";
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

const updateLogin = async (id) => {
  const date = new Date();
  const query = `
      UPDATE scribly_users
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
    CREATE TABLE IF NOT EXISTS scribly_settings (
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
    "INSERT INTO scribly_settings (darkmode,bg,drag,notification,last_updated_at) VALUES ($1, $2,$3,$4,$5) RETURNING *";
  const values = [darkmode, bg, drag, notification, last_updated_at];
  const { rows } = await pool.query(query, values);
  return rows;
};

const changeSetting = async (
  sid,
  darkmode,
  bg,
  drag,
  notification,
  last_updated_at
) => {
  const userQuery = "SELECT * FROM scribly_settings WHERE id = $1;";
  const userResult = await pool.query(userQuery, [sid]);

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
        UPDATE scribly_settings
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
        INSERT INTO scribly_settings (darkmode, bg, drag, notification, last_updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
    values = [
      darkmode ?? false,
      bg ?? null,
      drag ?? true,
      notification ?? true,
      new Date(),
    ];
  }

  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

const getSetting = async (sid) => {
  const query = "SELECT * FROM scribly_settings WHERE id=$1";
  const value = [sid];
  const { rows } = await pool.query(query, value);
  return rows;
};

const createNoteTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS scribly_notes (
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
    CONSTRAINT fk_notes_users FOREIGN KEY (uid) REFERENCES scribly_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_settings FOREIGN KEY (sid) REFERENCES scribly_settings(id) ON DELETE SET NULL
);
  `;
  await pool.query(query);
  console.log("✅ Note table is ready");
};

// Function to add a new note
const addNote = async (id, sid, title, content, alert, position) => {
  const convertMarkdown = (text) => {
    const rawHtml = marked(text);
    return purify.sanitize(rawHtml);
  };

  const title_markdown = convertMarkdown(title);
  const content_markdown = convertMarkdown(content);

  const query = `INSERT INTO scribly_notes (uid ,sid,title, content,content_markdown,title_markdown, alert,position) VALUES ($1, $2,$3,$4,$5,$6,$7,$8) RETURNING *`;
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

const updateNote = async ({ id, title, content, alert, position, star }) => {
  const convertMarkdown = (text) => {
    const rawHtml = marked(text);
    return purify.sanitize(rawHtml);
  };

  const noteQuery = "SELECT * FROM scribly_notes WHERE id = $1;";
  const noteResult = (await pool.query(noteQuery, [id])).rows[0];

  let title_markdown = noteResult.title_markdown;
  let content_markdown = noteResult.content_markdown;

  if (title !== undefined && title !== noteResult.title) {
    title_markdown = convertMarkdown(title);
  }
  if (content !== undefined && content !== noteResult.content) {
    content_markdown = convertMarkdown(content);
  }

  // Retain old values if new ones are undefined
  title = title !== undefined ? title : noteResult.title;
  content = content !== undefined ? content : noteResult.content;
  alert = alert !== undefined ? alert : noteResult.alert;
  position = position !== undefined ? position : noteResult.position;
  star = star !== undefined ? star : noteResult.star;

  const query = `
    UPDATE scribly_notes 
    SET title = $1, content = $2, content_markdown = $3, title_markdown = $4, 
        alert = $5, position = $6, star = $7 
    WHERE id = $8 
    RETURNING *;
  `;
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

//Function to swap scribly_notes
const swapNote = async ({ id1, id2 }) => {
  const client = await pool.connect(); // Start transaction
  try {
    await client.query("BEGIN");

    const note1 = await getNoteById(id1);
    const note2 = await getNoteById(id2);

    if (note1.star !== note2.star) {
      throw new Error("Cannot swap starred and non-starred scribly_notes");
    }

    const pos1 = note1.position;
    const pos2 = note2.position;

    const query = `UPDATE scribly_notes SET position = $1 WHERE id = $2 RETURNING *;`;

    // Swap positions
    const { rows: rows1 } = await client.query(query, [pos2, id1]);
    const { rows: rows2 } = await client.query(query, [pos1, id2]);

    await client.query("COMMIT"); // Commit transaction

    return { note1: rows1[0], note2: rows2[0] };
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback if any error occurs
    console.error("Error swapping scribly_notes:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Function to get all notes
const getNotes = async (id) => {
  const query =
    "SELECT * FROM scribly_notes WHERE uid=$1 ORDER BY star DESC, position ASC;";
  const value = [id];
  const { rows } = await pool.query(query, value);
  return rows;
};

//Function to get note by ID
const getNoteById = async (id) => {
  const query = "SELECT * FROM scribly_notes WHERE id=$1";
  const value = [id];
  const { rows } = await pool.query(query, value);
  return rows[0];
};


const getAlertNotes = async () => {
  const query = `
    SELECT 
      s.id AS subscription_id, 
      s.uid AS user_id, 
      s.endpoint, 
      s.keys, 
      n.id AS note_id, 
      n.alert ,
      n.title_markdown,
      n.content_markdown
    FROM scribly_subscriptions s 
    LEFT JOIN scribly_notes n ON s.uid = n.uid 
    WHERE n.alert IS NOT NULL AND n.alert >= NOW();
  `;

  const { rows } = await pool.query(query);
  return rows;
};

//Function to delete note
const deleteNote = async (id) => {
  const query = "DELETE FROM scribly_notes WHERE id = $1 RETURNING *;";
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

// Function to delete all notes for a given user ID
const deleteAllNotes = async (uid) => {
  const query = "DELETE FROM scribly_notes WHERE uid = $1 RETURNING *;";
  const values = [uid];
  const { rows } = await pool.query(query, values);
  return rows;
};

const createSubscriptionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS scribly_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT NOT NULL UNIQUE,
      keys JSONB NOT NULL,
      uid INTEGER NOT NULL,
      CONSTRAINT fk_subscription_users FOREIGN KEY (uid) REFERENCES scribly_users(id) ON DELETE CASCADE
    )
  `;
  await pool.query(query);
  console.log("✅ Subscription table is ready");
};

const addUserSubscription = async ({ endpoint, keys, uid }) => {
  const query = `
    INSERT INTO scribly_subscriptions (endpoint, keys,uid) 
    VALUES ($1, $2, $3) 
    RETURNING *`;
  const values = [endpoint, keys, uid];

  const { rows } = await pool.query(query, values);
  return rows;
};

const removeUserSubscription = async ({ uid }) => {
  // Check if the email exists
  const findQuery = "SELECT * FROM scribly_subscriptions WHERE uid = $1;";
  const findValues = [uid];
  const findResult = await pool.query(findQuery, findValues);

  if (findResult.rows.length === 0) {
    console.warn(`No subscription found for uid: ${uid}`);
    return [];
  }

  const query = "DELETE FROM scribly_subscriptions WHERE uid = $1 RETURNING *";
  const values = [uid];
  const { rows } = await pool.query(query, values);

  return rows;
};

const initializeDatabase = async () => {
  try {
    await createSettingTable();       
    await createUserTable();          
    await createNoteTable();         
    await createSubscriptionsTable();
    console.log("✅ All tables initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
  }
};

initializeDatabase();

export {
  addUser,
  updateLogin,
  getUser,
  deleteUser,
  getSetting,
  changeSetting,
  addNote,
  updateNote,
  swapNote,
  getNotes,
  getNoteById,
  deleteNote,
  deleteAllNotes,
  addUserSubscription,
  removeUserSubscription,
  getAlertNotes,
};
