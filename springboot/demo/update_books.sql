-- Update Book 4: It by Stephen King
UPDATE books SET 
    title = 'It', 
    author = 'Stephen King', 
    category = 'FICTION', 
    isbn = '9780670813025', 
    description = 'A novel of childhood terror and triumph. Stephen King''s terrifying, classic #1 New York Times bestseller is a landmark in American literature.',
    is_corrupted = true
WHERE id = 4;

-- Update Book 5: The Da Vinci Code by Dan Brown
UPDATE books SET 
    title = 'The Da Vinci Code', 
    author = 'Dan Brown', 
    category = 'FICTION', 
    isbn = '9780385504201', 
    description = 'A murder inside the Louvre, and clues in Da Vinci paintings, lead to the discovery of a religious mystery protected by a secret society for two thousand years.',
    is_corrupted = true
WHERE id = 5;

-- Update Book 6: Cosmos by Carl Sagan
UPDATE books SET 
    title = 'Cosmos', 
    author = 'Carl Sagan', 
    category = 'SCIENCE', 
    isbn = '9780375508325', 
    description = 'A personal voyage through space and time. Cosmos traces the origins of knowledge and the scientific method, mixing science and philosophy.',
    is_corrupted = true
WHERE id = 6;
