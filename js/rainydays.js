import ShoppingCart from './cart.js';

class RainyDaysAPI {
    constructor() {
        this.baseUrl = 'https://v2.api.noroff.dev/rainy-days';
    }

    async getAllJackets() {
        try {
            const response = await fetch(this.baseUrl);
            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching jackets:', error);
            return [];
        }
    }

    async getJacketById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching jacket ${id}:`, error);
            return null;
        }
    }
}

class Product {
    constructor(productData) {
        Object.assign(this, productData);
    }

    getFormattedPrice() {
        if (this.onSale) {
            return `$${this.discountedPrice.toFixed(2)}`;
        }
        return `$${this.price.toFixed(2)}`;
    }

    getSlug() {
        return this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
}

class PageRenderer {
    constructor() {
        this.api = new RainyDaysAPI();
        this.cart = new ShoppingCart();
    }

    async renderCollectionPage(gender) {
        const jackets = await this.api.getAllJackets();
        const filteredJackets = jackets.filter(jacket => 
            jacket.gender.toLowerCase() === gender.toLowerCase()
        );
        const products = filteredJackets.map(jacket => new Product(jacket));
        
        document.title = `RainyDays - ${gender}'s Collection`;
        document.querySelector('main').innerHTML = this.generateCollectionHTML(products);
    }

    async renderProductPage(productId) {
        try {
            const productData = await this.api.getJacketById(productId);
            if (productData) {
                const product = new Product(productData);
                document.title = `RainyDays - ${product.title}`;
                document.querySelector('main').innerHTML = this.generateProductHTML(product);
                this.setupProductPageListeners(product);  // Pass the product data
            } else {
                document.querySelector('main').innerHTML = '<p>Product not found</p>';
            }
        } catch (error) {
            console.error('Error rendering product:', error);
            document.querySelector('main').innerHTML = '<p>Error loading product. Please try again later.</p>';
        }
    }

    generateCollectionHTML(products) {
        return `
            <div class="jackets-container">
                ${products.map(product => `
                    <div class="jackets">
                        <a href="/html/product.html?id=${product.id}">
                            <img src="${product.image.url}" alt="${product.image.alt}">
                        </a>
                        <h4>${product.title} ${product.getFormattedPrice()}</h4>
                        ${product.onSale ? '<span class="sale-tag">On Sale!</span>' : ''}
                    </div>
                `).join('')}
            </div>`;
    }

    generateProductHTML(product) {
        const priceDisplay = product.onSale 
            ? `<div class="price"><span class="original-price">$${product.price.toFixed(2)}</span> <span class="sale-price">$${product.discountedPrice.toFixed(2)}</span></div>`
            : `<div class="price">$${product.price.toFixed(2)}</div>`;
    
        return `
            <div class="jacket-info">
                <img src="${product.image.url}" alt="${product.image.alt}">
                
                <h2>${product.title}</h2>
                ${priceDisplay}
                
                <h3>${product.description}</h3>
                
                <div class="product-checkout-info">
                    <div class="size-selection">
                        <h4>Available sizes:</h4>
                        <select class="size" name="size" required>
                            <option value="">Select Size</option>
                            ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="product-details">
                        <p>Color: ${product.baseColor}</p>
                        <p>Gender: ${product.gender}</p>
                        ${product.favorite ? '<p class="favorite">⭐ Popular Choice</p>' : ''}
                        <p class="tags">Tags: ${product.tags.join(', ')}</p>
                    </div>
                </div>
    
                <button class="button add-to-cart-btn" data-product-id="${product.id}">
                    <h2>Add to cart</h2>
                </button>
                <div class="bottom-spacer"></div>
            </div>`;
    }
    
    setupProductPageListeners(product) {
        const sizeSelect = document.querySelector('select.size');
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                if (!sizeSelect.value) {
                    alert('Please select a size before adding to cart');
                    return;
                }
    
                this.cart.addItem(product, sizeSelect.value);
                alert('Added to cart successfully!');
            });
        }
    }

    generatePriceHTML(product) {
        if (product.onSale) {
            return `
                <div class="price">
                    <h2 class="original-price">$${product.price.toFixed(2)}</h2>
                    <h2 class="sale-price">$${product.discountedPrice.toFixed(2)}</h2>
                </div>`;
        }
        return `<h2>$${product.price.toFixed(2)}</h2>`;
    }
}

export { RainyDaysAPI, Product, PageRenderer };