/* eslint-disable */

import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CSSRulePlugin } from 'gsap/CSSRulePlugin';

gsap.registerPlugin(CSSRulePlugin, TextPlugin, ScrollTrigger);

class Intro {
  constructor() {
    this.welcomeScreen = document.querySelector('.board-welcome');
    this.welcomeScreen1 = document.querySelector('.board-welcome-screen-1');
    this.welcomeScreen2 = document.querySelector('.board-welcome-screen-2');
    this.screemOne = document.querySelector('.btn-screen-1');
    this.screemTwo = document.querySelector('.btn-screen-2');
    this.skipIntro = document.querySelector('.skip-text-intro');
    this.skipIntroBtn = document.querySelector('.skip-to-home');
    this.preloaderArray = document.querySelectorAll('.loader-btn');
    this.loader();
  }

  loader() {
    window.onload = () => {
      if (localStorage.getItem('hasCodeRunBefore') === null) {
        if (window.innerWidth <= 600) {
          this.events();
          localStorage.setItem('hasCodeRunBefore', null);
        }
      }
    };

    const mouse = document.querySelector('.cursor');

    window.addEventListener('mousemove', cursor);
    function cursor(e) {
      mouse.style.top = e.pageY + 'px';
      mouse.style.left = e.pageX + 'px';
    }

    // this.preloaderArray.forEach( el => {
    //   el.addEventListener("click",async  (e) => {
    //     // e.preventDefault()

    //     const t1 = gsap.timeline({ delay: .5 });
    //     t1.to(".section-loader", {
    //       ease: "power4.in",
    //       display: "block"
    //       }).to('.section-loader-1', {duration: 1, ease: "power4.in",y: '100%' }).to('.section-loader-2', { duration:1,  ease: "power4.in",y: '-100%'}).to(".loader", {
    //         duration: .5,
    //         ease: "power4.in",
    //         display: "block",
    //         opacity: 1
    //       }).to(".loader-line", {
    //         duration: 1,
    //         ease: "power4.in",
    //         x: "50%"
    //       }).to(".section-loader", {
    //         duration: .5,
    //         ease: "power4.in",
    //         display: "none"
    //       })

    //       //       //     document.addEventListener('DOMContentLoaded', ()=> {

    // //       //  }, false);
    //   });
    // });
  }

  events() {
    this.intro();

    this.skipIntro.addEventListener('click', e => {
      this.skipToHome();
      this.topFunction();
      gsap.to('.section-onboard', { display: 'none' });
    });
    this.skipIntroBtn.addEventListener('click', e => {
      this.skipToHome();
      this.topFunction();
      gsap.to('.section-onboard', { display: 'none' });
    });

    this.screemOne.addEventListener('click', e => {
      const t1 = gsap.timeline({ delay: 0.5 });

      t1.to(
        '.board-1',
        {
          duration: 1,
          x: '-100%',
          ease: 'power4.in'
        },
        '-=1'
      )
        .to('.board-1', {
          duration: 0.2,
          display: 'none'
        })
        .fromTo(
          '.board-2',
          { x: '-100%' },
          { duration: 0.5, x: '0%', display: 'flex', opacity: 1 },
          '+=.3'
        );
    });
    this.screemTwo.addEventListener('click', e => {
      const t1 = gsap.timeline({ delay: 0.5 });

      t1.to(
        '.board-2',
        {
          duration: 1,
          x: '-100%',
          ease: 'power4.in'
        },
        '-=1'
      )
        .to('.board-2', {
          duration: 0.2,
          display: 'none'
        })
        .fromTo(
          '.board-3',
          { x: '-100%' },
          { duration: 0.5, x: '0%', display: 'flex', opacity: 1 },
          '+=.3'
        );
    });
  }
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
  skipToHome() {
    const t1 = gsap.timeline({ delay: 0.5 });

    t1.to('.section-onboard', {
      duration: 0.5,
      x: '-100%',
      display: 'none',
      ease: 'power4.in'
    });
  }
  intro() {
    const t1 = gsap.timeline({ delay: 0 });

    t1.to('.section-onboard', { display: 'flex' })
      // .to(".board-welcome-heading", {
      //     zIndex: 800,
      //     duration: 3,
      //     text: "  Let the Travel Begin ...",
      //     opacity: 1,
      //     display: "none",
      //   })
      // .to(
      //   '.board-welcome-screen-1',
      //   {
      //     duration: 1,
      //     y: '-50vh',
      //     display: 'none',
      //     ease: 'power4.in'
      //   },
      //   '+=1'
      // )
      // .to(
      //   '.board-welcome-screen-2',
      //   {
      //     duration: 1,
      //     y: '50vh',
      //     display: 'none',
      //     ease: 'power4.in'
      //   },
      //   '-=1'
      // )
      .to('.skip-text-loading', {
        duration: 4,
        text: '  Loading ...'
      })
      .to(
        '.board-welcome',
        {
          duration: 0.5,
          ease: 'power4.in',
          x: '-100%',
          display: 'none'
        },
        '-=1.5'
      )
      .fromTo(
        '.board-1',
        { x: '-100%' },
        { duration: 0.5, x: '0%', display: 'flex', opacity: 1 },
        '-=1'
      );

    // .fromTo(".section-header", { opacity: 0 }, { opacity: 1 });
  }
}

module.exports = Intro;
