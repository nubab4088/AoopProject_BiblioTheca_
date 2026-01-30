/**
 * Books Data Registry
 * 
 * Central source of truth for all library books with corruption metadata.
 * Each book MUST have:
 * - id: unique identifier
 * - title: book title
 * - author: author name
 * - category: genre/category
 * - isbn: ISBN number
 * - isCorrupted: whether book requires dungeon purification
 * - description: book description
 * - requiredGameId: specific game needed to unlock (for corrupted books)
 * - virusName: corruption identifier (for corrupted books)
 */

export const books = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    category: "COMPUTER SCIENCE",
    isbn: "9780262033848",
    isCorrupted: true,
    description: "The standard textbook on algorithms.",
    requiredGameId: 'circuit-overload',
    virusName: 'LOGIC_BOMB'
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "SOFTWARE ENGINEERING",
    isbn: "9780132350884",
    isCorrupted: true,
    description: "Agile software craftsmanship.",
    requiredGameId: 'cipher-breaker',
    virusName: 'ENCRYPTED_SYNTAX'
  },
  {
    id: 3,
    title: "Design Patterns",
    author: "Erich Gamma",
    category: "SOFTWARE ENGINEERING",
    isbn: "9780201633610",
    isCorrupted: true,
    description: "Reusable object-oriented software.",
    requiredGameId: 'memory-matrix',
    virusName: 'PATTERN_DECAY'
  },
  {
    id: 4,
    title: "It",
    author: "Stephen King",
    category: "FICTION",
    isbn: "9780670813025",
    isCorrupted: true,
    description: "A novel of childhood terror and triumph.",
    requiredGameId: 'signal-lock',
    virusName: 'SIGNAL_NOISE'
  },
  {
    id: 5,
    title: "The Da Vinci Code",
    author: "Dan Brown",
    category: "FICTION",
    isbn: "9780385504201",
    isCorrupted: true,
    description: "A murder mystery thriller combining art, history, and religion.",
    requiredGameId: 'glitch-purge',
    virusName: 'DATA_ROT'
  },
  {
    id: 6,
    title: "Cosmos",
    author: "Carl Sagan",
    category: "SCIENCE",
    isbn: "9780375508325",
    isCorrupted: true,
    description: "A personal voyage through space and time.",
    requiredGameId: 'neural-dash',
    virusName: 'QUANTUM_FLUX'
  },
  {
    id: 7,
    title: "The Infinite Library",
    author: "Jorge Luis Borges",
    category: "FICTION",
    isbn: "9780811200127",
    isCorrupted: true,
    description: "The universe is a library.",
    requiredGameId: 'memory-matrix',
    virusName: 'RECURSION_VIRUS'
  },
  {
    id: 8,
    title: "The Mythical Man-Month",
    author: "Frederick P. Brooks Jr.",
    category: "SOFTWARE ENGINEERING",
    isbn: "9780201835953",
    isCorrupted: true,
    description: "Essays on software engineering.",
    requiredGameId: 'cipher-breaker',
    virusName: 'COMPLEXITY_LEAK'
  },
  {
    id: 9,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    category: "SOFTWARE ENGINEERING",
    isbn: "9780201616224",
    isCorrupted: true,
    description: "From journeyman to master.",
    requiredGameId: 'circuit-overload',
    virusName: 'LEGACY_CODE'
  }
];

/**
 * Game ID to Name Mapping
 * Used for display purposes in UI
 */
export const GAME_NAMES = {
  'memory-matrix': 'MEMORY MATRIX',
  'glitch-purge': 'GLITCH PURGE',
  'circuit-overload': 'CIRCUIT OVERLOAD',
  'cipher-breaker': 'CIPHER BREAKER',
  'signal-lock': 'SIGNAL LOCK',
  'neural-dash': 'NEURAL DASH',
  'data-broker': 'DATA BROKER'
};

/**
 * Helper function to get readable game name
 * @param {string} gameId - The game identifier
 * @returns {string} Human-readable game name
 */
export const getGameName = (gameId) => {
  return GAME_NAMES[gameId] || 'UNKNOWN PROTOCOL';
};

/**
 * Helper function to find book by ID
 * @param {number|string} bookId - The book identifier
 * @returns {Object|undefined} Book object or undefined
 */
export const findBookById = (bookId) => {
  return books.find(b => b.id === parseInt(bookId));
};

export default books;
