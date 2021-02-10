/* eslint-disable */

import gsap from 'gsap';

class WishList{
    constructor(){
        this.wishBtn =document.querySelector('.accounts-wishlist-itemsMenu');
        this.wishMenu =document.querySelector('#wish');
        this.addtoWish = document.querySelector('#addtowishlist');
        this.events();
    }

    events(){
        this.addtoWish.addEventListener('click', this.addtowishCart);
        this.wishBtn.addEventListener('click', this.displayMenu);
    }

    addtowishCart(e){
        console.log(e.target);
   }
    displayMenu(e) {
        if (!e.target.classList.contains('active')) {
          e.target.classList.add('active');
          gsap.to('.accounts-wishlist-itemsMenu', 0.5, {
             background: 'black',
          });
    
           gsap.to('#wish', 1, { right: '0%' });
          document.body.classList.add('hide');
        } else {
          e.target.classList.remove('active');
           gsap.to('.accounts-wishlist-itemsMenu', 0.5, {
            background: 'black',

        });
    
        gsap.to('#wish', 1, { right: '-25%' });
        document.body.classList.remove('hide');
        }
      }
}

module.exports= WishList;
