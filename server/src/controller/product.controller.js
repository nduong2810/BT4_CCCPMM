import Product from '../model/product.model.js';

const buildProductQuery = ({ keyword, category, minPrice, maxPrice }) => {
    const query = {};

    if (keyword && keyword.trim()) {
        query.name = { $regex: keyword.trim(), $options: 'i' };
    }

    if (category && category.trim()) {
        query.category = category.trim();
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (!Number.isNaN(min) && minPrice !== undefined && minPrice !== '') {
        query.price = { ...(query.price || {}), $gte: min };
    }

    if (!Number.isNaN(max) && maxPrice !== undefined && maxPrice !== '') {
        query.price = { ...(query.price || {}), $lte: max };
    }

    return query;
};

const buildSortQuery = (sort) => {
    if (!sort) return { createdAt: -1 };

    const [field, order] = sort.split(':');
    const allowedFields = ['price', 'sold', 'views', 'createdAt', 'name'];

    if (!allowedFields.includes(field)) return { createdAt: -1 };

    return { [field]: Number(order) === 1 ? 1 : -1 };
};

export const getProducts = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, sort } = req.query;
        const query = buildProductQuery({ keyword, category, minPrice, maxPrice });
        const sortQuery = buildSortQuery(sort);

        const products = await Product.find(query).sort(sortQuery);

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error: error.message });
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

export const getHomeProducts = async (req, res) => {
    try {
        // 1. Lấy 4 sản phẩm mới nhất (sắp xếp theo createdAt giảm dần)
        const latest = await Product.find().sort({ createdAt: -1 }).limit(4);

        // 2. Lấy 4 sản phẩm bán chạy nhất (sắp xếp theo sold giảm dần)
        const bestSellers = await Product.find().sort({ sold: -1 }).limit(4);

        // 3. Lấy 4 sản phẩm khuyến mãi
        const promotions = await Product.find({ discount: { $gt: 0 } }).sort({ discount: -1 }).limit(4);

        return res.status(200).json({
            success: true,
            data: {
                latest,
                bestSellers,
                promotions
            }
        });
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
                "stock": 12,
                "countInStock": 12,
                "sold": 150,
                "views": 0,
                "discount": 0,
                "images": [
                    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop"
                ]
            },
        ];

        await Product.deleteMany({});
        const createdProducts = await Product.insertMany(mockProducts);
        res.status(201).json({ message: "Seed data thành công!", createdProducts });
    } catch (error) {
        res.status(500).json({ message: "Lỗi seed data", error: error.message });
    }
};

export const getProductsLazyLoad = async (req, res) => {
    try {
        const {
            keyword,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 4
        } = req.query;

        const query = buildProductQuery({ keyword, category, minPrice, maxPrice });
        const sortQuery = buildSortQuery(sort);
        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.max(Number(limit) || 4, 1);
        const skipDocs = (pageNumber - 1) * limitNumber;

        const products = await Product.find(query)
            .sort(sortQuery)
            .skip(skipDocs)
            .limit(limitNumber);

        const totalProducts = await Product.countDocuments(query);
        const hasMore = skipDocs + products.length < totalProducts;

        return res.status(200).json({
            success: true,
            products,
            hasMore,
            totalProducts
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải phân trang", error: error.message });
    }
};

export const getTopHighlights = async (req, res) => {
    try {
        // Lấy 10 sản phẩm có số lượng 'sold' lớn nhất
        const topSold = await Product.find().sort({ sold: -1 }).limit(10);

        // Lấy 10 sản phẩm có số lượng 'views' lớn nhất
        const topViews = await Product.find().sort({ views: -1 }).limit(10);

        return res.status(200).json({
            success: true,
            data: {
                topSold,
                topViews
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu nổi bật", error: error.message });
    }
};
