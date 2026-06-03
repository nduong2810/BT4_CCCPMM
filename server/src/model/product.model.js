import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    images: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
