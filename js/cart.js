class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.onCartUpdate = null;
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('rainydays_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage and trigger update
    saveCart() {
        localStorage.setItem('rainydays_cart', JSON.stringify(this.items));
        this.triggerUpdate();
    }

    // Add item to cart
    addItem(product, size) {
        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.onSale ? product.discountedPrice : product.price,
            size: size,
            image: product.image,
            quantity: 1
        };

        const existingItem = this.items.find(item => 
            item.id === cartItem.id && item.size === cartItem.size
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(cartItem);
        }

        this.saveCart();
        return true;
    }

    // Remove item from cart
    removeItem(id, size) {
        this.items = this.items.filter(item => !(item.id === id && item.size === size));
        this.saveCart();
    }

    // Update item quantity
    updateQuantity(id, size, quantity) {
        const item = this.items.find(item => item.id === id && item.size === size);
        if (item && quantity > 0) {
            item.quantity = quantity;
            this.saveCart();
            return true;
        }
        return false;
    }

    // Get total number of items
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get all items in cart
    getItems() {
        return [...this.items];
    }

    // Get specific item
    getItem(id, size) {
        return this.items.find(item => item.id === id && item.size === size);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
    }

    // Set update callback
    setUpdateCallback(callback) {
        this.onCartUpdate = callback;
    }

    // Trigger update callback
    triggerUpdate() {
        if (this.onCartUpdate) {
            this.onCartUpdate(this.items);
        }
    }
}

export default ShoppingCart;