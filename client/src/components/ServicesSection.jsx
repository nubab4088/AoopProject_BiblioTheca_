import React from 'react';

const ServicesSection = ({ servicesData }) => {
  return (
    <section className="info-cards" id="services">
      <div className="container" style={{ overflow: 'hidden' }}>
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
                    <div 
                      className="card-icon" 
                      style={{ color: '#00e5ff', fontSize: '2rem', marginBottom: '1rem' }}
                    >
                      <i className={service.icon}></i>
                    </div>
                    <h3>{service.title}</h3>
                    <div className="card-content">
                      <p style={{ marginBottom: '1rem' }}>{service.desc}</p>
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
  );
};

export default ServicesSection;