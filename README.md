# LUMORA BOOKS

A premium, immersive online bookstore landing page built with HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and MongoDB.

**Tagline:** "Stories That Stay With You."

## Features

- **Premium Editorial Design** - Warm literary palette with sophisticated typography
- **Dynamic Book Loading** - Books fetched from MongoDB via REST API
- **Advanced Search** - Real-time search by title, author, and category
- **Category Filtering** - Dynamic filtering without page reload
- **Shopping Cart** - Full cart functionality with localStorage persistence
- **Wishlist System** - Save favorite books with localStorage
- **Book Preview Modal** - Detailed book information in animated modal
- **Responsive Design** - Optimized for all screen sizes (320px to 1440px+)
- **Smooth Animations** - Professional micro-interactions and transitions
- **Newsletter System** - Email subscription with MongoDB storage
- **Testimonial Carousel** - Auto-advancing slider with navigation
- **Accessibility** - Semantic HTML, keyboard navigation, ARIA labels

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Fonts:** Google Fonts (Playfair Display, Inter)
- **Images:** Unsplash

## Project Structure

```
lumora-books/
│
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Complete CSS design system
│   ├── js/
│   │   └── script.js       # JavaScript interactions
│   └── images/             # Image assets
│
├── models/
│   ├── Book.js             # Book Mongoose model
│   └── Subscriber.js       # Subscriber Mongoose model
│
├── routes/
│   ├── bookRoutes.js       # Book API endpoints
│   └── subscriberRoutes.js # Subscriber API endpoints
│
├── server.js               # Express server
├── seed.js                 # Database seed script
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Setup Steps

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env` file is already configured with:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/lumora-books
   NODE_ENV=development
   ```
   
   If using MongoDB Atlas, update the `MONGODB_URI` with your connection string.

4. **Start MongoDB**
   
   Make sure MongoDB is running locally:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Seed the database**
   
   Populate MongoDB with sample book data:
   ```bash
   node seed.js
   ```

6. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Open in browser**
   
   Navigate to: `http://localhost:3000`

## API Endpoints

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book by ID
- `GET /api/books/category/:category` - Get books by category

### Subscribers

- `POST /api/subscribers` - Subscribe to newsletter

## Database Models

### Book Model

```javascript
{
  title: String,
  author: String,
  description: String,
  price: Number,
  category: String,
  genre: String,
  coverImage: String,
  rating: Number,
  pages: Number,
  publicationYear: Number,
  featured: Boolean,
  createdAt: Date
}
```

### Subscriber Model

```javascript
{
  email: String,
  createdAt: Date
}
```

## Color System

```css
--paper: #F5F0E8
--paper-dark: #E9E0D2
--ink: #171717
--burgundy: #642F3A
--gold: #B39462
--muted: #77706A
```

## Typography

- **Headings:** Playfair Display
- **Body:** Inter

## Features Breakdown

### Navigation
- Sticky navbar with scroll transition
- Mobile-responsive hamburger menu
- Animated mobile menu overlay

### Hero Section
- Editorial typography
- Animated book covers with floating effect
- Call-to-action buttons

### Book Cards
- Hover effects with lift and shadow
- Wishlist functionality
- Add to cart
- Read more modal

### Search
- Real-time search with debouncing
- Search by title, author, category
- Beautiful empty states

### Cart
- Slide-in drawer from right
- Quantity adjustment
- Remove items
- Persistent with localStorage

### Categories
- Dynamic filtering
- Active state indicators
- Smooth transitions

### Newsletter
- Email validation
- MongoDB storage
- Success/error feedback

## Responsive Breakpoints

- 320px - Mobile minimum
- 375px - Mobile small
- 480px - Mobile large
- 768px - Tablet
- 1024px - Desktop small
- 1200px - Desktop medium
- 1440px - Desktop large

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Lazy loading images
- CSS transforms for animations
- Debounced search input
- Efficient DOM manipulation
- LocalStorage for cart/wishlist

## Accessibility Features

- Semantic HTML structure
- ARIA labels
- Keyboard navigation
- Focus states
- Reduced motion support
- Alt text for images

## Development

### Adding New Books

Edit the `seed.js` file and add new book objects to the `books` array, then run:
```bash
node seed.js
```

### Customizing Colors

Edit CSS variables in `public/css/style.css`:
```css
:root {
  --paper: #F5F0E8;
  --ink: #171717;
  /* ... etc */
}
```

### Modifying API Routes

Edit files in the `routes/` directory. The server will need to be restarted for changes to take effect.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your MONGODB_URI in .env
- Verify MongoDB credentials if using Atlas

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 3000

### Books Not Loading
- Run seed.js to populate database
- Check browser console for errors
- Verify API endpoints are working

## License

ISC

## Author

Created as an interview project demonstrating full-stack development skills.

---

**LUMORA BOOKS — Stories That Stay With You.**
