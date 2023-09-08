import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';

//Cargar Variables
dotenv.config();

//Arrancar server
const app = express();

app.use(express.static('public'));
app.use(express.json());

//Ruta home
app.get('/', (req, res) =>{
    res.sendFile('index.html', {root: 'public'});
});

//Success
app.get('/success', (req, res) =>{
    res.sendFile('success.html', {root: 'public'});
});

//cancel
app.get('/cancel', (req, res) =>{
    res.sendFile('cancel.html', {root: 'public'});
});

//stripe
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req, res) => {
    const lineItems = req.body.items.map((item) =>{
        const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") *100);
        console.log('Precio del articulo:' , item.price);
        console.log("Importe unitario:", unitAmount);
        return {
            price_data: {
                currency: 'GTQ',
                product_data: {
                    name: item.title,
                    images: [item.productImg]
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        };
    });
    console.log("Rubros", lineItems);

    //Crear sesion de checkout
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${DOMAIN}success`,
        cancel_url: `${DOMAIN}cancel`,
        line_items: lineItems,
        //Preguntar direccion en stripe pagina del checkout
        billing_address_collection: 'required'
    });
    res.json( session.url);
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000;');
});

//para que acepte los archivos de css y js
app.use('/public', express.static('public', { 'extensions': ['html', 'css'] }));
