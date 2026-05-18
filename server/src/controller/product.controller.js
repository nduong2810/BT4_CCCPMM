import Product from '../model/product.model.js';

export const getProducts = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, sort, limit, exclude } = req.query;
        let query = {};

        if (keyword) query.name = { $regex: keyword, $options: 'i' };
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (exclude) query._id = { $ne: exclude };

        let sortOption = {};
        if (sort) {
            const parts = sort.split(':');
            sortOption[parts[0]] = parts[1] === '-1' ? -1 : 1;
        } else {
            sortOption.createdAt = -1;
        }

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(limit ? Number(limit) : 20);

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy" });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// Hàm tạo dữ liệu tự động
export const seedProducts = async (req, res) => {
    try {
        const mockProducts = [
            {
                "name": "Overture Automatique",
                "description": "Mang trong mình bộ máy cơ tự động tinh xảo...",
                "price": 462500000,
                "category": "Nam",
                "countInStock": 12,
                "sold": 150,
                "images": [
                    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop"
                ]
            },
            // ... bạn có thể copy thêm các sản phẩm mẫu từ câu trước vào đây
        ];

        await Product.deleteMany({});
        const createdProducts = await Product.insertMany(mockProducts);
        res.status(201).json({ message: "Seed data thành công!", createdProducts });
    } catch (error) {
        res.status(500).json({ message: "Lỗi seed data", error: error.message });
    }
};