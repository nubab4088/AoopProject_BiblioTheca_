import React from 'react';

const NewsSection = ({ newsData }) => {
  return (
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
              <p className="news-date">
                <i className="fas fa-calendar"></i> {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;