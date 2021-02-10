/* eslint-disable */
import gsap from 'gsap';

class Navigation {
  constructor() {
    this.accountMenu = document.querySelector('.account__burger');
    this.burger = document.querySelector('.header__burger');
    this.menu = document.querySelector('.header-menu');
    this.scroltoTop = document.querySelector('.footer-links-scrollbtn');
    this.events();
  }

  events() {
    this.burger.addEventListener('click', this.menuToggle);
    this.scroltoTop.addEventListener('click', this.topFunction);
    // this.accountMenu.addEventListener('click', this.accountMenuToggle);
  }
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
  accountMenuToggle(e) {
    if (!e.target.classList.contains('active')) {
      e.target.classList.add('active');
      gsap.to('.account__burger-menu__icon', 0.5, {
        rotate: '90',
        fill: '#ffb63b'
      });
      gsap.to('.account__burger', 0.5, {
        background: '#ffb63b'
      });
      gsap.to('.account__burger', { zIndex: 300 });
      gsap.to('.sidebar', 1, { left: '0%' });
      document.body.classList.add('hide');
    } else {
      e.target.classList.remove('active');
      gsap.to('.account__burger-menu__icon', 0.5, {
        rotate: '0',
        fill: '#ffb63b'
      });
      gsap.to('.account__burger', 0.5, {
        background: 'black'
      });
      gsap.to('.sidebar', 1, { left: '-100%' });
      document.body.classList.remove('hide');
    }
  }
  menuToggle(e) {
    if (!e.target.classList.contains('active')) {
      e.target.classList.add('active');
      gsap.to('.header__burger--line1', 0.5, {
        rotate: '45',
        y: 8
      });
      gsap.to('.header__burger--line2', 0.5, {
        rotate: '-45',
        y: -2
      });
      gsap.to('.header__burger', { zIndex: 400 });
      gsap.to('.header-menu', 1, { clipPath: 'circle(200% at 100% -10%)' });
      document.body.classList.add('hide');
    } else {
      e.target.classList.remove('active');
      gsap.to('.header__burger--line1', 0.5, {
        rotate: '0',
        y: 0,
        background: '#ffb63b'
      });
      gsap.to('.header__burger--line2', 0.5, {
        rotate: '-0',
        y: 0,
        background: '#ffb63b'
      });
      gsap.to('.header-menu', 1, { clipPath: 'circle(50px at 100% -10%)' });
      document.body.classList.remove('hide');
    }
  }
}

module.exports = Navigation;
