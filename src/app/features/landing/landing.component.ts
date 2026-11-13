import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <header class="landing-navbar">
      <div class="landing-navbar-container">
        <a routerLink="/" class="landing-brand">
          <div class="landing-brand-icon"><i class="bi bi-heart-pulse"></i></div>
          <div class="landing-brand-text">
            <strong>Centro de Salud Buenos Aires de Villa</strong>
            <span>Sistema de Gestión Médica</span>
          </div>
        </a>

        <nav class="landing-nav-menu">
          <a routerLink="/auth/login" class="landing-nav-link landing-login">
            <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
          </a>
          <a href="#servicios" class="landing-nav-link">Servicios</a>
          <a href="#nosotros" class="landing-nav-link">Nosotros</a>
          <a href="#contacto" class="landing-nav-link">Contacto</a>
        </nav>
      </div>
    </header>

    <section class="landing-hero">
      <div class="landing-container">
        <div class="landing-hero-content">
          <div class="landing-hero-label">
            <i class="bi bi-heart-pulse"></i> Atención médica integral
          </div>
          <h1>Cuidamos tu salud, <span>cuidamos de ti.</span></h1>
          <p>
            En el Centro de Salud Buenos Aires de Villa trabajamos para brindar
            atención médica de calidad a las familias de nuestra comunidad.
          </p>
          <div class="landing-hero-buttons">
            <a routerLink="/auth/login" class="landing-btn-primary">
              <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
            </a>
            <a href="#servicios" class="landing-btn-outline">
              Conocer nuestros servicios <i class="bi bi-arrow-down"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-services" id="servicios">
      <div class="landing-container">
        <div class="landing-section-heading">
          <h2>Nuestros Servicios</h2>
          <p>Atención especializada para cuidar de ti y de tu familia.</p>
          <div class="landing-section-line"></div>
        </div>

        <div class="landing-services-grid">
          <div class="landing-service-card">
            <div class="landing-service-icon"><i class="bi bi-activity"></i></div>
            <h3>Medicina General</h3>
            <p>Consultas médicas generales con profesionales altamente capacitados para tu diagnóstico y tratamiento.</p>
          </div>
          <div class="landing-service-card">
            <div class="landing-service-icon"><i class="bi bi-heart-pulse"></i></div>
            <h3>Cardiología</h3>
            <p>Estudios especializados del corazón con tecnología avanzada para el cuidado de tu salud cardiovascular.</p>
          </div>
          <div class="landing-service-card">
            <div class="landing-service-icon"><i class="bi bi-capsule"></i></div>
            <h3>Pediatría</h3>
            <p>Atención médica especializada para los más pequeños del hogar con cariño y profesionalismo.</p>
          </div>
          <div class="landing-service-card">
            <div class="landing-service-icon"><i class="bi bi-eye"></i></div>
            <h3>Oftalmología</h3>
            <p>Cuidado integral de la salud visual con exámenes completos y tratamientos personalizados.</p>
          </div>
          <div class="landing-service-card">
            <div class="landing-service-icon"><i class="bi bi-emoji-smile"></i></div>
            <h3>Odontología</h3>
            <p>Sonrisas saludables con tratamientos dentales y atención de calidad.</p>
          </div>
          <div class="landing-service-card">
            <div class="landing-service-icon"><i class="bi bi-cpu"></i></div>
            <h3>Diagnóstico por Imagen</h3>
            <p>Equipos de última generación para rayos X, ecografías y estudios médicos.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-about" id="nosotros">
      <div class="landing-container">
        <div class="landing-about-grid">
          <div class="landing-about-content">
            <h2>Sobre Nosotros</h2>
            <div class="landing-about-line"></div>
            <p>
              Desde nuestra fundación en el corazón de Chorrillos, el
              <strong>Centro Materno Infantil Buenos Aires de Villa</strong>
              ha sido el hogar médico de miles de familias de Lima Sur.
            </p>
            <p>
              Nos enorgullece ser el primer punto de contacto para el cuidado de
              tu salud, especializándonos en el acompañamiento de las madres
              desde el primer mes de gestación y en el crecimiento saludable de
              los más pequeños.
            </p>
            <div class="landing-about-highlight">
              <div class="landing-highlight-icon"><i class="bi bi-people-fill"></i></div>
              <div>
                <strong>Atención para toda la familia</strong>
                <span>Profesionales comprometidos con tu bienestar.</span>
              </div>
            </div>
          </div>

          <div class="landing-about-visual"></div>
        </div>
      </div>
    </section>

    <section class="landing-contact" id="contacto">
      <div class="landing-container">
        <div class="landing-contact-grid">
          <div class="landing-contact-column">
            <h3><i class="bi bi-heart-pulse"></i> Centro de Salud Buenos Aires de Villa</h3>
            <p>Tu centro médico de confianza. Atención integral con profesionales comprometidos con la salud de nuestra comunidad.</p>
          </div>

          <div class="landing-contact-column">
            <h3>Contacto</h3>
            <div class="landing-contact-item">
              <i class="bi bi-geo-alt"></i>
              <span>Ca. 15 de Octubre 15057, Chorrillos</span>
            </div>
            <div class="landing-contact-item">
              <i class="bi bi-telephone"></i>
              <span>+51 945 788 574</span>
            </div>
            <div class="landing-contact-item">
              <i class="bi bi-envelope"></i>
              <span>CS_BuenosAires&#64;gmail.com</span>
            </div>
          </div>

          <div class="landing-contact-column">
            <h3>Horario de atención</h3>
            <div class="landing-contact-item">
              <i class="bi bi-clock"></i>
              <span>Lunes a Viernes<br />8:00 - 20:00</span>
            </div>
            <div class="landing-contact-item">
              <i class="bi bi-clock"></i>
              <span>Sábados<br />8:00 - 14:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-container">
        <p>© 2026 Centro de Salud Buenos Aires de Villa. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
})
export class LandingComponent {}
