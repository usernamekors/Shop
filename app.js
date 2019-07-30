const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
let buttonsDOM = [];

class Products{
async getProducts(){
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item=>{
                const {title,price} = item.fields;
                const {id} = item.sys
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}

class UI{
    displayProducts(products){

        let result = '';

        products.forEach(product => {
            result+=`
            <aricle class = "product">
                <div class = "img-container">
                <img src = ${product.image} alt = "camp-one" class = "product-img">
                <button class = "bag-btn" data-id = ${product.id}>
                <i class = "fas fa-shopping-cart"></i>
                    add to cart
                </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price} PLN</h4>
            </aricle>
            `;
        });
        productsDOM.innerHTML = result;
    }

    getBagButton(){
            const buttons = [...document.querySelectorAll('.bag-btn')];
            buttonsDOM = buttons;
            buttons.forEach(button=>{
                let id = button.dataset.id;
                let inCart = cart.find(item => item.id === id);
                if(inCart){
                    button.textContent= 'In Cart';
                    button.disabled= true;
                }
                button.addEventListener('click',(e)=>{
                    e.target.textContent= 'In Card';
                    e.target.disabled= true;

                    let cartItem = {...Storage.getProduct(id), amount: 1};

                    cart = [...cart,cartItem];

                    Storage.saveCart(cart);

                    this.setCartValues(cart);

                    this.addCartItem(cartItem);

                    this.showCart();
                });
            });
    }
        setCartValues(cart){
            let tempTotal = 0;
            let itemsTotal = 0;
            cart.map(item=>{
                tempTotal+=item.price*item.amount;
                itemsTotal+=item.amount;
            });
            cartTotal.textContent = parseFloat(tempTotal.toFixed(2));
            cartItems.textContent = itemsTotal;
        }

        addCartItem(item){
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML= `
                    <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price} PLN</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;
            cartContent.appendChild(div);
        }

        showCart(){
            cartOverlay.classList.add('transparentBcg');
            cartDOM.classList.add('showCart');
        }

        setupAPP(){
            cart=Storage.getCart();
            this.setCartValues(cart);
            this.populateCart(cart);
            cartBtn.addEventListener('click',this.showCart);
            closeCartBtn.addEventListener('click',this.hideCart)
        }
        populateCart(cart){
        cart.forEach(item=>this.addCartItem(item));
        }
        hideCart(){
            cartOverlay.classList.remove('transparentBcg');
            cartDOM.classList.remove('showCart');
        }
        cartLogic(){
            clearCartBtn.addEventListener('click', ()=>{
                this.clearCart();
            });
        }
        clearCart(){
            let cartItems = cart.map(item => item.id);
            cartItems.forEach(id=>this.removeItem(id));
            console.log(cartContent.children);
            
            while(cartContent.children.length>0){
                cartContent.removeChild(cartContent.children[0])
            }
            this.hideCart()
        }
        removeItem(id){
            cart=cart.filter(item=>item.id !== id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            let button = this.getSingleButton(id);
            button.disable =false;
            button.innerHTML=`<i class="fas fa-shopping-cart"></i>add to cart`;
        }
        getSingleButton(id){
            return buttonsDOM.find(button=>button.dataset.id===id);
        }
}

class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id===id);
    }
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();

    products.getProducts().then(products =>{
    ui.displayProducts(products);
    Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButton();
        ui.cartLogic();
    });
});