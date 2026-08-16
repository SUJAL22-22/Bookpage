require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

// Sample book data
const books = [
  {
    title: 'The Silent Garden',
    author: 'Elena Hart',
    description: 'A beautifully written story about memory, identity and the places we carry within us. Set in a mysterious garden where secrets bloom like flowers, this novel explores the delicate balance between past and present.',
    price: 599,
    category: 'Fiction',
    genre: 'Literary Fiction',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    rating: 4.8,
    pages: 324,
    publicationYear: 2024,
    featured: true
  },
  {
    title: 'Letters We Never Sent',
    author: 'Noah Bennett',
    description: 'A poignant collection of unsent letters that reveal the hidden conversations we have with ourselves and others. A deeply moving exploration of love, loss, and the words left unspoken.',
    price: 699,
    category: 'Fiction',
    genre: 'Contemporary Fiction',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    rating: 4.6,
    pages: 288,
    publicationYear: 2023,
    featured: false
  },
  {
    title: 'The Last Library',
    author: 'Clara Moore',
    description: 'In a world where books are forbidden, one librarian risks everything to preserve humanity\'s stories. A dystopian tale about the power of knowledge and the courage to remember.',
    price: 799,
    category: 'Science Fiction',
    genre: 'Dystopian',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    rating: 4.7,
    pages: 412,
    publicationYear: 2024,
    featured: false
  },
  {
    title: 'Midnight in Kyoto',
    author: 'Daniel Reed',
    description: 'A mesmerizing journey through the hidden corners of Kyoto, where ancient traditions meet modern mysteries. A cultural thriller that will transport you to Japan\'s most enigmatic city.',
    price: 649,
    category: 'Mystery',
    genre: 'Cultural Thriller',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    rating: 4.5,
    pages: 356,
    publicationYear: 2023,
    featured: false
  },
  {
    title: 'A Map of Memories',
    author: 'Sophia Lane',
    description: 'An intimate memoir about mapping one\'s life through the places that shaped us. From childhood homes to foreign cities, discover how geography becomes biography.',
    price: 749,
    category: 'Biography',
    genre: 'Memoir',
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    rating: 4.9,
    pages: 298,
    publicationYear: 2024,
    featured: false
  },
  {
    title: 'Beyond the Horizon',
    author: 'Ethan Cole',
    description: 'A groundbreaking exploration of what lies beyond our current understanding of science and philosophy. Challenge your perceptions of reality and possibility.',
    price: 899,
    category: 'Science Fiction',
    genre: 'Hard Science Fiction',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
    rating: 4.4,
    pages: 456,
    publicationYear: 2023,
    featured: false
  },
  {
    title: 'The Art of Stillness',
    author: 'Maya Chen',
    description: 'In our fast-paced world, discover the transformative power of pause. A practical guide to finding peace and clarity through mindfulness and intentional living.',
    price: 549,
    category: 'Self Development',
    genre: 'Mindfulness',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    rating: 4.6,
    pages: 224,
    publicationYear: 2024,
    featured: false
  },
  {
    title: 'Empire of Shadows',
    author: 'James Wright',
    description: 'An epic historical saga spanning three generations of a family caught between duty and desire. From the opulent courts to the battlefields of destiny.',
    price: 849,
    category: 'History',
    genre: 'Historical Fiction',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop',
    rating: 4.7,
    pages: 528,
    publicationYear: 2023,
    featured: false
  },
  {
    title: 'Whispers of the Heart',
    author: 'Lily Anderson',
    description: 'A tender romance that proves love knows no boundaries. Set against the backdrop of a small coastal town, two souls find each other against all odds.',
    price: 599,
    category: 'Romance',
    genre: 'Contemporary Romance',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop',
    rating: 4.5,
    pages: 312,
    publicationYear: 2024,
    featured: false
  },
  {
    title: 'The Innovation Mindset',
    author: 'Robert Kim',
    description: 'Unlock your creative potential with this comprehensive guide to innovative thinking. Learn the strategies used by world-class entrepreneurs and visionaries.',
    price: 799,
    category: 'Business',
    genre: 'Business Strategy',
    coverImage: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=600&fit=crop',
    rating: 4.3,
    pages: 384,
    publicationYear: 2023,
    featured: false
  },
  {
    title: 'Shadows in the Mist',
    author: 'Emma Blackwood',
    description: 'A gripping psychological thriller that will keep you guessing until the final page. When a woman\'s past returns to haunt her, nothing is as it seems.',
    price: 649,
    category: 'Mystery',
    genre: 'Psychological Thriller',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    rating: 4.6,
    pages: 340,
    publicationYear: 2024,
    featured: false
  },
  {
    title: 'Quantum Dreams',
    author: 'Dr. Sarah Mitchell',
    description: 'Explore the fascinating intersection of quantum physics and consciousness. A mind-bending journey into the nature of reality itself.',
    price: 899,
    category: 'Science Fiction',
    genre: 'Science Philosophy',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop',
    rating: 4.8,
    pages: 420,
    publicationYear: 2023,
    featured: false
  }
];

// Seed database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert new books
    const insertedBooks = await Book.insertMany(books);
    console.log(`Inserted ${insertedBooks.length} books`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
