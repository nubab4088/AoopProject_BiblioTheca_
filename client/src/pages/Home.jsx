import { useState } from 'react';

const Home = ({ 
  books, 
  handleBookClick, 
  setShowSignup,
  servicesData, 
  newsData 
}) => {
  return (
    <>
      {/* --- HERO --- */}
      <section className="hero" id="home">
        <div className="hero-slider">
          <div className="slide active">
            <div className="slide-content">
              <h1>WELCOME TO OUR LIBRARY</h1>
              <p>Discover a world of knowledge... and what lies beneath.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEARCH --- */}
      <section className="search-section">
        <div className="container">
          <h2>Search Your Learning Content</h2>
          <div className="search-box">
            <select className="search-type">
              <option>By Title</option>
              <option>By Author</option>
              <option>By Category</option>
            </select>
            <input type="text" placeholder="Search by Keyword" className="search-input" />
            <button className="search-btn"><i className="fas fa-search"></i> SEARCH</button>
          </div>
        </div>
      </section>

      {/* --- SERVICES (SLIDING ANIMATION) --- */}
      <section className="info-cards" id="services">
        <div className="container" style={{overflow:'hidden'}}>
          <div className="services-scroll-wrapper">
            <div className="services-track">
              {[...servicesData, ...servicesData, ...servicesData].map((service, index) => (
                <div className="service-slide-card" key={index}>
                  {service.type === 'text' ? (
                    <>
                      <h3>{service.title}</h3>
                      <div className="card-content">{service.content}</div>
                    </>
                  ) : (
                    <>
                      <div className="card-icon" style={{color:'#00e5ff', fontSize:'2rem', marginBottom:'1rem'}}>
                        <i className={service.icon}></i>
                      </div>
                      <h3>{service.title}</h3>
                      <div className="card-content">
                        <p style={{marginBottom:'1rem'}}>{service.desc}</p>
                        <a 
                          href={service.link} 
                          target={service.link.startsWith('http') ? "_blank" : "_self"} 
                          rel="noopener noreferrer"
                          className="service-btn"
                        >
                          {service.btnText}
                        </a>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- BOOKS GRID --- */}
      <section className="books-section" id="books">
        <div className="container">
          <h2>FIND BOOKS</h2>
          <div className="books-grid" id="booksGrid">
            {books.map((book) => (
              <div key={book.id} className="book-card" onClick={() => handleBookClick(book)}>
                <div className="book-image">
                  <img 
                    src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`} 
                    alt={book.title}
                    onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/200x300/2C2F48/FFF?text=No+Cover'}}
                  />
                  <span className="badge">{book.category}</span>
                </div>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p className="author">by {book.author}</p>
                  <button className="read-more" style={{background:'none', border:'none', cursor:'pointer', padding:0}}>
                    EXPLORE <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEWS SECTION --- */}
      <section className="news-section" id="news">
        <div className="container">
            <h2>NEWS & EVENTS</h2>
            <div className="news-grid">
                {newsData.map((item, index) => (
                  <div className="news-card" key={index}>
                      <h3>{item.title}</h3>
                      <div className="news-content">
                          <p>{item.desc}</p>
                          <a href="#" className="read-more">READ MORE</a>
                      </div>
                      <p className="news-date"><i className="fas fa-calendar"></i> {item.date}</p>
                  </div>
                ))}
            </div>
        </div>
      </section>
    </>
  );
};

export default Home;
